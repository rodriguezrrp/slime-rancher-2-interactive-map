import { icon_opacity, icon_template, teleport_pad_ls_key } from "../globals";
import { useContext, useEffect, useState } from "react";
import { FoundContext } from "../FoundContext";
import L from "leaflet";
import { MapType } from "../CurrentMapContext";
import MarkerAndPopupTemplate from "./MarkerAndPopupTemplate";
import { TeleportPad } from "../types";
import { handleChecked } from "../util";
import { teleport_pads } from "../data/teleport_pads";

export function TeleportPadIcon({
    teleport_pad,
    keyName,
}: {
    teleport_pad: TeleportPad,
    keyName: string
}) {
    const { found, setFound } = useContext(FoundContext);
    const [checked, setChecked] = useState(
        found.teleport_pads ? found.teleport_pads.some((k: string) => k === keyName) : false
    );

    useEffect(() => {
        setChecked(found.teleport_pads ? found.teleport_pads.some((k: string) => k === keyName) : false);
    }, [found]);

    useEffect(() => {
        if (checked) {
            setFound({
                ...found,
                teleport_pads: [...found.teleport_pads, keyName],
            });
        } else {
            setFound({
                ...found,
                teleport_pads: [...found.teleport_pads.filter((item: string) => item !== keyName)]
            });
        }
    }, [checked]);

    const iconOptions: L.IconOptions = {
        ...icon_template,
        iconUrl: `/icons/teleporters/${teleport_pad.image || "iconMapLabyrinth.png"}`,
        className: `${checked && icon_opacity} testing-class-on-leaflet-icons`
    };

    const markerRefKey = `teleportpad_${keyName}`;  // add this prefix to make these unique among _all_ markers on the map

    return (
        <MarkerAndPopupTemplate
            markerRefKey={markerRefKey}
            position={[teleport_pad.position.x, teleport_pad.position.y]}
            iconOptions={iconOptions}
            popupCheckedState={checked}
            onPopupCheckChange={() => handleChecked(teleport_pad_ls_key, keyName, checked, setChecked)}
            headerRowChildren={
                <h1 className="ml-2 text-xl font-medium">{teleport_pad.name}</h1>
            }
        >
            <div>
                <span className="text-md font-bold">Description: </span>
                <span>{teleport_pad.description}</span>
            </div>
        </MarkerAndPopupTemplate>
    );
}

export function TeleportPadIcons(current_map: MapType) {
    return Object.keys(teleport_pads).filter((keyName) => {
        return teleport_pads[keyName].dimension === current_map;
    }).map((keyName) => {
        const teleport_pad = teleport_pads[keyName];
        return <TeleportPadIcon key={keyName} teleport_pad={teleport_pad} keyName={keyName} />;
    });
}
