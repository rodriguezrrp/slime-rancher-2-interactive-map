import { gordo_ls_key, icon_opacity, icon_template } from "../globals";
import { useContext, useEffect, useState } from "react";
import { FoundContext } from "../FoundContext";
import { Gordo } from "../types";
import L from "leaflet";
import { MapType } from "../CurrentMapContext";
import MarkerAndPopupTemplate from "./MarkerAndPopupTemplate";
import { gordos } from "../data/gordos";
import { handleChecked } from "../util";

export function GordoIcon({ gordo, keyName }: { gordo: Gordo, keyName: string }) {
    const deprecatedKey = `${gordo.name.toLowerCase().replace(" ", "")}${gordo.pos.x}${gordo.pos.y}`;
    const { found, setFound } = useContext(FoundContext);
    const [checked, setChecked] = useState(
        found.gordos ? found.gordos.some((k: string) => k === keyName || k === deprecatedKey) : false
    );

    useEffect(() => {
        setChecked(found.gordos ? found.gordos.some((k: string) => k === keyName || k === deprecatedKey) : false);
    }, [found]);

    useEffect(() => {
        if (checked) {
            setFound({
                ...found,
                gordos: [...found.gordos, keyName],
            });
        } else {
            setFound({
                ...found,
                gordos: [...found.gordos.filter((item: string) => item !== keyName && item !== deprecatedKey)]
            });
        }
    }, [checked]);

    const iconOptions: L.IconOptions = {
        ...icon_template,
        iconUrl: `/icons/gordos/${gordo.image}`,
        className: `${checked && icon_opacity}`
    };

    const markerRefKey = `gordo_${keyName}`;  // add this prefix to make these unique among _all_ markers on the map

    return (
        <MarkerAndPopupTemplate
            markerRefKey={markerRefKey}
            position={[gordo.pos.x, gordo.pos.y]}
            iconOptions={iconOptions}
            popupCheckedState={checked}
            onPopupCheckChange={() => handleChecked(gordo_ls_key, keyName, checked, setChecked, deprecatedKey)}
            headerRowChildren={
                <h1 className="ml-2 text-xl font-medium">{gordo.name}</h1>
            }
        >
            <div>
                <span className="text-md font-bold">Food Requirement: </span>
                <span>{gordo.food}</span>
            </div>

            <div>
                <span className="text-md font-bold">Description: </span>
                <span>{gordo.description}</span>
            </div>

            <div>
                <h2 className="text-md font-bold">Drops:</h2>
                <ul>
                    {gordo.drops.map(drop => {
                        return <li key={`${keyName}${drop}`} className="list-disc ml-5">{drop}</li>;
                    })}
                </ul>
            </div>

            <div>
                <h2 className="text-md font-bold">Unlocks:</h2>
                <ul>
                    {gordo.unlocks.map(unlock => {
                        return <li key={`${keyName}${unlock}`} className="list-disc ml-5">{unlock}</li>;
                    })}
                </ul>
            </div>
        </MarkerAndPopupTemplate>
    );
}

export function GordoIcons(current_map: MapType) {
    return Object.keys(gordos).filter((keyName) => {
        return gordos[keyName].dimension === current_map;
    }).map((keyName) => {
        const gordo = gordos[keyName];
        return <GordoIcon key={keyName} gordo={gordo} keyName={keyName} />;
    });
}
