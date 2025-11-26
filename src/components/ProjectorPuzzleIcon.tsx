import { icon_opacity, icon_template, projector_puzzle_ls_key } from "../globals";
import { useContext, useEffect, useState } from "react";
import { FoundContext } from "../FoundContext";
import L from "leaflet";
import MarkerAndPopupTemplate from "./MarkerAndPopupTemplate";
import { ProjectorPuzzle } from "../types";
import { handleChecked } from "../util";
import { projector_puzzles } from "../data/projector_puzzles";

export function ProjectorPuzzleIcon({
    projector_puzzle,
    projector_puzzle_beampoint,
    puzzle_key_name: keyName,
    beampoint_type,
}: {
    projector_puzzle: ProjectorPuzzle,
    projector_puzzle_beampoint: NonNullable<ProjectorPuzzle["endPoint" | "startPoint"]>,
    puzzle_key_name: string,
    beampoint_type: "start" | "end"
}) {

    const { found, setFound } = useContext(FoundContext);
    const [checked, setChecked] = useState(
        found.projector_puzzles ? found.projector_puzzles.some((k: string) => k === keyName) : false
    );

    useEffect(() => {
        setChecked(found.projector_puzzles ? found.projector_puzzles.some((k: string) => k === keyName) : false);
    }, [found]);

    useEffect(() => {
        if (checked) {
            setFound({
                ...found,
                projector_puzzles: [...found.projector_puzzles, keyName],
            });
        } else {
            setFound({
                ...found,
                projector_puzzles: [...found.projector_puzzles.filter((item: string) => item !== keyName)]
            });
        }
    }, [checked]);

    const iconOptions: L.IconOptions = {
        ...icon_template,
        iconUrl: "/icons/iconGadgetRadiantProjector.png",
        className: `${checked && icon_opacity} testing-class-on-leaflet-icons`
    };

    const markerRefKey = `projector_${keyName}_${beampoint_type}`;  // add this prefix to make these unique among _all_ markers on the map

    return (
        <MarkerAndPopupTemplate
            markerRefKey={markerRefKey}
            position={[projector_puzzle_beampoint.position.x, projector_puzzle_beampoint.position.y]}
            iconOptions={iconOptions}
            popupCheckedState={checked}
            onPopupCheckChange={() => handleChecked(projector_puzzle_ls_key, keyName, checked, setChecked)}
            headerRowChildren={
                <h1 className="ml-2 text-xl font-medium">{projector_puzzle.name + " " + projector_puzzle_beampoint.nameSuffix}</h1>
            }
        >

            <div>
                <span className="text-md font-bold">Description: </span>
                <span>{projector_puzzle_beampoint.description}</span>
            </div>

            <div>
                <span className="text-md font-bold">Puzzle Unlocks: </span>
                <span>{projector_puzzle.unlocks}</span>
            </div>
        </MarkerAndPopupTemplate>
    );
}

export const ProjectorPuzzleIcons = Object.keys(projector_puzzles).flatMap(key => {
    const projector_puzzle = projector_puzzles[key];
    const markers: JSX.Element[] = [];
    if(projector_puzzle.startPoint) {
        markers.push(<ProjectorPuzzleIcon
            key={`${key}_start`}
            puzzle_key_name={key}
            beampoint_type="start"
            projector_puzzle={projector_puzzle}
            projector_puzzle_beampoint={projector_puzzle.startPoint}
        />);
    }
    if(projector_puzzle.endPoint) {
        markers.push(<ProjectorPuzzleIcon
            key={`${key}_end`}
            puzzle_key_name={key}
            beampoint_type="end"
            projector_puzzle={projector_puzzle}
            projector_puzzle_beampoint={projector_puzzle.endPoint}
        />);
    }
    return markers;
});
