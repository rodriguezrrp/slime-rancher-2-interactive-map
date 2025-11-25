import { CurrentMapContext, MapType } from "../CurrentMapContext";
import { Found, FoundContext } from "../FoundContext";
import { gigi_holograms } from "../data/gigi_holograms";
import { gordos } from "../data/gordos";
import { locked_doors } from "../data/locked_doors";
import { map_nodes } from "../data/map_nodes";
import { nullifier_doors } from "../data/nullifier_doors";
import { projector_puzzles } from "../data/projector_puzzles";
import { research_drones } from "../data/research_drones";
import { shadow_doors } from "../data/shadow_doors";
import { stabilizing_gates } from "../data/stabilizing_gates";
import { teleport_pads } from "../data/teleport_pads";
import { treasure_pods } from "../data/treasure_pods";
import { useContext } from "react";

const mapNames = {
    [MapType.overworld]: "Rainbow Island (Slime Rancher 2)",
    [MapType.labyrinth]: "Grey Labyrinth (Slime Rancher 2)",
    [MapType.sr1]: "Far, Far Range (Slime Rancher 1)",
};

export default function CollectablesTracker() {
    const { current_map, setCurrentMap } = useContext(CurrentMapContext);
    const { found } = useContext(FoundContext);

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between pb-4">
                <div>
                    <span className="text-lg font-bold">Current Location: </span>
                    <span>{mapNames[current_map]}</span>
                </div>
            </div>
            <div className="flex flex-col pb-4">
                <h2 className="text-md font-bold">Locations</h2>
                <CollectablesTrackerItem
                    name="Gordo Slimes"
                    current_map={current_map}
                    foundList={found.gordos}
                    dataList={gordos}
                />
                <CollectablesTrackerItem
                    name="Locked Doors"
                    current_map={current_map}
                    foundList={found.locked_doors}
                    dataList={locked_doors}
                />
                {current_map === MapType.labyrinth && <CollectablesTrackerItem
                    skipDimensionFilter
                    name="Projector Puzzles"
                    current_map={current_map}
                    foundList={found.projector_puzzles}
                    dataList={projector_puzzles}
                />}
                <CollectablesTrackerItem
                    name="Ancient Teleporters"
                    current_map={current_map}
                    foundList={found.teleport_pads}
                    dataList={teleport_pads}
                />
                {current_map === MapType.labyrinth && <CollectablesTrackerItem
                    skipDimensionFilter
                    name="Shadow Doors"
                    current_map={current_map}
                    foundList={found.shadow_doors}
                    dataList={shadow_doors}
                />}
                {current_map === MapType.labyrinth && <CollectablesTrackerItem
                    skipDimensionFilter
                    name="Stabilizing Gates"
                    current_map={current_map}
                    foundList={found.stabilizing_gates}
                    dataList={stabilizing_gates}
                />}
                {current_map === MapType.labyrinth && <CollectablesTrackerItem
                    skipDimensionFilter
                    name="Nullifier Doors"
                    current_map={current_map}
                    foundList={found.nullifier_doors}
                    dataList={nullifier_doors}
                />}
            </div>
            <div className="flex flex-col pb-4">
                <h2 className="text-md font-bold">Collectables</h2>
                <CollectablesTrackerItem
                    name="Map Nodes"
                    current_map={current_map}
                    foundList={found.map_nodes}
                    dataList={map_nodes}
                />
                <CollectablesTrackerItem
                    name="Treasure Pods"
                    current_map={current_map}
                    foundList={found.treasure_pods}
                    dataList={treasure_pods}
                />
                <CollectablesTrackerItem
                    name="Research Drones"
                    current_map={current_map}
                    foundList={found.research_drones}
                    dataList={research_drones}
                />
                {current_map === MapType.labyrinth && <CollectablesTrackerItem
                    skipDimensionFilter
                    name="Gigi Holograms"
                    current_map={current_map}
                    foundList={found.gigi_holograms}
                    dataList={gigi_holograms}
                />}
            </div>

            <button
                disabled={current_map === MapType.sr1}
                className={"bg-btn outline outline-1 p-1 mt-3 w-full" + (current_map === MapType.sr1 ? " disabled" : "")}
                onClick={() => {
                    if (current_map === MapType.sr1)
                        return;
                    if (current_map === MapType.overworld) {
                        setCurrentMap(MapType.labyrinth);
                    } else {
                        setCurrentMap(MapType.overworld);
                    }
                }}>
                Change Map
            </button>
            <button
                className="bg-btn outline outline-1 p-1 mt-3 w-full"
                onClick={() => {
                    if (current_map === MapType.overworld || current_map === MapType.labyrinth) {
                        setCurrentMap(MapType.sr1);
                    } else {
                        setCurrentMap(MapType.overworld);
                    }
                }}>
                Switch Game
            </button>

        </div>
    );
}

function CollectablesTrackerItem({ current_map, name, foundList, dataList, skipDimensionFilter }: {
    current_map: MapType,
    name: string,
    foundList: Found[keyof Found],
    dataList: { [key: string]: { [x: string]: any, dimension?: MapType } },
    skipDimensionFilter?: boolean
}) {
    const filteredFoundList = foundList.filter(key =>
        // This is required to maintain backwards compatibility - ignore found data's keys when they have changed/disappeared
        dataList[key]
        && (
            skipDimensionFilter ||
            dataList[key].dimension === current_map ||
            // This is required to maintain backwards compatibility
            (dataList[key].dimension === undefined && current_map === MapType.overworld)
        )
    );
    const filteredDataList = (
        skipDimensionFilter
            ? Object.values(dataList)
            : Object.values(dataList).filter(research_drone => research_drone.dimension === current_map)
    );

    if(filteredFoundList.length === 0 && filteredDataList.length === 0) {
        return null;
    }

    return (<span>
        {name} {
            // De-duplicate filteredFoundList in case; for example, it seems to have duplicates with radiant projector puzzles.
            new Set(filteredFoundList).size
        } / {
            filteredDataList.length
        }
    </span>);
}
