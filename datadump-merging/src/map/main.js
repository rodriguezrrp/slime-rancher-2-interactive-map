import minimist from "minimist";
import { extractCoordsOfMapTextures } from "./process_map_tex_coords.js";
import { stitchMapTextures } from "./stitch_map_texs.js";

// eslint-disable-next-line no-undef
const args = minimist(process.argv.slice(2));

const useCache = args["usecache"] ?? undefined;
const exportToCache = args["exporttocache"] ?? undefined;

console.log("parsed param --usecache: ", useCache);
console.log("parsed param --exporttocache: ", exportToCache);

const cacheOpts = { };
if(typeof useCache !== "undefined") cacheOpts.useCache = useCache;
if(typeof exportToCache !== "undefined") cacheOpts.exportToCache = exportToCache;

const { mapSpriteGUIDtoAssetJSONs, mapSpriteShortNameToGUIDs, partPositionsRI, partPositionsLabyrinth } = await extractCoordsOfMapTextures();

await stitchMapTextures(mapSpriteGUIDtoAssetJSONs, mapSpriteShortNameToGUIDs, partPositionsRI, partPositionsLabyrinth);

// TODO gdal stitched

