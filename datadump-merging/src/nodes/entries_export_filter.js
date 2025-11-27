import { MapType, transformIngameToMapPosition } from "./processing_utils.js";
import { getMapRegionsContaining } from "./map_region_def_utils.js";

// For extracted items that are unused / unobtainable / out of bounds,
// I suspect they came from extra scene files (for testing?) that are
// in the game assets and do not seem to be part of the playable area of the game.
const keyCannotIncludeAsSubstring = [
    "gordo0437136615",  // Batty Gordo from coreSceneLabyrinth -- seems to be unused / unobtainable / out of bounds?
    "gordo0553712223",  // Dervish Gordo from coreSceneLabyrinth -- seems to be unused / unobtainable / out of bounds?
    "gordo1865116509",  // Quantum Gordo from coreSceneLabyrinth -- seems to be unused / unobtainable / out of bounds?
    "gordo1649061164",  // Rad Gordo from coreSceneLabyrinth -- seems to be unused / unobtainable / out of bounds?
    "gordo0026007518",  // Tangle Gordo from coreSceneLabyrinth -- seems to be unused / unobtainable / out of bounds?

    "pod0114507721",  // from environmentGorge -- "treasurePod Drones" -- seems to be missing / not a treasure pod? possibly related to quantum drones?
    "pod1415751309",  // from coreSceneLabyrinth -- "treasurePod Rank1" -- far southeast over the ocean; unused / unobtainable / out of bounds?
    "pod1789192471",  // from zoneBluffsWeather -- "treasurePod Drones" -- seems to be missing / not a treasure pod? possibly related to quantum drones?
    "pod1976730192",  // from coreSceneLabyrinth -- "treasurePod Rank1 (1)" -- far southeast over the ocean; unused / unobtainable / out of bounds?

    "stabilizinggate0654469445",  // seems to be unused / unobtainable / out of bounds?
    "stabilizinggate1617779913",  // seems to be unused / unobtainable / out of bounds?
    "stabilizinggate0344923807",  // seems to be unused / unobtainable / out of bounds?

    // Note: these gigi holograms actually are in the game; they were positioned in the core, which is technically to the far northeast
    // "gigihologram_x82_y2225",  // seems to be unused / unobtainable / out of bounds?
    // "gigihologram_x134_y2247",  // seems to be unused / unobtainable / out of bounds?

    "startPoint_x739_y155",  // Projector puzzle start point -- seems to be unused / unobtainable / out of bounds?
    "endPoint_x740_y183",  // Projector puzzle end point -- seems to be unused / unobtainable / out of bounds?
    "startPoint_x-513_y-1039",  // Projector puzzle start point -- seems to be unused / unobtainable / out of bounds?
    "endPoint_x-486_y-1065",  // Projector puzzle end point -- seems to be unused / unobtainable / out of bounds?

    "teleporter_LabyrinthHub_B_x1103_y1506",  // ancient teleporter on the ground but seems to only be for decoration, never activated
];
const keyDisallowedSubstringRegex = new RegExp(`(${keyCannotIncludeAsSubstring.join("|")})`);

