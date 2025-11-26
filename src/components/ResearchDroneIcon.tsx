import React, { useContext, useEffect, useState } from "react";
import { ResearchDrone, TranslatedDronePage } from "../types";
import { icon_opacity, icon_template, research_drone_ls_key } from "../globals";
import { AiOutlineClose } from "react-icons/ai";
import { FoundContext } from "../FoundContext";
import L from "leaflet";
import { MapType } from "../CurrentMapContext";
import MarkerAndPopupTemplate from "./MarkerAndPopupTemplate";
import { handleChecked } from "../util";
import { research_drones } from "../data/research_drones";

// TODO: refactor the language to a configuration or settings area?
const curLanguage = "en";

export function ResearchDroneIcon({
    research_drone,
    setShowLog,
    setCurrentLog,
    keyName,
}: {
    research_drone: ResearchDrone,
    setShowLog: React.Dispatch<React.SetStateAction<boolean>>
    setCurrentLog: React.Dispatch<React.SetStateAction<JSX.Element>>
    keyName: string,
}) {
    const deprecatedKey = `${research_drone.name.toLowerCase().replace(" ", "")}${research_drone.pos.x}${research_drone.pos.y}`;
    const { found, setFound } = useContext(FoundContext);
    const [checked, setChecked] = useState(
        found.research_drones ? found.research_drones.some((k: string) => k === keyName || k === deprecatedKey) : false
    );

    useEffect(() => {
        setChecked(found.research_drones ? found.research_drones.some((k: string) => k === keyName || k === deprecatedKey) : false);
    }, [found]);

    useEffect(() => {
        if (checked) {
            setFound({
                ...found,
                research_drones: [...found.research_drones, keyName],
            });
        } else {
            setFound({
                ...found,
                research_drones: [...found.research_drones.filter((item: string) => item !== keyName && item !== deprecatedKey)]
            });
        }
    }, [checked]);

    const iconOptions: L.IconOptions = {
        ...icon_template,
        iconUrl: "/icons/researchDroneFaceIcon.png",
        className: `${checked && icon_opacity}`
    };

    const markerRefKey = `researchdrone_${keyName}`;  // add this prefix to make these unique among _all_ markers on the map

    return (
        <MarkerAndPopupTemplate
            markerRefKey={markerRefKey}
            position={[research_drone.pos.x, research_drone.pos.y]}
            iconOptions={iconOptions}
            popupCheckedState={checked}
            onPopupCheckChange={() => handleChecked(research_drone_ls_key, keyName, checked, setChecked, deprecatedKey)}
            headerRowChildren={
                <h1 className="ml-2 text-xl font-medium">{research_drone.name}</h1>
            }
        >
            <div>
                <span className="text-md font-bold">Description: </span>
                <span>{research_drone.description}</span>
            </div>

            <button
                className="border w-[5rem] mt-2 p-1 self-end"
                onClick={() => {
                    setShowLog(true);
                    setCurrentLog(<Log research_drone={research_drone} setShowLog={setShowLog} />);
                }}
            >
                Access Log
            </button>
        </MarkerAndPopupTemplate>
    );
}

export function Log({
    research_drone,
    setShowLog,
}: {
    research_drone: ResearchDrone,
    setShowLog: React.Dispatch<React.SetStateAction<boolean>>,
}) {
    const [showArchived, setShowArchived] = useState(false);
    const translatedPages = !showArchived ? research_drone.log : research_drone.archive;

    let accessingText = translatedPages[0]?.[curLanguage]?.[0];
    if(!accessingText)
        accessingText = `Accessing GG${!showArchived ? "Log" : "Archive"}:`;

    return (
        <div className={`${!showArchived ? "border-[#0ba0fb] text-white" : "border-[#58faa4] text-[#58faa4]"} max-w-fit log`}>
            <div className="flex flex-col mb-7">
                <div className="flex justify-between items-center mb-7">
                    <span className="font-medium text-2xl">{accessingText}</span>
                    <AiOutlineClose
                        onClick={() => setShowLog(false)}
                        size={25}
                        className="log-close"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    {translatedPages.flatMap((page: TranslatedDronePage, pageInd: number) => (
                        page[curLanguage].map((text: string, lineInd: number) => (
                            pageInd === 0 && lineInd === 0 ? null : <p key={text} className="text-lg monospace-font">{text}</p>
                        )).filter(e => e !== null)
                    ))}
                </div>
            </div>
            <div className="flex justify-end">
                <button
                    className="text-base bg-white py-1 px-2 text-black"
                    onClick={() => setShowArchived(!showArchived)}
                >
                    {!showArchived ? "Access Archive" : "Access Log"}
                </button>
            </div>
        </div>
    );
}

export function ResearchDroneIcons(
    setShowLog: React.Dispatch<React.SetStateAction<boolean>>,
    setCurrentLog: React.Dispatch<React.SetStateAction<JSX.Element>>,
    current_map: MapType
) {
    return Object.keys(research_drones).filter((keyName) => {
        return research_drones[keyName].dimension === current_map;
    }).map((keyName) => {
        const research_drone = research_drones[keyName];
        return <ResearchDroneIcon
            key={keyName}
            research_drone={research_drone}
            setShowLog={setShowLog}
            setCurrentLog={setCurrentLog}
            keyName={keyName}
        />;
    });
}
