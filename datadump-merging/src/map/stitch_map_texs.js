import { globSync } from "glob";
import { GLOB_TO_MAP_TEXTURES } from "../../asset_paths.js";
import sharp from "sharp";
import { basename } from "node:path";


export async function stitchMapTextures(
    mapSpriteGUIDtoAssetJSONs,
    mapSpriteShortNameToGUIDs,
    partPositionsRI,
    partPositionsLabyrinth,
    // unitToTexPixelScale,
    // gameMapWidthUnits,
    // gameMapHeightUnits
) {

    // TODO read from the parent RectTransform, pass in as params
    const SCALE = 4;
    const gameMapWidthUnits = 6400;
    const gameMapHeightUnits = 6400;

    // const overallRIOffsetMin = { x: 1e40, y: 1e40 };
    // const overallRIOffsetMax = { x: -1e40, y: -1e40 };

    // Object.values(partPositionsRI).forEach(poses => {
    //     const { x: minx, y: miny } = poses.offsetMin;
    //     const { x: maxx, y: maxy } = poses.offsetMax;
    //     overallRIOffsetMin.x = Math.min(overallRIOffsetMin.x, minx);
    //     overallRIOffsetMin.y = Math.min(overallRIOffsetMin.y, miny);
    //     overallRIOffsetMax.x = Math.max(overallRIOffsetMax.x, maxx);
    //     overallRIOffsetMax.y = Math.max(overallRIOffsetMax.y, maxy);
    // });

    // const widthRI = overallRIOffsetMax.x - overallRIOffsetMin.x;
    // const heightRI = overallRIOffsetMax.y - overallRIOffsetMin.y;
    const widthRI = gameMapWidthUnits;
    const heightRI = gameMapWidthUnits;
    const overallRIOffsetMin = { x: -Math.floor(gameMapWidthUnits/2), y: -Math.floor(gameMapHeightUnits/2) };
    const overallRIOffsetMax = { x: Math.ceil(gameMapWidthUnits/2), y: Math.ceil(gameMapHeightUnits/2) };

    console.log(widthRI, "x", heightRI);
    console.log(SCALE * widthRI, "x", SCALE * heightRI);
    console.log('overallRIOffsetMin:', overallRIOffsetMin);
    console.log('overallRIOffsetMax:', overallRIOffsetMax);

    // const mapTexsGlob = new Glob(GLOB_TO_MAP_TEXTURES, { });

    const mapTexs = globSync(GLOB_TO_MAP_TEXTURES);

    const shortNamesToFilepaths = Object.fromEntries(mapTexs.map(texFilepath => {
        const shortName = basename(texFilepath).split(".")[0];
        return [ shortName, texFilepath ];
    }));

    // stitch the rainbow island map

    // const pipeline = 
    sharp({ create: {
        width: SCALE * widthRI,
        height: SCALE * heightRI,
        channels: 4,
        background: { r:0, g:0, b:0, alpha:0 },
    }, limitInputPixels: 25600*25600 })
    .composite(Object.entries(partPositionsRI).map(([shortName, offsets]) => {
        console.log(shortName, offsets);
        const upsideDownTop = offsets.offsetMin.y;
        // const rightSideUpBottom = ;
        const selfHeight = offsets.offsetMax.y - offsets.offsetMin.y;
        const distFromUpsideDownOverallTopToCorrectOverallTop = overallRIOffsetMax.y - (-overallRIOffsetMin.y);
        const rightSideUpTop = - (upsideDownTop - distFromUpsideDownOverallTopToCorrectOverallTop) - selfHeight;
        console.log(shortName, selfHeight, upsideDownTop, distFromUpsideDownOverallTopToCorrectOverallTop, rightSideUpTop);
        return {
            input: shortNamesToFilepaths[shortName],
            top: SCALE * (rightSideUpTop - overallRIOffsetMin.y),
            left: SCALE * (offsets.offsetMin.x - overallRIOffsetMin.x),
            // top: SCALE * gameMapHeightUnits,
            // left: SCALE * gameMapWidthUnits,
        };
    })) //;
    // pipeline.clone()
    .png({ compressionLevel: 9 })
    .toFile("./data_out/stitchedMapRainbowIsland.png");
    
    // sharp("./data_out/stitchedMapRainbowIsland.png", { failOn: "error", limitInputPixels: false })
    // // pipeline
    // .resize({ fit: sharp.fit.inside, width: Math.round(SCALE * widthRI / 2), height: Math.round(SCALE * heightRI / 2) })
    // .png({ compressionLevel: 9 })
    // // .toBuffer()
    // .toFile("./data_out/resizedByHalfForDiscord.png");

}