/**
 * In the case that some specific entries get extracted that should not be exported, catch them (or modify them) with this function.
 * @template {(Record<string, any> & import("./process_node_locs.js").ExportFilterMetaPropertiesType)} T
 * @param {string} targetFileName 
 * @param {string} key 
 * @param {T} originalObj 
 * @returns {boolean | T}
*/
export function entryExportFilter(targetFileName, key, originalObj) {
    let obj = deepCopy(originalObj);
    Object.freeze(originalObj);

    // if(keyCannotIncludeAsSubstring.some(substr => key.includes(substr))) {
    if(keyDisallowedSubstringRegex.test(key)) {
        return false;
    }

    if(/gigi_hologram/i.test(targetFileName) && Object.values(obj.dialogue?.labeledAltEntrypoints || {}).includes("nospoilers")) {
        // the final gigi hologram - leave its conversation up to the player to discover! :)
        obj = { ...obj };
        /** @type {NonNullable<import("../../../src/types.js").GigiHologram["dialogue"]>["entries"]} */
        const noSpoilerDialogueEntries = {
            "nospoilers": {
                text: { en: "No spoilers! Play the game for yourself to discover the last Gigi hologram's dialogue! \u263A" },
                expression: "cheery1",
                italics: true
            }
        };
        obj.dialogue.entries = { ...noSpoilerDialogueEntries, ...obj.dialogue.entries };
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
    if(posKeys !== null && key !== "teleporter_Conservatory_Garden_x-284_y52" /* except for this one in fields, seems to be correctly placed */) {
        obj = { ...obj };
        let posAltered = false;
        const alterPos = (oldPos) => {
            const newPos = applyHighestPriorityRegionPosShift(oldPos, dimension);
            if(newPos && (newPos !== oldPos || newPos.x !== oldPos.x || newPos.y !== oldPos.y)) {
                posAltered = true;
                return newPos;
            }
            else return oldPos;
        };
        for(const posKey of posKeys) {
            if(Array.isArray(obj[posKey])) {
                obj[posKey] = obj[posKey].map(alterPos);
            }
            else {
                obj[posKey] = alterPos(obj[posKey]);
            }
        }

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
    }

    // export the entry
    let finalObj = obj;
    // remove the __noModify property if it exists
    if(finalObj.__noModify) {
        delete finalObj.__noModify;
    }
    // respect the __noModify property for specific sub-properties
    // by resetting them to their original values from originalObj
    if(originalObj.__noModify && Array.isArray(originalObj.__noModify)) {
        for(const propPath of originalObj.__noModify) {
            let currObj = finalObj;
            let originalCurrObj = originalObj;
            for(let i = 0; i < propPath.length; i++) {
                const prop = propPath[i];
                // console.debug(key, propPath, prop, i);
                if(i === propPath.length - 1) {
                    // last property in the path - set it to the original value
                    let _valueBefore = currObj[prop];
                    currObj[prop] = originalCurrObj[prop];
                    console.log(`  Preserved property ${propPath.join(".")} for entry ${key}`);
                    console.log("    value before resetting:", _valueBefore);
                    console.log("    value after resetting:", currObj[prop]);
                }
                else {
                    // console.debug(`traversing deeper: ${prop}`);
                    // traverse deeper
                    currObj = currObj[prop];
                    originalCurrObj = originalCurrObj[prop];
                    if(typeof currObj !== "object" || currObj === null) {
                        // cannot traverse deeper
                        break;
                    }
                }
            }
        }
    }
    return finalObj;
}

// some constants used for definitions below
const _realUnstableCoreMeshPosition = transformIngameToMapPosition({ x: 2245.869162606233, y: 97.43239, z: -121.29875198047512 });
const _approxMapCoreCenterPosition = { x: 256, y: 1456 };

/** @type {{ [regionName: string]: (mapPos: Vec2) => Vec2 }} */
const regionPosShifts = {
    "mapVoronoiRainbowIslandFields": (mapPos) => ({
        // Shift the fields region slightly southwest to better align with the ingame map
        // (Uncertain why most - but not all - in Rainbow Fields are misaligned like this. But a little manual adjustment seems okay.)
        x: mapPos.x - -3,
        y: mapPos.y - 4.5
    }),
    "mapRegionLabyrinthCore": (mapPos) => ({
        // map pos is inside roughly-defined region of the northeast corner of labyrinth map;
        // Offset appropriately, based on the apparent center of the core versus the real center,
        // to position it like it's in the core of the ingame map instead.
        x: mapPos.x + (_approxMapCoreCenterPosition.x - _realUnstableCoreMeshPosition.x),
        y: mapPos.y + (_approxMapCoreCenterPosition.y - _realUnstableCoreMeshPosition.y)
    }),
};

function applyHighestPriorityRegionPosShift(/** @type {Vec2} */ originalMapPos, /** @type {MapType | undefined} */ dimension = undefined) {
    const regions = getMapRegionsContaining(originalMapPos, dimension);
    for(const region of regions) {
        const mapPosTransform = regionPosShifts[region.name];
        if(mapPosTransform) {
            // found the highest-priority region that has a mapPosTransform; apply it and return immediately.
            return mapPosTransform(originalMapPos);
        }
    }
    return originalMapPos;
}