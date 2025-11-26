import { icon_opacity, icon_template, shadow_door_ls_key } from "../globals";
import { useContext, useEffect, useState } from "react";
import { FoundContext } from "../FoundContext";
import L from "leaflet";
import MarkerAndPopupTemplate from "./MarkerAndPopupTemplate";
import { ShadowDoor } from "../types";
import { handleChecked } from "../util";
import { shadow_doors } from "../data/shadow_doors";

export function ShadowDoorIcon({
    shadow_door,
    keyName,
}: {
    shadow_door: ShadowDoor,
    keyName: string
}) {
    const { found, setFound } = useContext(FoundContext);
    const [checked, setChecked] = useState(
        found.shadow_doors ? found.shadow_doors.some((k: string) => k === keyName) : false
    );

    useEffect(() => {
        setChecked(found.shadow_doors ? found.shadow_doors.some((k: string) => k === keyName) : false);
    }, [found]);

    useEffect(() => {
        if (checked) {
            setFound({
                ...found,
                shadow_doors: [...found.shadow_doors, keyName],
            });
        } else {
            setFound({
                ...found,
                shadow_doors: [...found.shadow_doors.filter((item: string) => item !== keyName)]
            });
        }
    }, [checked]);

    const iconOptions: L.IconOptions = {
        ...icon_template,
        iconUrl: "/icons/iconMapShadowPlortDoor.png",
        className: `${checked && icon_opacity}`
    };

    const markerRefKey = `shadowdoor_${keyName}`;  // add this prefix to make these unique among _all_ markers on the map

    return (
        <MarkerAndPopupTemplate
            markerRefKey={markerRefKey}
            position={[shadow_door.position.x, shadow_door.position.y]}
            iconOptions={iconOptions}
            popupCheckedState={checked}
            onPopupCheckChange={() => handleChecked(shadow_door_ls_key, keyName, checked, setChecked)}
            headerRowChildren={
                <h1 className="ml-2 text-xl font-medium">Shadow Plort Door</h1>
            }
        >
            <div>
                <span className="text-md font-bold">Plort Requirement: </span>
                <span>{shadow_door.amount_required}</span>
            </div>

            <div>
                <span className="text-md font-bold">Description: </span>
                <span>{shadow_door.description}</span>
            </div>

            <div>
                <span className="text-md font-bold">Unlocks: </span>
                <span>{shadow_door.unlocks}</span>
            </div>
        </MarkerAndPopupTemplate>
    );
}

export const ShadowDoorIcons = Object.keys(shadow_doors).map(key => {
    const shadow_door = shadow_doors[key];
    return <ShadowDoorIcon key={key} keyName={key} shadow_door={shadow_door} />;
});
