import minimist from "minimist";
import { exportNodeCoordsFromScenesJSON } from "./process_node_locs.js";

// eslint-disable-next-line no-undef
const args = minimist(process.argv.slice(2));

const useCache = args["usecache"] ?? undefined;
const exportToCache = args["exporttocache"] ?? undefined;

console.log("parsed param --usecache: ", useCache);
console.log("parsed param --exporttocache: ", exportToCache);

const cacheOpts = { };
if(typeof useCache !== "undefined") cacheOpts.useCache = useCache;
if(typeof exportToCache !== "undefined") cacheOpts.exportToCache = exportToCache;

exportNodeCoordsFromScenesJSON(undefined, cacheOpts);
