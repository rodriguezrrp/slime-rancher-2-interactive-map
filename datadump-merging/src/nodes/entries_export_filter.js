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

    "teleporter_LabyrinthHub_B_x1103_y1506",  // ancient teleporter on the ground but seems to only be for decoration, never activated
];
const keyDisallowedSubstringRegex = new RegExp(`(${keyCannotIncludeAsSubstring.join('|')})`);

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

    if(key === "gigihologram_x82_y2225") {
        // the final gigi hologram - leave its conversation up to the player to discover! :)
        obj = { ...obj };
        /** @type {import("../../../src/types.js").GigiHologram["dialogue"]} */
        const customDialogue = {
            firstVisitStartEntryId: "nospoilers",
            entries: { "nospoilers": { text: { en: "No spoilers! Play the game for yourself to discover the last Gigi hologram's dialogue! \u263A" }, expression: "cheery1", italics: true } }
        }
        obj.dialogue = customDialogue;
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
        }
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
                    console.log(`    value before resetting:`, _valueBefore);
                    console.log(`    value after resetting:`, currObj[prop]);
                    // console.debug(prop);
                    // console.debug(currObj);
                    // console.debug(originalCurrObj);
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

function deepCopy(value, _seen = new WeakMap()) {
    if (value === null || typeof value !== "object") return value;

    // Handle circular references
    if (_seen.has(value)) return _seen.get(value);

    // Built-in types
    if (value instanceof Date) return new Date(value.getTime());
    if (value instanceof RegExp) return new RegExp(value.source, value.flags);
    if (value instanceof Map) {
        const m = new Map();
        _seen.set(value, m);
        for (const [k, v] of value) m.set(deepCopy(k, _seen), deepCopy(v, _seen));
        return m;
    }
    if (value instanceof Set) {
        const s = new Set();
        _seen.set(value, s);
        for (const v of value) s.add(deepCopy(v, _seen));
        return s;
    }
    if (ArrayBuffer.isView(value)) {
        // TypedArray or DataView
        const ctor = value.constructor;
        const copy = new ctor(value.buffer ? value.buffer.slice(0) : value);
        _seen.set(value, copy);
        return copy;
    }
    if (value instanceof ArrayBuffer) return value.slice(0);

    // Arrays
    if (Array.isArray(value)) {
        const arr = [];
        _seen.set(value, arr);
        for (let i = 0; i < value.length; i++) arr[i] = deepCopy(value[i], _seen);
        return arr;
    }

    // Generic objects (preserve prototype and property descriptors)
    const proto = Object.getPrototypeOf(value);
    const out = Object.create(proto);
    _seen.set(value, out);
    for (const key of Reflect.ownKeys(value)) {
        const desc = Object.getOwnPropertyDescriptor(value, key);
        if (!desc) continue;
        if (desc.get || desc.set) {
            Object.defineProperty(out, key, desc);
        } else {
            desc.value = deepCopy(desc.value, _seen);
            Object.defineProperty(out, key, desc);
        }
    }
    return out;
}