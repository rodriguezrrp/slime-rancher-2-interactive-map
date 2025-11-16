import { Marker, Popup } from "react-leaflet";
import { icon_opacity, icon_template, teleport_pad_ls_key } from "../globals";
import { useContext, useEffect, useState } from "react";
import { FoundContext } from "../FoundContext";
import L from "leaflet";
import { TeleportPad } from "../types";
import { handleChecked } from "../util";
import { teleport_pads } from "../data/teleport_pads";
import { MapType } from "../CurrentMapContext";

export function TeleportPadIcon({
    teleport_pad,
    key_name,
}: {
    teleport_pad: TeleportPad,
    key_name: string
}) {
    const { found, setFound } = useContext(FoundContext);
    const [checked, setChecked] = useState(
        found.teleport_pads ? found.teleport_pads.some((k: string) => k === key_name) : false
    );

    useEffect(() => {
        setChecked(found.teleport_pads ? found.teleport_pads.some((k: string) => k === key_name) : false);
    }, [found]);

    useEffect(() => {
        if (checked) {
            setFound({
                ...found,
                teleport_pads: [...found.teleport_pads, key_name],
            });
        } else {
            setFound({
                ...found,
                teleport_pads: [...found.teleport_pads.filter((item: string) => item !== key_name)]
            });
        }
    }, [checked]);

    const icon = L.icon({
        ...icon_template,
        iconUrl: `/icons/teleporters/${teleport_pad.image || "iconMapLabyrinth.png"}`,
        className: `${checked && icon_opacity} testing-class-on-leaflet-icons`
    });

    return (
        <Marker key={key_name} position={[teleport_pad.position.x, teleport_pad.position.y]} icon={icon}>
            <Popup>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center gap-5">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleChecked(teleport_pad_ls_key, key_name, checked, setChecked)}
                                className="w-4 h-4"
                            />
                            <h1 className="ml-2 text-xl font-medium">{teleport_pad.name}</h1>
                        </div>
                    </div>

                    <hr />

                    <div>
                        <span className="text-md font-bold">Description: </span>
                        <span>{teleport_pad.description}</span>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
}

// export const TeleportPadIcons = Object.keys(teleport_pads).map(key => {
//     const pad = teleport_pads[key];
//     return <TeleportPadIcon key={key} key_name={key} teleport_pad={pad} />;
// });

export function TeleportPadIcons(current_map: MapType) {
    return Object.keys(teleport_pads).filter((keyName) => {
        return teleport_pads[keyName].dimension === current_map;
    }).map((keyName) => {
        const teleport_pad = teleport_pads[keyName];
        return <TeleportPadIcon key={keyName} teleport_pad={teleport_pad} key_name={keyName} />;
    });
}
