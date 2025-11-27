import minimist from "minimist";
import { extractCoordsOfMapTextures } from "./process_map_tex_coords.js";
import { stitchMapTextures } from "./stitch_map_texs.js";
import { convertToTilemap } from "./convert_stitched_to_tilemap.js";
import { PATH_TO_LABYRINTH_TILEMAP_FOLDER, PATH_TO_RAINBOW_ISLAND_TILEMAP_FOLDER } from "../../asset_paths.js";
import { cp, cpSync, existsSync, rm, rmSync } from "node:fs";

// eslint-disable-next-line no-undef
const args = minimist(process.argv.slice(2));

const pythonCLIname = args["pycli"] ?? undefined;
const dontCopyTilemap = args["nocopytilemap"] ?? undefined;

console.log("parsed param --pycli: ", pythonCLIname);
console.log("parsed param --nocopytilemap: ", dontCopyTilemap);

const { mapSpriteGUIDtoAssetJSONs, mapSpriteShortNameToGUIDs, partPositionsRI, partPositionsLabyrinth } = await extractCoordsOfMapTextures();

await stitchMapTextures(mapSpriteGUIDtoAssetJSONs, mapSpriteShortNameToGUIDs, partPositionsRI, partPositionsLabyrinth);

try {
    if(existsSync("./map_RI")) {
        console.log("  clearing Rainbow Map tilemap location ./map_RI for new gdal tilemap export...");
        rmSync("./map_RI", { recursive: true, force: true }, () => { });
    }
}
catch(e) {
    console.log("Encountered error when removing existing tilemap location ./map_RI for gdal; ", e);
}
await convertToTilemap("./data_out/stitchedMapRainbowIsland.png", "./map_RI", pythonCLIname);
try {
    if(existsSync("./map_Labyrinth")) {
        console.log("  clearing Labyrinth tilemap location ./map_Labyrinth for new gdal tilemap export...");
        rmSync("./map_Labyrinth", { recursive: true, force: true }, () => { });
    }
}
catch(e) {
    console.log("Encountered error when removing existing tilemap location ./map_Labyrinth for gdal; ", e);
}
await convertToTilemap("./data_out/stitchedMapLabyrinth.png", "./map_Labyrinth", pythonCLIname);

if(!(dontCopyTilemap && dontCopyTilemap.toLowerCase?.() !== "false")) {
    console.log(`Copying new Rainbow Island tilemap to "${PATH_TO_RAINBOW_ISLAND_TILEMAP_FOLDER}" (overwriting any existing tilemap)...`);

    try {
        if(existsSync(PATH_TO_RAINBOW_ISLAND_TILEMAP_FOLDER)) {
            console.log("  removing existing...");
            rmSync(PATH_TO_RAINBOW_ISLAND_TILEMAP_FOLDER, { recursive: true, force: true }, () => { });
        }
        
        console.log("  copying new...");
        cpSync("./map_RI", PATH_TO_RAINBOW_ISLAND_TILEMAP_FOLDER, { recursive: true }, (err) => { if(err) throw err; });

        console.log(`Copied new Rainbow Island tilemap to "${PATH_TO_RAINBOW_ISLAND_TILEMAP_FOLDER}".`);
    }
    catch(e) {
        console.log(`Failed to copy new Rainbow Island tilemap to "${PATH_TO_RAINBOW_ISLAND_TILEMAP_FOLDER}". Maybe the dev server is running?`);
        throw e;
    }

}
if(!(dontCopyTilemap && dontCopyTilemap.toLowerCase?.() !== "false")) {
    console.log(`Copying new Labyrinth tilemap to "${PATH_TO_LABYRINTH_TILEMAP_FOLDER}" (overwriting any existing tilemap)...`);

    try {
        if(existsSync(PATH_TO_LABYRINTH_TILEMAP_FOLDER)) {
            console.log("  removing existing...");
            rmSync(PATH_TO_LABYRINTH_TILEMAP_FOLDER, { recursive: true, force: true }, () => { });
        }
        
        console.log("  copying new...");
        cpSync("./map_Labyrinth", PATH_TO_LABYRINTH_TILEMAP_FOLDER, { recursive: true }, (err) => { if(err) throw err; });

        console.log(`Copied new Labyrinth tilemap to "${PATH_TO_LABYRINTH_TILEMAP_FOLDER}".`);
    }
    catch(e) {
        console.log(`Failed to copy new Labyrinth tilemap to "${PATH_TO_LABYRINTH_TILEMAP_FOLDER}". Maybe the dev server is running?`);
        throw e;
    }

}