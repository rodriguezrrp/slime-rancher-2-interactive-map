import { MapType, transformIngameToMapPositions } from "./processing_utils.js";

// For extracted items that are unused / unobtainable / out of bounds,
// I suspect they came from extra scene files (for testing?) that are
// in the game assets and do not seem to be part of the playable area of the game.
const keyCannotIncludeAsSubstring = [
    "gordo0437136615",  // Batty Gordo from coreSceneLabyrinth -- seems to be unused / unobtainable / out of bounds?
    "gordo0553712223",  // Dervish Gordo from coreSceneLabyrinth -- seems to be unused / unobtainable / out of bounds?
    "gordo1865116509",  // Quantum Gordo from coreSceneLabyrinth -- seems to be unused / unobtainable / out of bounds?
    "gordo1649061164",  // Rad Gordo from coreSceneLabyrinth -- seems to be unused / unobtainable / out of bounds?
    "gordo0026007518",  // Tangle Gordo from coreSceneLabyrinth -- seems to be unused / unobtainable / out of bounds?

    "stabilizinggate0654469445",  // seems to be unused / unobtainable / out of bounds?
    "stabilizinggate1617779913",  // seems to be unused / unobtainable / out of bounds?
    "stabilizinggate0344923807",  // seems to be unused / unobtainable / out of bounds?

    // "gigihologram_x82_y2225",  // seems to be unused / unobtainable / out of bounds?
    // "gigihologram_x134_y2247",  // seems to be unused / unobtainable / out of bounds?

    "startPoint_x739_y155",  // Projector puzzle start point -- seems to be unused / unobtainable / out of bounds?
    "endPoint_x740_y183",  // Projector puzzle end point -- seems to be unused / unobtainable / out of bounds?
    "startPoint_x-513_y-1039",  // Projector puzzle start point -- seems to be unused / unobtainable / out of bounds?
    "endPoint_x-486_y-1065",  // Projector puzzle end point -- seems to be unused / unobtainable / out of bounds?
];
const keyDisallowedSubstringRegex = new RegExp(`(${keyCannotIncludeAsSubstring.join('|')})`);

/**
 * In the case that some specific entries get extracted that should not be exported, catch them (or modify them) with this function.
 * @template {Record<string, any>} T
 * @param {string} targetFileName 
 * @param {string} key 
 * @param {T} obj 
 * @returns {boolean | T}
*/
export function entryExportFilter(targetFileName, key, obj) {

    // if(keyCannotIncludeAsSubstring.some(substr => key.includes(substr))) {
    if(keyDisallowedSubstringRegex.test(key)) {
        return false;
    }

    // get all keys of Vec2s or arrays of Vec2s
    const posKeys = Object.keys(obj).filter(k => (
        (typeof obj[k] === "object" && typeof obj[k].x === "number" && typeof obj[k].y === "number" && typeof obj[k].z === "undefined")
        ? k
        : (obj[k] && Array.isArray(obj[k])
            && Object.values(obj[k]).every(v => (typeof v.x === "number" && typeof v.y === "number" && typeof v.z === "undefined")))
        ? k
        : null
    ));

    let isExclusivelyLabyrinthData = /(shadow|gigi|nullifier|stabiliz|projector)/i.test(targetFileName);

    const dimension = (obj.dimension === MapType.labyrinth || isExclusivelyLabyrinthData)
        ? MapType.labyrinth
        : MapType.overworld;

    // shift position(s) if applicable
    if(posKeys !== null) {
        // console.log(targetFileName, key);
        // console.log(obj);
        obj = { ...obj };
        let posAltered = false;
        const alterPos = (oldPos) => {
            // const newPos = shiftMapPosIfInsideRealCoreArea(oldPos);
            const newPos = applyAnyRegionPosShift(oldPos, dimension);
            if(newPos && (newPos !== oldPos || newPos.x !== oldPos.x || newPos.y !== oldPos.y)) {
                posAltered = true;
                return newPos;
            }
            else return oldPos;
        }
        for(const posKey of posKeys) {
            if(Array.isArray(obj[posKey])) {
                obj[posKey] = obj[posKey].map(alterPos);
            }
            else {
                obj[posKey] = alterPos(obj[posKey]);
            }
        }
        // console.log(obj);
        // throw new Error();

        // because teleport lines, update midpoint in case positions changed
        if(posAltered && /(teleport(er)?_?line)/i.test(targetFileName) && obj.midpoint) {
            const [ pos1, pos2 ] = obj.positions;
            obj.midpoint = { x: (pos1.x + pos2.x) / 2, y: (pos1.y + pos2.y) / 2 };
        }

        if(obj.internalId === "ResearchDroneGorgeRuinedOverlook") {
            // I cannot tell why this one extracts at a position to the south over the water...
            // manually setting it.
            obj.pos = { x: -311, y: -307 };
        }

        return obj;
    }

    // export the entry as-is
    return true;

}

/** @typedef {import("./process_node_locs.js").Vec2} Vec2 */
/** @typedef {import("./process_node_locs.js").MapType} MapType */
/** @typedef {(
 *  {
 *      type: "function",
 *      name?: string,
 *      containsMapPos: (originalMapPos: Vec2) => boolean,
 *      mapPosTransform: (originalMapPos: Vec2) => Vec2,
 *      priority?: number,
 *  }
 *  | {
 *      type: "voronoi",
 *      voronoiGroupId: string,
 *      regions: {
 *          name?: string,
 *          centerpoint: Vec2,
 *          mapPosTransform: (originalMapPos: Vec2) => Vec2,
 *          priority?: number,
 *      }[]
 *  }
 * ) & (
 *  {
 *      dimension: MapType,
 *  }
 * )} RegionDefinition */

