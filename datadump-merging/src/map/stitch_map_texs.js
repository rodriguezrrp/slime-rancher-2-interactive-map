import { globSync } from "glob";
import { GLOB_TO_MAP_TEXTURES } from "../../asset_paths.js";
import sharp from "sharp";
import { basename } from "node:path";

/** @typedef {{ x: number, y: number }} Vec2 */

export async function stitchMapTextures(
    mapSpriteGUIDtoAssetJSONs,
    mapSpriteShortNameToGUIDs,
    /** @type {{ [shortName: string]: { sizeInUnits: Vec2, offsetMin: Vec2, offsetMax: Vec2 } }} */
    partPositionsRI,
    /** @type {{ [shortName: string]: { sizeInUnits: Vec2, offsetMin: Vec2, offsetMax: Vec2 } }} */
    partPositionsLabyrinth,
) {

    const unitToPxScale = 4;
    // TODO read from the parent RectTransform, pass in as params?
    const gameMapWidthUnits = 6400;
    const gameMapHeightUnits = 6400;

    const mapTexs = globSync(GLOB_TO_MAP_TEXTURES);

    const shortNamesToFilepaths = Object.fromEntries(mapTexs.map(texFilepath => {
        const shortName = basename(texFilepath).split(".")[0];
        return [ shortName, texFilepath ];
    }));

    const texScaleFactorsRI = Object.fromEntries(await Promise.all(
        Object.keys(partPositionsRI).map(async (shortName) => {

            const texMeta = await sharp(shortNamesToFilepaths[shortName]).metadata();
            const partSizeInUnits = partPositionsRI[shortName].sizeInUnits;
            
            console.log(shortName, shortNamesToFilepaths[shortName]);
            console.log("texMeta: ", texMeta);
            console.log("partSizeInUnits: ", partSizeInUnits);

            const texUnitToPxScale = { x: texMeta.width / partSizeInUnits.x, y: texMeta.height / partSizeInUnits.y };
            if(texUnitToPxScale.x !== texUnitToPxScale.y)
                throw new Error(`Unexpected stretched texture encountered? shortName: ${shortName}, texUnitToPxScale:`, texUnitToPxScale);

            // arbitrarily pick the .x for getting a single number out of the Vec2
            return [ shortName, texUnitToPxScale.x ];

        })
    ))
    // currently, just use the largest scale factor because it's been the same
    // const unitToPxScaleRI = Math.max(...Object.values(texScaleFactorsRI));
    const unitToPxScaleRI = 4;  // eh now that I added GorgeToLabyrinth and StrandToLabyrinth, just hardcode it. Because those are 1024 / 250 units = 4.096, while the rest are 1024 / 256 units = 4 exactly.
    console.log(`unitToPxScaleRI: ${unitToPxScaleRI}`);

    const texScaleFactorsLabyrinth = Object.fromEntries(await Promise.all(
        Object.keys(partPositionsLabyrinth).map(async (shortName) => {

            const texMeta = await sharp(shortNamesToFilepaths[shortName]).metadata();
            const partSizeInUnits = partPositionsLabyrinth[shortName].sizeInUnits;

            const texUnitToPxScale = { x: texMeta.width / partSizeInUnits.x, y: texMeta.height / partSizeInUnits.y };
            if(texUnitToPxScale.x !== texUnitToPxScale.y)
                throw new Error(`Unexpected stretched texture encountered? shortName: ${shortName}, texUnitToPxScale:`, texUnitToPxScale);

            // arbitrarily pick the .x for getting a single number out of the Vec2
            return [ shortName, texUnitToPxScale.x ];

        })
    ))
    // currently, just use the largest scale factor because it's been the same
    const unitToPxScaleLabyrinth = Math.max(...Object.values(texScaleFactorsLabyrinth));
    console.log(`unitToPxScaleLabyrinth: ${unitToPxScaleLabyrinth}`);

    
    const widthRI = gameMapWidthUnits;
    const heightRI = gameMapHeightUnits;
    const mapRIOffsetMin = { x: -Math.floor(widthRI/2), y: -Math.floor(heightRI/2) };
    const mapRIOffsetMax = { x: Math.ceil(widthRI/2), y: Math.ceil(heightRI/2) };
    
    const widthLabyrinth = gameMapWidthUnits;
    const heightLabyrinth = gameMapHeightUnits;
    const mapLabyrinthOffsetMin = { x: -Math.floor(widthLabyrinth/2), y: -Math.floor(heightLabyrinth/2) };
    const mapLabyrinthOffsetMax = { x: Math.ceil(widthLabyrinth/2), y: Math.ceil(heightLabyrinth/2) };

    
    const _forloopIterationArgs = [
        [unitToPxScaleRI, widthRI, heightRI, mapRIOffsetMin, mapRIOffsetMax, partPositionsRI, "./data_out/stitchedMapRainbowIsland.png"],
        [unitToPxScaleLabyrinth, widthLabyrinth, heightLabyrinth, mapLabyrinthOffsetMin, mapLabyrinthOffsetMax, partPositionsLabyrinth, "./data_out/stitchedMapLabyrinth.png"]
    ];

    for(const [unitToPxScale, mapWidthUnits, mapHeightUnits, mapOffsetMin, mapOffsetMax, partPositions, outPath] of _forloopIterationArgs) {

        // initialize with extreme values
        const partsOverallOffsetMin = { x: 1e40, y: 1e40 };
        const partsOverallOffsetMax = { x: -1e40, y: -1e40 };

        Object.values(partPositions).forEach(poses => {
            const { x: minx, y: miny } = poses.offsetMin;
            const { x: maxx, y: maxy } = poses.offsetMax;
            partsOverallOffsetMin.x = Math.min(partsOverallOffsetMin.x, minx);
            partsOverallOffsetMin.y = Math.min(partsOverallOffsetMin.y, miny);
            partsOverallOffsetMax.x = Math.max(partsOverallOffsetMax.x, maxx);
            partsOverallOffsetMax.y = Math.max(partsOverallOffsetMax.y, maxy);
        });
        // TODO export the partsOverallOffsetMin and Max as the effective map bounds?

        console.log("Stitching ", outPath)
        console.log(mapWidthUnits, "x", mapHeightUnits);
        console.log(unitToPxScale * mapWidthUnits, "x", unitToPxScale * mapHeightUnits);
        console.log("mapOffsetMin:", mapOffsetMin);
        console.log("mapOffsetMax:", mapOffsetMax);
        console.log("partsOverallOffsetMin:", partsOverallOffsetMin);
        console.log("partsOverallOffsetMax:", partsOverallOffsetMax);

        // stitch the rainbow island map

        const _desiredOrdering = ["Map_Strand_CU5", "Map_Wall", "Map_Gorge_CU5", "GorgeToLabyrinth", "StrandToLabyrinth"];
        const partPositionsEntriesSort = (entry1, entry2) => {
            let [shortName1, ] = entry1;
            let [shortName2, ] = entry2;
            // trim off file ext (like .png) just in case
            const indexOfDot1 = shortName1.lastIndexOf(".");
            const indexOfDot2 = shortName2.lastIndexOf(".");
            shortName1 = indexOfDot1 === -1 ? shortName1 : shortName1.slice(0, indexOfDot1);
            shortName2 = indexOfDot2 === -1 ? shortName2 : shortName2.slice(0, indexOfDot2);
            const i1 = _desiredOrdering.indexOf(shortName1);
            const i2 = _desiredOrdering.indexOf(shortName2);
            if(i1 === -1 && i2 === -1) {
                return shortName1 < shortName2 ? -1 : shortName1 > shortName2 ? 1 : 0;
            }
            return i1 - i2;
        }

        sharp({ create: {
            width: Math.floor( unitToPxScale * mapWidthUnits ),
            height: Math.floor( unitToPxScale * mapHeightUnits ),
            channels: 4,
            background: { r:0, g:0, b:0, alpha:0 },
        }, limitInputPixels: 25600*25600 })
        .composite(
            Object.entries(partPositions)
            .sort(partPositionsEntriesSort)
            .map(([shortName, offsets]) => {
                console.log(shortName, offsets);
                const upsideDownTop = offsets.offsetMin.y;
                const selfHeight = offsets.offsetMax.y - offsets.offsetMin.y;
                const distFromUpsideDownOverallTopToCorrectOverallTop = mapOffsetMax.y - (-mapOffsetMin.y);
                const rightSideUpTop = - (upsideDownTop - distFromUpsideDownOverallTopToCorrectOverallTop) - selfHeight;
                console.log(shortName, selfHeight, upsideDownTop, distFromUpsideDownOverallTopToCorrectOverallTop, rightSideUpTop);
                return {
                    input: shortNamesToFilepaths[shortName],
                    top: Math.floor( unitToPxScale * (rightSideUpTop - mapOffsetMin.y) ),
                    left: Math.floor( unitToPxScale * (offsets.offsetMin.x - mapOffsetMin.x) ),
                };
            })
        )
        .png({ compressionLevel: 9 })
        .toFile(outPath);

    }

}