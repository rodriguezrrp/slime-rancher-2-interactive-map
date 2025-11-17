import * as helpers from "@turf/helpers";
import L from "leaflet";
import { Polyline } from "react-leaflet";
import { TeleportLine } from "../types";
import { default as bezierSpline } from "@turf/bezier-spline";
import { teleport_lines } from "../data/teleport_lines";
import { MapType } from "../CurrentMapContext";
import { latToY, lonToX, mapSizePxForMercatorZoom, scaleLinear } from "../util";
import { mapCRSsettings } from "../data/map_crs_settings";

export function TeleportLineIcon({ teleport_line, dimension }: { teleport_line: TeleportLine, dimension: MapType }) {
    const path_options: L.PathOptions = {
        color: "white",
        weight: 3.5,
        dashArray: "1, 7",
        dashOffset: "0",
    };

    const position_1 = teleport_line.positions[0];
    const position_2 = teleport_line.positions[1];
    const line = helpers.lineString([
        [position_1.x, position_1.y],
        ...(teleport_line.midpoint ? [ [teleport_line.midpoint.x, teleport_line.midpoint.y] ] : []),
        [position_2.x, position_2.y],
        ...teleport_line.positions.slice(2).map(pos => [pos.x, pos.y])
    ]);

    return (
        <Polyline
            key={teleport_line.name}
            pathOptions={path_options}
            positions={bezierSpline(line, { resolution: 10_000 /* default 10_000 */ }).geometry.coordinates.map(pos => {
                return {
                    lat: pos[0],
                    lng: pos[1]
                };
                // const [lat, lng] = pos;
                // const { y, x } = transformTurfPointToMapCRS(lat, lng, dimension);
                // return {
                //     lat: y,
                //     lng: x
                // };
            })}
        ></Polyline>
    );
}

// const _mapProjectionSettings = {
//     [MapType.overworld]: {
//     },
// }
const _zoom = 1;
const [ _zoomMapPxW, _zoomMapPxH ] = mapSizePxForMercatorZoom(_zoom);
function transformTurfPointToMapCRS(lat: number, lng: number, dimension: MapType): { y: number, x: number } {
    
    const crsSettings = mapCRSsettings[dimension];
    if(crsSettings.CRS === null) {
        // using default crs, don't transform
        return { y: lat, x: lng };
    }

    // pxY and pxX will be within [0, _zoomPxH] and [0, _zoomPxW], respectively. (assuming abs(y) <= 85.051129 and abs(x) <= 180)
    const pxY = latToY(lat, _zoom);
    const pxX = lonToX(lng, _zoom);

    // now, affine-transform to match scale of map
    const { x: [ mapXmin, mapXmax ], y: [ mapYmin, mapYmax ] } = crsSettings.mapCoordsBounds;
    return {
        y: scaleLinear(pxY, 0, _zoomMapPxH, mapYmin, mapYmax),
        x: scaleLinear(pxX, 0, _zoomMapPxW, mapXmin, mapXmax)
    };
}
// function transformMapCRSToTurfPoint(y: number, x: number, dimension: MapType): { lat: number, lng: number } {
//     return {
//         lat: ,
//         lng: 
//     };
// }


// export const TeleportLineIcons = Object.values(teleport_lines).map((teleport_line: TeleportLine) => {
//     return <TeleportLineIcon key={teleport_line.name} teleport_line={teleport_line} dimension={teleport_line.dimension} />;
// });

export function TeleportLineIcons(current_map: MapType) {
    return Object.keys(teleport_lines).filter((keyName) => {
        return teleport_lines[keyName].dimension === current_map;
    }).map((keyName) => {
        const teleport_line = teleport_lines[keyName];
        return <TeleportLineIcon key={keyName} teleport_line={teleport_line} dimension={teleport_line.dimension} />;
    });
}
