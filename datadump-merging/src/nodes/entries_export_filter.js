import { applyHighestPriorityRegionPosShift } from "./map_region_def_utils.js";
import { MapType } from "./processing_utils.js";

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
            const newPos = applyHighestPriorityRegionPosShift(oldPos, dimension);
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
