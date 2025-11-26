import { icon_opacity, icon_template, nullifier_door_ls_key } from "../globals";
import { useContext, useEffect, useState } from "react";
import { FoundContext } from "../FoundContext";
import L from "leaflet";
import MarkerAndPopupTemplate from "./MarkerAndPopupTemplate";
import { NullifierDoor } from "../types";
import { handleChecked } from "../util";
import { nullifier_doors } from "../data/nullifier_doors";

export function NullifierDoorIcon({
    nullifier_door,
    keyName,
}: {
    nullifier_door: NullifierDoor,
    keyName: string
}) {
    const { found, setFound } = useContext(FoundContext);
    const [checked, setChecked] = useState(
        found.nullifier_doors ? found.nullifier_doors.some((k: string) => k === keyName) : false
    );

    useEffect(() => {
        setChecked(found.nullifier_doors ? found.nullifier_doors.some((k: string) => k === keyName) : false);
    }, [found]);

    useEffect(() => {
        if (checked) {
            setFound({
                ...found,
                nullifier_doors: [...found.nullifier_doors, keyName],
            });
        } else {
            setFound({
                ...found,
                nullifier_doors: [...found.nullifier_doors.filter((item: string) => item !== keyName)]
            });
        }
    }, [checked]);

    const iconOptions: L.IconOptions = {
        ...icon_template,
        iconUrl: "/icons/iconGadgetHarmonizer.png",
        className: `${checked && icon_opacity} testing-class-on-leaflet-icons`
    };

    const markerRefKey = `nullifierdoor_${keyName}`;  // add this prefix to make these unique among _all_ markers on the map

    return (
        <MarkerAndPopupTemplate
            markerRefKey={markerRefKey}
            position={[nullifier_door.position.x, nullifier_door.position.y]}
            iconOptions={iconOptions}
            popupCheckedState={checked}
            onPopupCheckChange={() => handleChecked(nullifier_door_ls_key, keyName, checked, setChecked)}
            headerRowChildren={
                <h1 className="ml-2 text-xl font-medium">Nullifier Door</h1>
            }
        >
            <div>
                <span className="text-md font-bold">Description: </span>
                <span>{nullifier_door.description}</span>
            </div>
        </MarkerAndPopupTemplate>
    );
}

export const NullifierDoorIcons = Object.keys(nullifier_doors).map(key => {
    const gate = nullifier_doors[key];
    return <NullifierDoorIcon key={key} keyName={key} nullifier_door={gate} />;
});
