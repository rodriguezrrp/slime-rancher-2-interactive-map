import L from "leaflet";

// const gameMapBounds: { x: number[]; y: number[]; } = { x: [-3200,-3200], y: [3200,3200] };
const gameMapWidthUnits: number = 6400;
// const gameMapHeightUnits: number = 0;

const tileSize: number = 256;
const unitsPerPixel: number = 128;
const mapWidthPx: number = 25600;
// const mapWidthPx: number = 11468;
// const mapHeightPx: number = 25600;

// largest zoom has a units-per-pixel = 128.
// Then, account for how map png size is 25600x25600 pixels but in-game map size is 6400x6400 units.
const scaleFactor = (1 / unitsPerPixel) * (mapWidthPx / gameMapWidthUnits);

// The map png is centered around 0,0 on the in-game map.
// However, because gdal2tiles readjusts it to be the next largest power of 2, we must account for the origin not truly being centered.
// Also, 128 is the center of tile (256 px / 2) at zoom 0 of course.
const centerOffset = (tileSize / 2) * (gameMapWidthUnits / 2**Math.ceil(Math.log2(gameMapWidthUnits)));  // ex. 2**ceil(log2(25600)) = 2**15 = 32768

export const ScaledSimpleCRS = L.extend({}, L.CRS.Simple, {
    // like (a*x + b, c*y + d)
    // Compute a and c coefficients so that tile 0/0/0 is from [0, 0] to [mapHeight, mapWidth]
    // Compute b and d coefficients to shift the origin (0,0)
    transformation: new L.Transformation(scaleFactor, centerOffset, scaleFactor, centerOffset)
});