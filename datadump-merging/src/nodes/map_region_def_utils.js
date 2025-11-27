import { MapType, transformIngameToMapPosition } from "./processing_utils.js";

/** @typedef {import("./process_node_locs.js").Vec2} Vec2 */
/** typedef {import("./process_node_locs.js").MapType} MapType */
/** typedef {typeof (import("./processing_utils.js")._MapTypeType)[keyof (import("./processing_utils.js")._MapTypeType)]} MapType */
/** @typedef {typeof MapType[keyof typeof MapType]} MapType */

/** @typedef {{
 *      name: string,
 *      priority?: number,
 *      mustAlsoBeInRegions?: string[],
 * }} _SharedRegionProperties */

/** @typedef {(
 *  ({
 *      type: "function",
 *      containsMapPos: (mapPos: Vec2) => boolean,
 *  } & _SharedRegionProperties)
 *  | {
 *      type: "voronoi",
 *      voronoiGroupId: string,
 *      regions: ({
 *          centerpoint: Vec2,
 *      } & _SharedRegionProperties)[]
 *  }
 * ) & (
 *  {
 *      dimension: MapType,
 *  }
 * )} RegionDefinition */

/** @type {RegionDefinition[]} */
const regionDefinitions = [
    // rainbow island  (designed with https://www.desmos.com/calculator/qiopwepyxq)
    {
        type: "voronoi",
        dimension: MapType.overworld,
        voronoiGroupId: "mapVoronoiRainbowIslands",
        regions: [
            {
                name: "mapVoronoiRainbowIslandGorge",
                centerpoint: { y: -448, x: -321 },
                priority: 1
            },
            {
                name: "mapVoronoiRainbowIslandFields",
                centerpoint: { y: 265, x: -298 },
                priority: 1,
            },
            {
                name: "mapVoronoiRainbowIslandBluffs",
                centerpoint: { y: -530, x: -1878 },
                priority: 1
            },
            {
                name: "mapVoronoiRainbowIslandStrand",
                centerpoint: { y: -3, x: 175 },
                priority: 1
            },
        ]
    },

    // conservatory expansions  (designed with https://www.desmos.com/calculator/haxsu9jxep)
    {
        type: "function",
        name: "mapRegionRainbowIslandConservatory",
        dimension: MapType.overworld,
        priority: 3,
        mustAlsoBeInRegions: [ "mapVoronoiRainbowIslandFields" ],
        containsMapPos: (mapPos) => mapPos.y > 0.1 * mapPos.x + 450
    },
    {
        type: "voronoi",
        dimension: MapType.overworld,
        voronoiGroupId: "mapVoronoiConservatoryExpansions",
        regions: [
            {
                name: "mapVoronoiExpansionConservatory",
                centerpoint: { y: 564, x: -258 },
                priority: 5,
                mustAlsoBeInRegions: [ "mapRegionRainbowIslandConservatory" ]
            },
            {
                name: "mapVoronoiExpansionGully",
                centerpoint: { y: 583.7, x: -566.6 },
                priority: 5,
                mustAlsoBeInRegions: [ "mapRegionRainbowIslandConservatory" ]
            },
            {
                name: "mapVoronoiExpansionTidepools",
                centerpoint: { y: 735, x: -569 },
                priority: 5,
                mustAlsoBeInRegions: [ "mapRegionRainbowIslandConservatory" ]
            },
            {
                name: "mapVoronoiExpansionArchway",
                centerpoint: { y: 738.5, x: -236.4 },
                priority: 5,
                mustAlsoBeInRegions: [ "mapRegionRainbowIslandConservatory" ]
            },
            {
                name: "mapVoronoiExpansionDen",
                centerpoint: { y: 612.3, x: -147.4 },
                priority: 5,
                mustAlsoBeInRegions: [ "mapRegionRainbowIslandConservatory" ]
            },
            {
                name: "mapVoronoiExpansionDigsite",
                centerpoint: { y: 555, x: 18 },
                priority: 5,
                mustAlsoBeInRegions: [ "mapRegionRainbowIslandConservatory" ]
            },
        ]
    },

    // labyrinth
    {
        type: "function",
        name: "mapRegionLabyrinthCore",
        dimension: MapType.labyrinth,
        containsMapPos: mapPos => (mapPos.x < 229 && mapPos.y > 2100)
    }
];

/** @typedef {Extract<RegionDefinition, { type: "voronoi" }>["regions"][number]} _VoronoiRegionDef */

const _voronoiRegionFns = Object.fromEntries(regionDefinitions.map(def => {
    if(def.type !== "voronoi") return null;
    /** @type {[string, (mapPos: Vec2) => _VoronoiRegionDef]} */
    const result = [def.voronoiGroupId, (mapPos) => {
        // note: if on edge or point (equidistant from two or more regions),
        //   region tiebreaking decision is not well-defined
        const withSqDists = def.regions.map(voronoiRegionDef => {
            const { x: rcx, y: rcy } = voronoiRegionDef.centerpoint;
            return {
                baseRegionDef: def,
                voronoiRegionDef: voronoiRegionDef,
                sqDist: Math.pow(mapPos.x - rcx, 2) + Math.pow(mapPos.y - rcy, 2)
            };
        }).sort((a, b) => a.sqDist - b.sqDist);
        const chosen = withSqDists[0];
        // return { baseRegionDef: chosen.baseRegionDef, voronoiRegionDef: chosen.voronoiRegionDef };
        return chosen.voronoiRegionDef;
    }];
    return result;
}).filter(e => e !== null));


export function getMapRegionsContaining(/** @type {Vec2} */ mapPos, /** @type {MapType | undefined} */ dimension = undefined) {
    /** @type {(_VoronoiRegionDef | Exclude<RegionDefinition, { type: "voronoi" }>)[]} */
    let results = [];
    const voronoiInclusionCache = { };
    regionDefinitions.forEach(def => {
        if(dimension && def.dimension !== dimension) return;
        if(def.type === "voronoi") {
            if(!voronoiInclusionCache[def.voronoiGroupId]) {
                // get which region of the voronoi this map pos is contained within
                const voronoiRegion = _voronoiRegionFns[def.voronoiGroupId](mapPos);
                voronoiInclusionCache[def.voronoiGroupId] = voronoiRegion;
                results.push(voronoiRegion);
            }
        }
        else {
            if(def.containsMapPos(mapPos)) {
                results.push(def);
            }
        }
    });

    let prevLength = -1;
    // keep filtering the results array for required regions until its contents stop changing
    while(prevLength !== results.length) {
        prevLength = results.length;
        let premodifArray = [...results];
        results = results.filter(def => {
            if(def.mustAlsoBeInRegions && !def.mustAlsoBeInRegions.every(reqRegionName => premodifArray.some(def => def.name === reqRegionName))) {
                // results array was missing one or more other regions required by this def; remove this def.
                return false;
            }
            // otherwise, keep this def.
            return true;
        });
    }

    // return the regions sorted by priority, highest first
    const _sortPriorityHighestFirst = (a, b) => (b.priority || 0) - (a.priority || 0);
    return results.sort(_sortPriorityHighestFirst);
}