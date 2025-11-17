

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
 * @returns {boolean | T}
*/
export function entryExportFilter(/** @type {string} */ targetFileName, /** @type {string} */ key, /** @type {T} */ obj) {

    // if(keyCannotIncludeAsSubstring.some(substr => key.includes(substr))) {
    if(keyDisallowedSubstringRegex.test(key)) {
        return false;
    }

    // export the entry as-is
    return true;

}