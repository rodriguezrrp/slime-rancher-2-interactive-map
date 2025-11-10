import { Marker, Popup } from "react-leaflet";
import { icon_opacity, icon_template, projector_puzzle_ls_key } from "../globals";
import { useContext, useEffect, useState } from "react";
import { FoundContext } from "../FoundContext";
import L from "leaflet";
import { ProjectorPuzzle } from "../types";
import { handleChecked } from "../util";
import { projector_puzzles } from "../data/projector_puzzles";

export function ProjectorPuzzleIcon({
    projector_puzzle,
    projector_puzzle_beampoint,
    puzzle_key_name: key_name,
    beampoint_type,
}: {
    projector_puzzle: ProjectorPuzzle,
    projector_puzzle_beampoint: NonNullable<ProjectorPuzzle["endPoint" | "startPoint"]>,
    puzzle_key_name: string,
    beampoint_type: "start" | "end"
}) {

    const { found, setFound } = useContext(FoundContext);
    const [checked, setChecked] = useState(
        found.projector_puzzles ? found.projector_puzzles.some((k: string) => k === key_name) : false
    );

    useEffect(() => {
        setChecked(found.projector_puzzles ? found.projector_puzzles.some((k: string) => k === key_name) : false);
    }, [found]);

    useEffect(() => {
        if (checked) {
            setFound({
                ...found,
                projector_puzzles: [...found.projector_puzzles, key_name],
            });
        } else {
            setFound({
                ...found,
                projector_puzzles: [...found.projector_puzzles.filter((item: string) => item !== key_name)]
            });
        }
    }, [checked]);

    const icon = L.icon({
        ...icon_template,
        iconUrl: "/icons/iconGadgetRadiantProjector.png",
        className: `${checked && icon_opacity} testing-class-on-leaflet-icons`
    });

    return (
        <Marker key={key_name} position={[projector_puzzle_beampoint.position.x, projector_puzzle_beampoint.position.y]} icon={icon}>
            <Popup>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center gap-5">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleChecked(projector_puzzle_ls_key, key_name, checked, setChecked)}
                                className="w-4 h-4"
                            />
                            <h1 className="ml-2 text-xl font-medium">{projector_puzzle.name + " " + projector_puzzle_beampoint.nameSuffix}</h1>
                        </div>
                    </div>

                    <hr />

                    <div>
                        <span className="text-md font-bold">Description: </span>
                        <span>{projector_puzzle_beampoint.description}</span>
                    </div>

                    <div>
                        <span className="text-md font-bold">Puzzle Unlocks: </span>
                        <span>{projector_puzzle.unlocks}</span>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
}

export const ProjectorPuzzleIcons = Object.keys(projector_puzzles).flatMap(key => {
    const projector_puzzle = projector_puzzles[key];
    let markers: JSX.Element[] = [];
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
