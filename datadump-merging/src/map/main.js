import minimist from "minimist";
import { extractCoordsOfMapTextures } from "./process_map_tex_coords.js";
import { stitchMapTextures } from "./stitch_map_texs.js";
import { convertToTilemap } from "./convert_stitched_to_tilemap.js";
import { PATH_TO_RAINBOW_ISLAND_TILEMAP_FOLDER } from "../../asset_paths.js";
import { cp, existsSync, rm } from "node:fs";

// eslint-disable-next-line no-undef
const args = minimist(process.argv.slice(2));

// const useCache = args["usecache"] ?? undefined;
// const exportToCache = args["exporttocache"] ?? undefined;
const pythonCLIname = args["pycli"] ?? undefined;
const dontCopyTilemap = args["nocopytilemap"] ?? undefined;

// console.log("parsed param --usecache: ", useCache);
// console.log("parsed param --exporttocache: ", exportToCache);
console.log("parsed param --pycli: ", pythonCLIname);
console.log("parsed param --nocopytilemap: ", dontCopyTilemap);

// const cacheOpts = { };
// if(typeof useCache !== "undefined") cacheOpts.useCache = useCache;
// if(typeof exportToCache !== "undefined") cacheOpts.exportToCache = exportToCache;

const { mapSpriteGUIDtoAssetJSONs, mapSpriteShortNameToGUIDs, partPositionsRI, partPositionsLabyrinth } = await extractCoordsOfMapTextures();

await stitchMapTextures(mapSpriteGUIDtoAssetJSONs, mapSpriteShortNameToGUIDs, partPositionsRI, partPositionsLabyrinth);

await convertToTilemap("./data_out/stitchedMapRainbowIsland.png", "./map_RI", pythonCLIname);

if(!(dontCopyTilemap && dontCopyTilemap.toLowerCase?.() !== "false")) {
    console.log(`Copying new Rainbow Island tilemap to "${PATH_TO_RAINBOW_ISLAND_TILEMAP_FOLDER}" (overwriting any existing tilemap)...`);

    try {
        if(existsSync(PATH_TO_RAINBOW_ISLAND_TILEMAP_FOLDER)) {
            console.log("  removing existing...");
            await rm(PATH_TO_RAINBOW_ISLAND_TILEMAP_FOLDER, { recursive: true, force: true });
        }
        
        console.log("  copying new...");
        await cp("./map_RI", PATH_TO_RAINBOW_ISLAND_TILEMAP_FOLDER, (e)=>{});

        console.log(`Copied new Rainbow Island tilemap to "${PATH_TO_RAINBOW_ISLAND_TILEMAP_FOLDER}".`);
    }
    catch(e) {
        console.log(`Failed to copy new Rainbow Island tilemap to "${PATH_TO_RAINBOW_ISLAND_TILEMAP_FOLDER}".`);
        throw e;
    }

}