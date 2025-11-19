import L from "leaflet";
import { MapType } from "../CurrentMapContext";

// const gameMapBounds: { x: number[]; y: number[]; } = { x: [-3200,-3200], y: [3200,3200] };
const gameMapWidthUnits: number = 6400;
// const gameMapHeightUnits: number = 6400;
// const gameMapHeightUnits: number = 0;

// TODO could extract some of these constants from the maps' tilemapresource.xml files?

const tileSize: number = 256;

// Rainbow Island settings
const RIunitsPerPixel: number = 128;
const RImapWidthPx: number = 25600;

// // Labyrinth settings
const LABunitsPerPixel: number = 64;
const LABmapWidthPx: number = 16003;

function makeSimpleCRS(unitsPerPixel: number, mapWidthPx: number, gameMapWidthUnits: number) {

    // Ex. with RI: largest zoom has a units-per-pixel = 128.
    // Then with RI, account for how map png size is 25600x25600 pixels but in-game map size is 6400x6400 units.
    const scaleFactor = (1 / unitsPerPixel) * (mapWidthPx / gameMapWidthUnits);
    // console.debug('map custom scaled CRS: scaleFactor:', scaleFactor);

    // The map png is centered around 0,0 on the in-game map.
    // However, because gdal2tiles readjusts it to be the next largest power of 2, we must account for the origin not truly being centered.
    // Also (ex. with RI), 128 is the center of tile (256 px / 2) at zoom 0 of course.
    // const centerOffset = (tileSize / 2) * (gameMapWidthUnits / 2**Math.ceil(Math.log2(gameMapWidthUnits)));  // ex. 2**ceil(log2(25600)) = 2**15 = 32768
    const centerOffset = (tileSize / 2) * (mapWidthPx / 2**Math.ceil(Math.log2(mapWidthPx)));  // ex. 2**ceil(log2(25600)) = 2**15 = 32768
    // console.debug('map custom scaled CRS: centerOffset:', centerOffset);

    return {
        scaleFactor,
        centerOffset,
        mapCoordsBounds: { x: [-gameMapWidthUnits/2, gameMapWidthUnits/2] as const, y: [-gameMapWidthUnits/2, gameMapWidthUnits/2] as const },
        CRS: L.extend({}, L.CRS.Simple, {
            // like (a*x + b, c*y + d)
            // Compute a and c coefficients so that tile 0/0/0 is from [0, 0] to [mapHeight, mapWidth]
            // Compute b and d coefficients to shift the origin (0,0)
            transformation: new L.Transformation(scaleFactor, centerOffset, scaleFactor, centerOffset)
        })
    };
}

export const mapCRSsettings: Record<MapType, { CRS: null } | ReturnType<typeof makeSimpleCRS>> = {
    [MapType.overworld]: makeSimpleCRS(RIunitsPerPixel, RImapWidthPx, gameMapWidthUnits),
    [MapType.labyrinth]: makeSimpleCRS(LABunitsPerPixel, LABmapWidthPx, gameMapWidthUnits),
    [MapType.sr1]: { CRS: null }
};

// console.debug('transform', ScaledSimpleCRS.transformation.transform(L.point(-gameMapWidthUnits/2, -gameMapWidthUnits/2)));
// console.debug('transform', ScaledSimpleCRS.transformation.transform(L.point(0, 0)));
// console.debug('transform', ScaledSimpleCRS.transformation.transform(L.point(gameMapWidthUnits/2, gameMapWidthUnits/2)));

// console.debug('untransform (  -256,   -256)', ScaledSimpleCRS.transformation.untransform(L.point(-256, -256)));
// console.debug('untransform (  -128,   -128)', ScaledSimpleCRS.transformation.untransform(L.point(-128, -128)));
// console.debug('untransform (     0,      0)', ScaledSimpleCRS.transformation.untransform(L.point(0, 0)));
// console.debug('untransform (   128,    128)', ScaledSimpleCRS.transformation.untransform(L.point(128, 128)));
// console.debug('untransform (   200,    200)', ScaledSimpleCRS.transformation.untransform(L.point(200, 200)));
// console.debug('untransform (250.04, 250.04)', ScaledSimpleCRS.transformation.untransform(L.point(250.04, 250.04)));
// console.debug('untransform (   256,    256)', ScaledSimpleCRS.transformation.untransform(L.point(256, 256)));