/** @type {RegionDefinition[]} */
const regionDefinitions = [
    {
        type: "bounded",
        name: "mapRegionLabyrinthCore",
        dimension: MapType.labyrinth,
        containsMapPos: originalMapPos => (originalMapPos.x < 229 && originalMapPos.y > 2100),
        // inside roughly-defined region of the northeast corner of labyrinth map;
        // Offset appropriately, based on the apparent center of the core versus the real center,
        // to look like it's in the core of the ingame map
        mapPosTransform: originalMapPos => ({
            x: originalMapPos.x + (_approxMapCoreCenterPosition.x - _realUnstableCoreMeshPosition.x),
            y: originalMapPos.y + (_approxMapCoreCenterPosition.y - _realUnstableCoreMeshPosition.y)
        })
    }
];

/** @typedef {Extract<RegionDefinition, { type: "voronoi" }>["regions"][number]} _VoronoiRegionDef */

const _voronoiRegionFns = Object.fromEntries(regionDefinitions.map(def => {
    if(def.type !== "voronoi") return null;
    /** @type {[string, (originalMapPos: Vec2) => _VoronoiRegionDef]} */
    const result = [def.voronoiGroupId, (originalMapPos) => {
        // note: if on edge or point (equidistant from two or more regions),
        //   region tiebreaking decision is not well-defined
        const withSqDists = def.regions.map(voronoiRegionDef => {
            const { x: rcx, y: rcy } = voronoiRegionDef.centerpoint;
            return {
                baseRegionDef: def,
                voronoiRegionDef: voronoiRegionDef,
                sqDist: Math.pow(originalMapPos.x - rcx, 2) + Math.pow(originalMapPos.y - rcy, 2)
            };
        }).sort((a, b) => a.sqDist - b.sqDist);
        const chosen = withSqDists[0];
        // return { baseRegionDef: chosen.baseRegionDef, voronoiRegionDef: chosen.voronoiRegionDef };
        return chosen.voronoiRegionDef;
    }];
    return result;
}).filter(e => e !== null));

// const _voronoiCache = Object.fromEntries(
//     Object.entries(
//         regionDefinitions.reduce((accum, def) => {
//             if(def.type !== "voronoi") return;
//             accum[def.voronoiGroupId] ??= [];
//             accum[def.voronoiGroupId].push(def);
//         }, { })
//     )
//     .map((/** @type {[string, RegionDefinition[]]} */ [voronoiGroupId, voronoiGroup]) => {
//         /** @type {(pos: Vec2) => RegionDefinition} */
//         const insideRegion = (pos) => {
//             // note: if on edge or point (equidistant from two or more regions),
//             //   region decision is arbitrary
//             const withSqDists = voronoiGroup.map(region => {
//                 const { x: rcx, y: rcy } = region.centerpoint;
//                 return { region, sqDist: Math.pow(pos.x - rcx, 2) + Math.pow(pos.y - rcy, 2) };
//             }).sort((a, b) => a.sqDist - b.sqDist);
//             return withSqDists[0].region;
//         };
//         return [voronoiGroupId, { group: voronoiGroup, insideRegion: insideRegion }];
//     })
// );

const _realUnstableCoreMeshPosition = transformIngameToMapPositions({ x: 2245.869162606233, y: 97.43239, z: -121.29875198047512 });
const _approxMapCoreCenterPosition = { x: 256, y: 1456 };

// function shiftMapPosIfInsideRealCoreArea(/** @type {Vec2} */ originalMapPos) {
//     if(originalMapPos.x < 229 && originalMapPos.y > 2100) {
//         // inside roughly-defined region of the northeast corner of labyrinth map;
//         // Offset appropriately, based on the apparent center of the core versus the real center,
//         // to look like it's in the core of the ingame map
//         return {
//             x: originalMapPos.x + (_approxMapCoreCenterPosition.x - _realUnstableCoreMeshPosition.x),
//             y: originalMapPos.y + (_approxMapCoreCenterPosition.y - _realUnstableCoreMeshPosition.y)
//         };
//     }
//     return originalMapPos;
// }

export function applyAnyRegionPosShift(/** @type {Vec2} */ originalMapPos, /** @type {MapType | undefined} */ dimension = undefined) {
    let region = getMapRegionInside(originalMapPos, dimension);
    if(region) {
        return region.mapPosTransform(originalMapPos);
    }
    return originalMapPos;
}

export function getMapRegionInside(/** @type {Vec2} */ originalMapPos, /** @type {MapType | undefined} */ dimension = undefined) {
    /** @type {(_VoronoiRegionDef | Exclude<RegionDefinition, { type: "voronoi" }>)[]} */
    const results = [];
    const voronoiInclusionCache = { };
    regionDefinitions.forEach(def => {
        if(dimension && def.dimension !== dimension) return;
        if(def.type === "voronoi") {
            if(!voronoiInclusionCache[def.voronoiGroupId]) {
                const voronoiRegion = _voronoiRegionFns[def.voronoiGroupId](originalMapPos);
                voronoiInclusionCache[def.voronoiGroupId] = voronoiRegion;
                results.push(voronoiRegion);
            }
        }
        else {
            if(def.containsMapPos(originalMapPos)) {
                results.push(def);
            }
        }
    });
    // return the one with highest priority number
    return results.sort((a, b) => (a.priority || 0) - (b.priority || 0)).pop();
}