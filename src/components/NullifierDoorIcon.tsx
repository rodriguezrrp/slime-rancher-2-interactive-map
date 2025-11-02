import { Marker, Popup } from "react-leaflet";
import { icon_opacity, icon_template, nullifier_door_ls_key } from "../globals";
import { useContext, useEffect, useState } from "react";
import { FoundContext } from "../FoundContext";
import L from "leaflet";
import { NullifierDoor } from "../types";
import { handleChecked } from "../util";
import { nullifier_doors } from "../data/nullifier_doors";

export function NullifierDoorIcon({
    nullifier_door,
    key_name,
}: {
    nullifier_door: NullifierDoor,
    key_name: string
}) {
    const { found, setFound } = useContext(FoundContext);
    const [checked, setChecked] = useState(
        found.nullifier_doors ? found.nullifier_doors.some((k: string) => k === key_name) : false
    );

    useEffect(() => {
        setChecked(found.nullifier_doors ? found.nullifier_doors.some((k: string) => k === key_name) : false);
    }, [found]);

    useEffect(() => {
        if (checked) {
            setFound({
                ...found,
                nullifier_doors: [...found.nullifier_doors, key_name],
            });
        } else {
            setFound({
                ...found,
                nullifier_doors: [...found.nullifier_doors.filter((item: string) => item !== key_name)]
            });
        }
    }, [checked]);

    const icon = L.icon({
        ...icon_template,
        iconUrl: "/icons/iconGadgetHarmonizer.png",
        className: `${checked && icon_opacity}`
    });

    return (
        <Marker key={key_name} position={[nullifier_door.position.x, nullifier_door.position.y]} icon={icon}>
            <Popup>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center gap-5">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleChecked(nullifier_door_ls_key, key_name, checked, setChecked)}
                                className="w-4 h-4"
                            />
                            <h1 className="ml-2 text-xl font-medium">Nullifier Door</h1>
                        </div>
                    </div>

                    <hr />

                    <div>
                        <span className="text-md font-bold">Description: </span>
                        <span>{nullifier_door.description}</span>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
}

export const NullifierDoorIcons = Object.keys(nullifier_doors).map(key => {
    const gate = nullifier_doors[key];
    return <NullifierDoorIcon key={key} key_name={key} nullifier_door={gate} />;
});
