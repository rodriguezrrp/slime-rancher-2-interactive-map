import * as helpers from "@turf/helpers";
import L from "leaflet";
import { MapType } from "../CurrentMapContext";
import { Polyline } from "react-leaflet";
import { TeleportLine } from "../types";
import { default as bezierSpline } from "@turf/bezier-spline";
import { teleport_lines } from "../data/teleport_lines";

export function TeleportLineIcon({ teleport_line }: { teleport_line: TeleportLine, dimension: MapType }) {
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
            })}
        ></Polyline>
    );
}

export function TeleportLineIcons(current_map: MapType) {
    return Object.keys(teleport_lines).filter((keyName) => {
        return teleport_lines[keyName].dimension === current_map;
    }).map((keyName) => {
        const teleport_line = teleport_lines[keyName];
        return <TeleportLineIcon key={keyName} teleport_line={teleport_line} dimension={teleport_line.dimension} />;
    });
}
