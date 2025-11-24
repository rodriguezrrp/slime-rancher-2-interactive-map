import minimist from "minimist";
import { exportAllNodeCoordsFromScenesJSON, ExtractionTypes } from "./process_node_locs.js";

function tryBooleanifyArg(arg) {
    if(arg === true || arg === 1 || arg === "1" || (typeof arg === "string" && (arg.toLowerCase() === "true" || arg.toLowerCase() === "y"))) return true;
    if(arg === false || arg === 0 || arg === "0" || (typeof arg === "string" && (arg.toLowerCase() === "false" || arg.toLowerCase() === "n"))) return false;
    return arg;
}

// eslint-disable-next-line no-undef
const args = minimist(process.argv.slice(2));

const useCache = tryBooleanifyArg(args["usecache"] ?? undefined);
const exportToCache = tryBooleanifyArg(args["exporttocache"] ?? undefined);

if(args["onlyextract"] && args["only"]) {
    console.warn(`Warning: Both --onlyextract and its alias --only were specified.`
        +`\n The parameter --onlyextract will take priority, and --only will be ignored.`);
}
const _argOnlyExtract = (typeof args["onlyextract"] !== "undefined" ? args["onlyextract"] : args["only"]) ?? undefined;
const _argOnlyExtractIsTrueLike = _argOnlyExtract === true || _argOnlyExtract === "" || _argOnlyExtract === 1;
if(_argOnlyExtractIsTrueLike) {
    console.warn(`Warning: When specified, parameter --onlyextract (alias: --only) should be`
        + `\n a comma-separated or semicolon-separated list of one or more values from ${JSON.stringify(ExtractionTypes)}`
        + `\n (for example: --only=gordos,gigiholograms,researchdrones),`
        + `\n or unambiguous substrings thereof (for example: --only=gordo,gigi,drone),`
        + `\n not the value ${JSON.stringify(_argOnlyExtract)}`)
}
const _argOnlyItemsListLowercased = _argOnlyExtractIsTrueLike ? undefined
    : typeof _argOnlyExtract === "string" ? _argOnlyExtract.split(/[,;]/g).map(extrType => extrType.toLowerCase())
    : undefined;
let onlyExtract;
if(typeof _argOnlyItemsListLowercased === "undefined") onlyExtract = undefined;
else if(_argOnlyItemsListLowercased === null) onlyExtract = undefined;
else {
    onlyExtract = [];
    for(const item of _argOnlyItemsListLowercased) {
        const matches = ExtractionTypes.filter(extrType => {
            const lower = extrType.toLowerCase();
            return lower.includes(item);
        });
        if(matches.length > 1) {
            throw new Error(`parameter --onlyextract (alias: --only) contained an ambiguous extraction type substring "${item}"; matched ${matches.length} extraction types ${matches.map(s=>`"${s}"`).join(", ")}.`);
        }
        else if(matches.length === 1) {
            onlyExtract.push(matches[0]);
        }
        else {
            throw new Error(`parameter --onlyextract (alias: --only) contained an invalid extraction type substring "${item}"; did not match any of valid extraction types ${JSON.stringify(ExtractionTypes)}`);
        }
    }
}

console.log("parsed param --usecache: ", useCache);
console.log("parsed param --exporttocache: ", exportToCache);
console.log("parsed param --onlyextract (alias: --only) to extraction types: ", Array.isArray(onlyExtract) ? JSON.stringify(onlyExtract) : onlyExtract);

const cacheOpts = { };
if(typeof useCache !== "undefined") cacheOpts.useCache = useCache;
if(typeof exportToCache !== "undefined") cacheOpts.exportToCache = exportToCache;

exportAllNodeCoordsFromScenesJSON(undefined, cacheOpts, onlyExtract);
