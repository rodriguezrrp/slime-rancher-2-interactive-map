export const GLOB_TO_MAP_IMGS = "./_ripped_map_imgs/Map_*.png"

// for files like environmentGorge.unity
export const GLOBS_TO_INTERESTING_SCENES = [
    "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/Scene/Core/environment*.unity",
    "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/Scene/zone*.unity",
    "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/Scene/Core/coreScene*.unity",
    // no idea why pod0863429762 is in IntroCutscene.unity, but it is.
    "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/Scene/IntroCutscene.unity",
];

export const GLOBS_TO_MAP_SPRITE_ASSETS = [
    "./_ripped_unityproj/globalgamemanagers/ExportedProject/Assets/Sprite/Map_{Bluffs,Fields,Strand_CU5,Gorge_CU5,Wall,Labyrinth}.asset"
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

export const PATH_TO_PODS_DATA_FILE = "../src/data/treasure_pods.ts";
