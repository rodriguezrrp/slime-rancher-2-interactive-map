import { icon_opacity, icon_template, stabilizing_gate_ls_key } from "../globals";
import { useContext, useEffect, useState } from "react";
import { FoundContext } from "../FoundContext";
import L from "leaflet";
import MarkerAndPopupTemplate from "./MarkerAndPopupTemplate";
import { StabilizingGate } from "../types";
import { handleChecked } from "../util";
import { stabilizing_gates } from "../data/stabilizing_gates";

export function StabilizingGateIcon({
    stabilizing_gate,
    keyName,
}: {
    stabilizing_gate: StabilizingGate,
    keyName: string
}) {
    const { found, setFound } = useContext(FoundContext);
    const [checked, setChecked] = useState(
        found.stabilizing_gates ? found.stabilizing_gates.some((k: string) => k === keyName) : false
    );

    useEffect(() => {
        setChecked(found.stabilizing_gates ? found.stabilizing_gates.some((k: string) => k === keyName) : false);
    }, [found]);

    useEffect(() => {
        if (checked) {
            setFound({
                ...found,
                stabilizing_gates: [...found.stabilizing_gates, keyName],
            });
        } else {
            setFound({
                ...found,
                stabilizing_gates: [...found.stabilizing_gates.filter((item: string) => item !== keyName)]
            });
        }
    }, [checked]);

    const iconOptions: L.IconOptions = {
        ...icon_template,
        iconUrl: "/icons/iconMapStabilizerGate.png",
        className: `${checked && icon_opacity}`
    };

    const markerRefKey = `stabilizinggate_${keyName}`;  // add this prefix to make these unique among _all_ markers on the map

    return (
        <MarkerAndPopupTemplate
            markerRefKey={markerRefKey}
            position={[stabilizing_gate.position.x, stabilizing_gate.position.y]}
            iconOptions={iconOptions}
            popupCheckedState={checked}
            onPopupCheckChange={() => handleChecked(stabilizing_gate_ls_key, keyName, checked, setChecked)}
            headerRowChildren={
                <h1 className="ml-2 text-xl font-medium">Stabilizing Gate</h1>
            }
        >
            <div>
                <span className="text-md font-bold">Description: </span>
                <span>{stabilizing_gate.description}</span>
            </div>
        </MarkerAndPopupTemplate>
    );
}

export const StabilizingGateIcons = Object.keys(stabilizing_gates).map(key => {
    const gate = stabilizing_gates[key];
    return <StabilizingGateIcon key={key} keyName={key} stabilizing_gate={gate} />;
});
