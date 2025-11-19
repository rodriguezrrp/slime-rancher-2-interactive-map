export const GLOB_TO_MAP_TEXTURES = "./_ripped_mapimgs/{Map_*,*ToLabyrinth}.png"

// for files like environmentGorge.unity
export const GLOBS_TO_INTERESTING_SCENES = [
    "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/Scene/Core/environment*.unity",
    "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/Scene/zone*.unity",
    "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/Scene/Core/coreScene*.unity",
    // no idea why pod0863429762 is in IntroCutscene.unity, but it is.
    "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/Scene/IntroCutscene.unity",
];

export const GLOBS_TO_MAP_SPRITE_ASSETS = [
    "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/Sprite/Map_{Bluffs,Fields,Strand_CU5,Gorge_CU5,Wall,Labyrinth}.asset",
    "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/Sprite/{Gorge,Strand}ToLabyrinth.asset",
];

export const PATH_TO_RAINBOW_ISLAND_MAP_PREFAB = "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/PrefabInstance/RainbowIslandMap.prefab";

export const PATH_TO_LABYRINTH_MAP_PREFAB = "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/PrefabInstance/LabyrinthMap.prefab";

export const GLOBS_TO_POD_COUNTER_LIST_ASSETS = [
    "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/Asset_Bundles/fd4859b3da2a6e825bce490c2d371592.bundle/LookupData/UI/Maps/*MapPodCounter.asset",
    // in case it was extracted differently
    // "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/**/*MapPodCounter.asset",
];

export const GLOBS_TO_SHADOW_DEPO_COUNTER_LIST_ASSETS = [
    "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/Asset_Bundles/fd4859b3da2a6e825bce490c2d371592.bundle/LookupData/UI/Maps/*ShadowCollectorCounter.asset",
    // in case it was extracted differently
    // "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/**/*ShadowCollectorCounter.asset",
];

export const GLOBS_TO_ANCIENT_TELEPORTER_ASSETS = [
    "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/**/{MonoBehaviour,LookupData/World/Teleporters}/Teleporter{OneWay,*[Tt]o}*.asset",
];

export const GLOBS_TO_SCENE_GROUP_ASSETS = [
    "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/Asset_Bundles/*/Scene/Group/*.asset",
    // in case it was extracted differently
    // "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/**/Scene/Group/*.asset",
];

export const GLOB_TO_TELEPORT_NETWORK_DEFINITION = "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/Asset_Bundles/fd4859b3da2a6e825bce490c2d371592.bundle/LookupData/World/Teleporters/StaticTeleportNetworkDefinition.asset";
// in case it was extracted differently
// export const GLOB_TO_TELEPORT_NETWORK_DEFINITION = "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/**/LookupData/World/Teleporters/StaticTeleportNetworkDefinition.asset";

export const GLOBS_TO_INDIVIDUAL_DRONE_ASSETS = [
    "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/Asset_Bundles/0146ab072e7c8fc9d8a61394d1b999d1.bundle/GameData/ResearchDrone/ResearchDrone*.asset",
    // in case it was extracted differently
    // "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/**/ResearchDrone/ResearchDrone*.asset",
];    

const GLOBS_TO_DRONE_LOCALIZATION_TABLES = [
    "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/Asset_Bundles/**/Localization/StringTable/ResearchDrone/ResearchDrone_{en,es,de,fr,ja,ko,pt,ru,zh}.asset",
    // in case it was extracted differently
    // "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/**/Localization/StringTable/ResearchDrone/ResearchDrone_{en,es,de,fr,ja,ko,pt,ru,zh}.asset",
];    

const GLOBS_TO_COMM_LOCALIZATION_TABLES = [
    "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/Asset_Bundles/**/Localization/StringTable/Comm/CommStation_{en,es,de,fr,ja,ko,pt,ru,zh}.asset",
    // in case it was extracted differently
    // "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/**/Localization/StringTable/Comm/CommStation_{en,es,de,fr,ja,ko,pt,ru,zh}.asset",
];    

export const L10N_TABLES_GLOBS = {
    "ResearchDrone": GLOBS_TO_DRONE_LOCALIZATION_TABLES,
    "CommStation": GLOBS_TO_COMM_LOCALIZATION_TABLES,
}    

export const GLOBS_TO_IDENTIFIABLETYPE_AND_DEFINITION_FILES = [
    "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/Asset_Bundles/1937414ef44dd74c104e9348d08dfa93.bundle/Actor/**/IdentifiableType/*.asset",
    "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/Asset_Bundles/1937414ef44dd74c104e9348d08dfa93.bundle/Actor/Slime/**/Definition/*.asset",
    "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/Asset_Bundles/5d6f04b397b0eee4e4b8e60a5f17eb13.bundle/Actor/IdentifiableTypeGroup/**/*.asset"
];

export const PATH_TO_TREASURE_PODS_DATA_FILE = "../src/data/treasure_pods.ts";
export const PATH_TO_SHADOW_DEPOS_DATA_FILE = "../src/data/shadow_doors.ts";
export const PATH_TO_RESEARCH_DRONES_DATA_FILE = "../src/data/research_drones.ts";
export const PATH_TO_GORDOS_DATA_FILE = "../src/data/gordos.ts";
export const PATH_TO_PUZZLE_DOORS_DATA_FILE = "../src/data/locked_doors.ts";
export const PATH_TO_STABILIZING_GATES_DATA_FILE = "../src/data/stabilizing_gates.ts";
export const PATH_TO_NULLIFIER_DOORS_DATA_FILE = "../src/data/nullifier_doors.ts";
export const PATH_TO_PROJECTOR_PUZZLES_DATA_FILE = "../src/data/projector_puzzles.ts";
export const PATH_TO_GIGI_HOLOGRAMS_DATA_FILE = "../src/data/gigi_holograms.ts";
export const PATH_TO_MAP_NODES_DATA_FILE = "../src/data/map_nodes.ts";
export const PATH_TO_TELEPORT_PADS_DATA_FILE = "../src/data/teleport_pads.ts";
export const PATH_TO_TELEPORT_LINES_DATA_FILE = "../src/data/teleport_lines.ts";
export const PATH_TO_PLOT_POSITIONS_DATA_FILE = "../src/data/plot_planner_positions.ts";

export const PATH_TO_RAINBOW_ISLAND_TILEMAP_FOLDER = "../public/map_overworld";
export const PATH_TO_LABYRINTH_TILEMAP_FOLDER = "../public/map_labyrinth";
