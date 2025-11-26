import { icon_opacity, icon_template, locked_door_ls_key } from "../globals";
import { useContext, useEffect, useState } from "react";
import { FoundContext } from "../FoundContext";
import L from "leaflet";
import { LockedDoor } from "../types";
import { MapType } from "../CurrentMapContext";
import MarkerAndPopupTemplate from "./MarkerAndPopupTemplate";
import { handleChecked } from "../util";
import { locked_doors } from "../data/locked_doors";

export function LockedDoorIcon({ locked_door, keyName }: { locked_door: LockedDoor, keyName: string }) {
    const deprecatedKey = `${locked_door.name.toLowerCase().replace(" ", "")}${locked_door.pos.x}${locked_door.pos.y}`;
    const { found, setFound } = useContext(FoundContext);
    const [checked, setChecked] = useState(
        found.locked_doors ? found.locked_doors.some((k: string) => k === keyName || k === deprecatedKey) : false
    );

    useEffect(() => {
        setChecked(found.locked_doors ? found.locked_doors.some((k: string) => k === keyName || k === deprecatedKey) : false);
    }, [found]);

    useEffect(() => {
        if (checked) {
            setFound({
                ...found,
                locked_doors: [...found.locked_doors, keyName],
            });
        } else {
            setFound({
                ...found,
                locked_doors: [...found.locked_doors.filter((item: string) => item !== keyName && item !== deprecatedKey)]
            });
        }
    }, [checked]);

    const iconOptions: L.IconOptions = {
        ...icon_template,
        iconUrl: `/icons/plorts/${locked_door.image}`,
        className: `${checked && icon_opacity}`
    };

    const markerRefKey = `lockeddoor_${keyName}`;  // add this prefix to make these unique among _all_ markers on the map

    return (
        <MarkerAndPopupTemplate
            markerRefKey={markerRefKey}
            position={[locked_door.pos.x, locked_door.pos.y]}
            iconOptions={iconOptions}
            popupCheckedState={checked}
            onPopupCheckChange={() => handleChecked(locked_door_ls_key, keyName, checked, setChecked, deprecatedKey)}
            headerRowChildren={
                <h1 className="ml-2 text-xl font-medium">{locked_door.name}</h1>
            }
        >
            <div>
                <span className="text-md font-bold">Plort Requirement: </span>
                <span>{locked_door.plort}</span>
            </div>

            <div>
                <span className="text-md font-bold">Description: </span>
                <span>{locked_door.description}</span>
            </div>

            <div>
                <span className="text-md font-bold">Unlocks: </span>
                <span>{locked_door.unlocks}</span>
            </div>
        </MarkerAndPopupTemplate>
    );
}

export function LockedDoorIcons(current_map: MapType) {
    return Object.keys(locked_doors).filter((keyName) => {
        return locked_doors[keyName].dimension === current_map;
    }).map((keyName) => {
        const locked_door = locked_doors[keyName];
        return <LockedDoorIcon
            key={keyName} locked_door={locked_door} keyName={keyName}
        />;
    });
}
