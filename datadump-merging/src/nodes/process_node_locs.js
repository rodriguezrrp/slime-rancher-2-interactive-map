
import { GLOBS_TO_INDIVIDUAL_DRONE_ASSETS, GLOBS_TO_INTERESTING_SCENES, GLOBS_TO_POD_COUNTER_LIST_ASSETS, PATH_TO_TREASURE_PODS_DATA_FILE, PATH_TO_SHADOW_DEPOS_DATA_FILE, PATH_TO_RESEARCH_DRONES_DATA_FILE, PATH_TO_GORDOS_DATA_FILE, GLOBS_TO_IDENTIFIABLETYPE_AND_DEFINITION_FILES, PATH_TO_PUZZLE_DOORS_DATA_FILE, PATH_TO_STABILIZING_GATES_DATA_FILE, PATH_TO_NULLIFIER_DOORS_DATA_FILE, L10N_TABLES_GLOBS, PATH_TO_GIGI_HOLOGRAMS_DATA_FILE, PATH_TO_MAP_NODES_DATA_FILE, PATH_TO_PROJECTOR_PUZZLES_DATA_FILE, PATH_TO_TELEPORT_PADS_DATA_FILE, PATH_TO_TELEPORT_LINES_DATA_FILE, GLOBS_TO_ANCIENT_TELEPORTER_ASSETS, GLOB_TO_TELEPORT_NETWORK_DEFINITION, GLOBS_TO_SCENE_GROUP_ASSETS, PATH_TO_PLOT_POSITIONS_DATA_FILE } from "../../asset_paths.js";

import { Glob, globSync } from "glob";
import assert from "node:assert";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";
import { defaultCacheSettings, dumpMassiveHeckinBigObjectToJSON, readMassiveHeckinBigObjectFromJSON, sortStringsWithNumbers, parseUnityFileYamlIntoAssetsMapping, followMonoBehaviourGameObjectTransformChain, setContains, arraysEqual, looseJsonParseWithEval, looseJsonStringify, joinedStringWithOxfordComma, capitalizeFirst, transformIngameToMapPosition, extractL10nTablesToCache, MapType, iterChildGameObjects_DFS, iterGameObjectComponentObjs, fromGlobsMapAssetGUIDsToAssetJSONs } from "./processing_utils.js";
import { readFile } from "node:fs/promises";
import { entryExportFilter } from "./entries_export_filter.js";
import { gigi_manually_noted_conversations } from "../../gigi_manually_noted_conversations.js";
import { getMapRegionsContaining } from "./map_region_def_utils.js";
import { _schema_MapType, _schema_Vec2, matchAgainstSchema, schemautils } from "./schema_utils.js";
// import { transpile } from "typescript";
// const gigi_manually_noted_conversations = eval(transpile(readFileSync("../../gigi_manually_noted_conversations.ts")));

// import { MapType } from "./processing_utils.js";
/** typedef {typeof (import("./processing_utils.js")._MapTypeType)[keyof (import("./processing_utils.js")._MapTypeType)]} MapType */
/** @typedef {(import("../../../src/CurrentMapContext.tsx").MapType)} MapType */

/** @typedef {{ x: number, y: number }} Vec2 */
/** @typedef {{ x: number, y: number, z: number }} Vec3 */
/** @typedef {{ fileKey: string, fileId: number, typeId: number, typeName: string, props: { [objProp: string]: unknown } }} AssetJSONType */
/** @typedef {{ [fileKeyFileId: string]: AssetJSONType }} AssetsMappingType */
/** @typedef {{ useCache?: boolean, exportToCache?: "sync" | "async" | boolean }} CacheOpts */

/** @typedef {{ __noModify?: string[][] }} ExportFilterMetaPropertiesType */

/** @typedef {("assetsmapping" | "pods" | "researchdrones" | "shadowplortdepos" | "gigiholograms" | "nullifierdoors" | "stabilizinggates" | "projectorpuzzles" | "gordos" | "puzzledoors" | "mapnodes" | "teleporters")} ExtractionTypesType */
/** @type {ExtractionTypesType[]} */
const SpecialExtractionTypes = [
    "assetsmapping",
    "translationtables"
];
/** @type {ExtractionTypesType[]} */
export const ExtractionTypes = [
    ...SpecialExtractionTypes,
    "pods",
    "researchdrones",
    "shadowplortdepos",
    "gigiholograms",
    "nullifierdoors",
    "stabilizinggates",
    "projectorpuzzles",
    "gordos",
    "puzzledoors",
    "mapnodes",
    "teleporters"
];


export async function exportAllNodeCoordsFromScenesJSON(
    /** @type {undefined | AssetsMappingType} */
    assetsMapping,
    /** @type {undefined | CacheOpts} */
    cacheOpts,
    /** @type {undefined | null | ExtractionTypesType[]} */
    only
) {
    
    cacheOpts = {...defaultCacheSettings, ...cacheOpts};
    
    const onlySet = Array.isArray(only) && only.length > 0 ? new Set(only.map(s => s.toLowerCase())) : null;

    const onlySpecialExtractionTypes = onlySet !== null && Array.from(onlySet).every(s => SpecialExtractionTypes.includes(s));

    if(onlySpecialExtractionTypes) {
        if(onlySet.has("assetsmapping")) {
            // only get (and presumably cache) assets mapping.
            await getOrExtractScenesAssetsMapping(cacheOpts);
        }
        if(onlySet.has("translationtables")) {
            // only get (and presumably cache) translation tables.
            await justExtractL10nTables(cacheOpts);
        }
        return;
    }
    
    //
    //////////////////////
    // RAINBOW ISLAND
    //////////////////////

    //===============
    // Treasure Pods

    if(onlySet === null || onlySet.has("pods"))
        await exportPodsFromAssetsMapping(assetsMapping, cacheOpts);
    
    //===============
    // Research Drones
    
    if(onlySet === null || onlySet.has("researchdrones"))
        await exportResearchDronesFromAssetsMapping(assetsMapping, cacheOpts);

    //===============
    // Plots

    // Never mind, plots on the map don't seem to line up with actual plot locations.
    // Manually insert this data.
    
    //
    //////////////////////
    // LABYRINTH
    //////////////////////

    //===============
    // Shadow Plort Depos
    
    if(onlySet === null || onlySet.has("shadowplortdepos"))
        await exportShadowPlortDeposFromAssetsMapping(assetsMapping, cacheOpts);
    
    //===============
    // Gigi Holograms
    
    if(onlySet === null || onlySet.has("gigiholograms"))
        await exportGigiHologramsFromAssetsMapping(assetsMapping, cacheOpts);
    
    //===============
    // Nullifier Doors
    
    if(onlySet === null || onlySet.has("nullifierdoors"))
        await exportNullifierDoorsFromAssetsMapping(assetsMapping, cacheOpts);

    //===============
    // Stabilizing Gates
    
    if(onlySet === null || onlySet.has("stabilizinggates"))
        await exportStabilizingGatesFromAssetsMapping(assetsMapping, cacheOpts);

    //===============
    // Radiant Projector Puzzles
    
    if(onlySet === null || onlySet.has("projectorpuzzles"))
        await exportProjectorPuzzlesFromAssetsMapping(assetsMapping, cacheOpts);

    //
    //////////////////////
    // (BOTH MAPS)
    //////////////////////

    //===============
    // Gordo Locations

    if(onlySet === null || onlySet.has("gordos"))
        await exportGordosFromAssetsMapping(assetsMapping, cacheOpts);

    //===============
    // Locked Doors, Plort Receptacle Statues
    
    if(onlySet === null || onlySet.has("puzzledoors"))
        await exportPuzzleDoorsFromAssetsMapping(assetsMapping, cacheOpts);

    //===============
    // Map Nodes
    
    if(onlySet === null || onlySet.has("mapnodes"))
        await exportMapNodesFromAssetsMapping(assetsMapping, cacheOpts);
    
    //===============
    // Teleport Pads, Teleport Lines
    
    if(onlySet === null || onlySet.has("teleporters"))
        await exportTeleportersFromAssetsMapping(assetsMapping, cacheOpts);

}

/** @type {import("./processing_utils.js").LooseStringifyTransformingFunctionsType<unknown>} */
const _jsonStringifyTransformerFns = {
    transformer: (obj, key, keys) => {
        if(obj === MapType.overworld) return { raw: true, val: "MapType.overworld" };
        if(obj === MapType.labyrinth) return { raw: true, val: "MapType.labyrinth" };
        if(obj === MapType.sr1) return { raw: true, val: "MapType.sr1" };
    },
    shouldQuoteKey: (key, depth, keysChain) => depth === 0 ? true : (keysChain.length >= 2 && keysChain[keysChain.length - 2] === "entries") ? true : null,
    shouldInlineObj: (key, depth, keysChain, obj) => {
        // if(depth === 1) return true;// return (Array.isArray(obj) && obj.length <= 1) || key === "pos";
        // if(key === "pos" || (Array.isArray(obj) && obj.length <= 1)) return false;
        // return null;
        return (
            (typeof obj === "object" && arraysEqual(Object.keys(obj).sort(), ["x", "y"]))
            || (Array.isArray(obj) && obj.length <= 1) || (key === "drops" && Array.isArray(obj) && obj.length <= 3)
        ) ? true : null;
    },
    shouldSortKeys: (key, depth, keysChain, obj) => {
        if(depth === 0) return sortStringsWithNumbers;
        if(depth === 1 || (depth === 2 && (key === "startPoint" || key === "endPoint"))) {
            // preferred sort order of the keys of each data object
            const _lookup = Object.fromEntries(["internalId", "internalName", "id", "name", "nameSuffix", "log", "archive", "food", "pos", "position", "image", "drops", "contents", "unlocks", "description", "dimension", "startPoint", "endPoint"].map((v, i) => [v, i]));
            const _default = Object.keys(_lookup).length;
            return (a, b) => ((_lookup[a] ?? _default) - (_lookup[b] ?? _default));
        }
        if(keysChain.length >= 2 && (keysChain[keysChain.length - 2] === "log" || keysChain[keysChain.length - 2] === "archive")) {
            // put "en" lang as first item, order all other lang keys lexographically
            return (a, b) => {
                a = a.toLowerCase(); b = b.toLowerCase();
                return a === b ? 0 : a === "en" ? -1 : b === "en" ? 1 : a < b ? -1 : a > b ? 1 : 0;
            };
        }
    }
};

/** @type {AssetsMappingType} */
let _assetsMapping = null;

async function getOrExtractScenesAssetsMapping(/** @type {CacheOpts} */ cacheOpts) {
    if(!_assetsMapping) {
        if(cacheOpts.useCache) {
            try {
                console.log("Reading cached asset JSON...");
                const multiFile = true;  // TODO see if directory exists first?
                _assetsMapping = await readMassiveHeckinBigObjectFromJSON("./data_cache/assetsFileIdMapping.json", multiFile, (progress) => { console.log(`  - ${(progress*100).toFixed(0)}%`); });
            } catch(e) {
                console.error(`Failed to read cached asset JSON -- ${e}`);
                console.log("Extracting anew instead.");
            }
        }
    
        if(!_assetsMapping) {
            _assetsMapping = await extractScenesToAssetsJSON(cacheOpts);
        }

        _assetsMapping = Object.freeze(_assetsMapping);
    }

    return _assetsMapping;
}

async function exportPodsFromAssetsMapping(/** @type {AssetsMappingType | undefined} */ assetsMapping, /** @type {CacheOpts} */ cacheOpts) {
    
    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    assetsMapping ??= await getOrExtractScenesAssetsMapping(cacheOpts);

    console.log("Extracting pod coordinates from assets JSON...");

    const podIdMonoBehavioursEntries = Object.entries(assetsMapping)
        .filter(([, assetJSON]) => {
        
            const podId = assetJSON.props["_id"];
        
            if(!podId) return false;

            if(!/^pod[0-9]+$/.test(podId)) return false;

            assert(assetJSON.typeName === "MonoBehaviour", "found asset with a pod id in \"_id\" prop, but it was not a MonoBehaviour?");

            return true;

        });

    console.log(`Retrieved ${podIdMonoBehavioursEntries.length} Treasure Pod id MonoBehaviour entries.`);

    const ingamePodPositions = await Promise.all(podIdMonoBehavioursEntries.map(async (/** @type {[ fileId: string, assetJSON: AssetJSONType ]} */ [fileId, assetJSON]) => {

        console.log(`[Treasure Pod ${assetJSON.props["_id"]}]: Determining position of pod`);

        const { gameObj: podGameObj, transformChainChildToParent, position } = followMonoBehaviourGameObjectTransformChain(assetsMapping, assetJSON);

        console.log(`[Treasure Pod ${assetJSON.props["_id"]}]: Through a chain of ${transformChainChildToParent.length} transform(s), found position to be ${JSON.stringify(position)}`);

        return {fileId, assetJSON, podGameObj, position};

    }));

    console.log("Determined treasure pod positions.");
    // console.log('podPositions:', podPositions);

    //
    if(cacheOpts.exportToCache) {
        const _export = () => {
            writeFileSync("./data_cache/podPositions.json", JSON.stringify(ingamePodPositions));
            console.log("Exported treasure pod positions to cache.");
        };
        if(cacheOpts.exportToCache === "sync") {
            console.log("Exporting treasure pod positions to cache...")
            _export();
        }
        else (async () => { _export(); })();
    }

    console.log("Parsing existing treasure pod data in the map data files...")

    const { fnWriteTSDataBackToFile: fnWritePodsBackToFile, existingTSDataByTsDataKey: existingPodTSDataByPodKey } = readExistingTreasurePodTSData(cacheOpts);

    console.log(`Parsed ${Object.keys(existingPodTSDataByPodKey).length} existing treasure pod data entries.`);

    /** @type {{ [tsDataPodKey: string]: { contents: string[], internalId: string, internalName: string, description: string, pos: { x: number, y: number } } }} */
    const mergedPodTSData = { };

    console.log("Merging existing and extracted treasure pod data");
    
    // merge existing and extracted pod data
    
    for(const { assetJSON, podGameObj: podGameObjJSON, position } of ingamePodPositions) {
        /** @type {string} */
        const internalPodId = assetJSON.props["_id"];

        /** @type {string} */
        const internalName = podGameObjJSON.props["m_Name"];

        const oldPodId = podIdInternalToOld(internalPodId);

        let areaNameForKey;
        if(!oldPodId) {
            areaNameForKey = podGroupOfPodId(internalPodId, cacheOpts)?.toLowerCase().replace(" ","")
                ?? "undeterminedarea";
        }
        const tsDataKey = oldPodId ?? (`treasure_${areaNameForKey}_${internalPodId}`);

        // console.log(internalPodId, internalName, oldPodId, tsDataKey);

        /** @type {undefined | existingPodTSDataByPodKey[keyof existingPodTSDataByPodKey]} */
        const existingData = (
            existingPodTSDataByPodKey[oldPodId]
            || existingPodTSDataByPodKey[internalPodId]
            || existingPodTSDataByPodKey[tsDataKey]
            || Object.values(existingPodTSDataByPodKey).find(data => data.internalId === internalPodId)
        );

        // console.log(existingData);
    
        mergedPodTSData[tsDataKey] = {
            internalId: internalPodId,
            internalName: /*existingData?.internalName ??*/ internalName,
            contents: existingData?.contents ?? ["Todo: Specify contents of this pod"],
            description: existingData?.description ?? "Todo: insert a description for this pod",
            // In-game coordinate system is at 90 degrees to our map; swap x and y axes.
            // pos: /*existingData?.pos ??*/ { x: -position.z, y: position.x },
            pos: transformIngameToMapPosition(position),
            dimension: existingData?.dimension ?? "MapType.overworld",
        };
        if(existingData?._otherLines) {
            mergedPodTSData[tsDataKey]._otherLines = existingData?._otherLines;
        }

        if(existingData)
            console.log(`Merged extracted treasure pod ${internalPodId} data with existing ${tsDataKey} data`);
        else
            console.log(`Inserted extracted treasure pod ${internalPodId} data to ${tsDataKey} data`)
    }

    console.log("Writing treasure pod data back to map data file");

    fnWritePodsBackToFile(mergedPodTSData);

}

/** @typedef {{ fileId: string, assetJSON: AssetJSONType, depoGameObj: AssetJSONType, position: { x: number, y: number, z: number } }[]} ShadowDepoPosCacheType */

/** @type {ShadowDepoPosCacheType} */
let _shDepoPosCache = null;

/** refactored this out and cached it because the shadow depo data is used both by the shadow plort depo extraction and the locked doors extraction */
function getOrLoadShadowDepoPositionCache(/** @type {CacheOpts} */ cacheOpts, /** @type {ShadowDepoPosCacheType | null} */ defaultValueInstead = null) {
    if(typeof _shDepoPosCache === "undefined" || _shDepoPosCache === null) {
        if(defaultValueInstead) {
            _shDepoPosCache = defaultValueInstead;
        }
        else {
            if(cacheOpts.useCache && existsSync("./data_cache/shdepoPositions.json")) {
                console.log("Reading cached shadow plort depo coordinates...");
                _shDepoPosCache = JSON.parse(readFileSync("./data_cache/shdepoPositions.json"));
                console.log(`Read (${_shDepoPosCache.length}) shadow plort depo coordinates from cache file.`);
            }
            else {
                // TODO
                throw new Error("todo need to generate and cache the shdepoPositions.json; move logic from the exportShadowPlortDeposFromAssetsMapping function?");
            }
        }
    }
    return _shDepoPosCache;
}

async function exportShadowPlortDeposFromAssetsMapping(/** @type {AssetsMappingType | undefined} */ assetsMapping, /** @type {CacheOpts} */ cacheOpts) {
    
    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    /** @type {ShadowDepoPosCacheType} */
    let ingameShDepoPositions;

    if(cacheOpts.useCache && existsSync("./data_cache/shdepoPositions.json")) {
    // if(false) {  // for debugging
        
        console.log("Reading cached shadow plort depo coordinates...");

        ingameShDepoPositions = JSON.parse(readFileSync("./data_cache/shdepoPositions.json"));

        console.log(`Read (${ingameShDepoPositions.length}) shadow plort depo coordinates from cache file.`);

    } else {

        assetsMapping ??= await getOrExtractScenesAssetsMapping(cacheOpts);

        console.log("Extracting shadow plort depo coordinates from assets JSON...");

        // assert(typeof assetsMapping[0] === "undefined" || assetsMapping[0] === null, `Why was there a value for fileId 0? ${assetsMapping[0]}`);

        const depoIdMonoBehavioursEntries = Object.entries(assetsMapping)
            .filter(([, assetJSON]) => {
            
                const depoId = assetJSON.props["_id"];
            
                if(!depoId) return false;

                if(!/^plortdepo[0-9]+$/.test(depoId)) return false;

                assert(assetJSON.typeName === "MonoBehaviour", "found asset with a shadow plort depo id in \"_id\" prop, but it was not a MonoBehaviour?");

                return true;

            });

        console.log(`Retrieved ${depoIdMonoBehavioursEntries.length} shadow plort depo id MonoBehaviour entries.`);

        // ingameShDepoPositions = await Promise.all(depoIdMonoBehavioursEntries.map(mapFnDetermineShDepoPosition(assetsMapping)));
        ingameShDepoPositions = await Promise.all(depoIdMonoBehavioursEntries.map(async (/** @type {[ fileId: string, assetJSON: AssetJSONType ]} */ [fileId, assetJSON]) => {

            console.log(`[Shadow Plort Depo ${assetJSON.props["_id"]}]: Determining position of shadow depo`);

            const { gameObj: depoGameObj, transformChainChildToParent, position } = followMonoBehaviourGameObjectTransformChain(assetsMapping, assetJSON);

            for(const child of transformChainChildToParent) {
                console.log(child.typeName);
                console.log(child.fileKey);
                console.log(child.fileId);
                console.log(child.props["m_LocalPosition"]);
                console.log(child.props["m_LocalRotation"]);
                console.log(child.props["m_LocalScale"]);
            }

            console.log(`[Shadow Plort Depo ${assetJSON.props["_id"]}]: Through a chain of ${transformChainChildToParent.length} transform(s), found position to be ${JSON.stringify(position)}`);

            return {fileId, assetJSON, depoGameObj, position};

        }));

        console.log(`Determined ${ingameShDepoPositions.length} shadow plort depo positions.`);
        // console.log('shdepoPositions:', shdepoPositions);

        // for debugging, cache the whole transform chain as well (and each transform's gameObject for good measure)
        for(const d of ingameShDepoPositions) {
            const {gameObj:depoGameObj,position,transformChainChildToParent} = followMonoBehaviourGameObjectTransformChain(assetsMapping, d.assetJSON);
            d.transformChainChildToParent = transformChainChildToParent.map(c => {
                const gameObj = assetsMapping[c.fileKey + "&" + c.props["m_GameObject"]["fileID"]];
                return { ...c, gameObject: gameObj };
            });
        }

        if(cacheOpts.exportToCache) {
            const _export = () => {
                writeFileSync("./data_cache/shdepoPositions.json", JSON.stringify(ingameShDepoPositions));
                console.log("Exported shadow plort depo positions to cache.");
            };
            if(cacheOpts.exportToCache === "sync") {
                console.log("Exporting shadow plort depo positions to cache...")
                _export();
            }
            else (async () => { _export(); })();
        }

    }

    console.log("Parsing existing shadow plort depo data in the map data files...")

    const { fnWriteShDeposBackToFile, existingShDepoTSDataByDepoKey } = readExistingShadowPlortDepoTSData(cacheOpts);

    console.log(`Parsed ${Object.keys(existingShDepoTSDataByDepoKey).length} existing shadow plort depo data entries.`);

    /** @type {{ [tsDataShDepoKey: string]: ExistingShDepoDataType }} */
    const mergedShDepoTSData = { ...existingShDepoTSDataByDepoKey };

    console.log("Merging existing and extracted shadow plort depo data");
    
    // merge existing and extracted shadow depo data
    
    for(const { assetJSON, depoGameObj: depoGameObjJSON, position, transformChainChildToParent, _debugExtraDesc } of ingameShDepoPositions) {
        /** @type {string} */
        const internalDepoId = assetJSON.props["_id"];

        // /** @type {string} */
        // const internalName = depoGameObjJSON.props["m_Name"];

        const amountRequired = assetJSON.props["_fillAmount"];

        const oldDepoId = shadowDepoIdInternalToOld(internalDepoId);

        // let areaNameForKey;
        // if(!oldDepoId) {
        //     areaNameForKey = groupOfDepoId(internalDepoId, cacheOpts)?.toLowerCase().replace(" ","")
        //         ?? "undeterminedarea";
        // }
        // const tsDataKey = oldDepoId ?? (`shadowdoor_${areaNameForKey}_${internalDepoId}`);
        const tsDataKey = oldDepoId ?? (`shadowdoor_${internalDepoId}`);

        // console.log(internalPodId, internalName, oldPodId, tsDataKey);

        /** @type {undefined | existingShDepoTSDataByDepoKey[keyof existingShDepoTSDataByDepoKey]} */
        const existingData = (
            existingShDepoTSDataByDepoKey[oldDepoId]
            || existingShDepoTSDataByDepoKey[internalDepoId]
            || existingShDepoTSDataByDepoKey[tsDataKey]
            || Object.values(existingShDepoTSDataByDepoKey).find(data => data.internalId === internalDepoId)
        );

        // remove existingData object from the merged data mapping;
        // we will be overwriting it later with the "standardized" tsDataKey
        for(const [k, v] of Object.entries(mergedShDepoTSData)) {
            if(v === existingData) {
                delete mergedShDepoTSData[k];
                break;
            }
        }

        mergedShDepoTSData[tsDataKey] = {
            internalId: internalDepoId,
            // internal name on the game object was always "TriggerActivate"
            // internalName: /*existingData?.internalName ??*/ internalName,
            // actually, the father transform's game object seems to have a meaningful name (in most cases)
            internalName: transformChainChildToParent[1]["gameObject"].props["m_Name"],
            unlocks: existingData?.unlocks ?? ["Todo: Specify unlocks of this shadow door"],
            description: existingData?.description ?? "Todo: insert a description for this shadow door " + internalDepoId,
            // In-game coordinate system is at 90 degrees to our map; swap x and y axes.
            // position: { x: -position.z, y: position.x },
            position: transformIngameToMapPosition(position),
            // position: { x: position.x, y: position.z },
            // position: { x: -position.x, y: -position.z },
            _otherLines: existingData?._otherLines,
            // amount_required: amountRequired ?? existingData?.amount_required ?? "\"Todo: specify amount required\"",
            amount_required: _debugExtraDesc && JSON.stringify(_debugExtraDesc) || amountRequired,
        };

        if(existingData)
            console.log(`Merged extracted shadow plort depo ${internalDepoId} data with existing ${tsDataKey} data`);
        else
            console.log(`Inserted extracted shadow plort depo ${internalDepoId} data to ${tsDataKey} data`)
    }

    console.log("Writing shadow plort depo data back to map data file");

    fnWriteShDeposBackToFile(mergedShDepoTSData);
}

async function exportResearchDronesFromAssetsMapping(/** @type {AssetsMappingType | undefined} */ assetsMapping, /** @type {CacheOpts} */ cacheOpts) {

    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    /** @type {{ fileId: string, assetJSON: AssetJSONType, droneGameObj: AssetJSONType, referenceAssetJSON: AssetJSONType, archiveAssetJSON?: AssetJSONType, position: { x: number, y: number, z: number } }[]} */
    let ingameDronePositions;
    
    if(cacheOpts.useCache && existsSync("./data_cache/droneAssetsAndPositions.json")) {
    // if(false) {  // for debugging
        
        console.log("Reading cached research drone coordinates...");

        ingameDronePositions = JSON.parse(readFileSync("./data_cache/droneAssetsAndPositions.json"));

        console.log(`Read (${ingameDronePositions.length}) research drone coordinates from cache file.`);

    } else {

        assetsMapping ??= await getOrExtractScenesAssetsMapping(cacheOpts);

        console.log("Extracting research drone coordinates from assets JSON...");

        const droneEntryMonoBehavioursEntries = Object.entries(assetsMapping)
            .filter(([, assetJSON]) => {
            
                const droneEntry = assetJSON.props["_researchDroneEntry"];
            
                if(!droneEntry) return false;

                if(assetJSON.typeName !== "MonoBehaviour") {
                    console.log(assetJSON);
                    throw new Error("found asset with a _researchDroneEntry, but it was not a MonoBehaviour?");
                }

                return true;

            });

        console.log(`Retrieved ${droneEntryMonoBehavioursEntries.length} research drone entry MonoBehaviour entries.`);

        /** @type {{ [fileGUID: string]: AssetJSONType }} */
        const mapDroneEntryGUIDtoAssetJSONs = { };

        const metaFileGuidRegex = /^guid: *([0-9a-f]{32})$/im;
    
        const droneEntryAssetFilePaths = globSync(GLOBS_TO_INDIVIDUAL_DRONE_ASSETS);

        await Promise.all(droneEntryAssetFilePaths.map(
            async (assetpath) => {
                // const filenameNoExt = basename(assetpath).split(".")[0];

                const metadata = await readFile(assetpath + ".meta", { encoding: "utf-8" });
                const guid = metaFileGuidRegex.exec(metadata)[1];
                
                /** @type {AssetsMappingType} */
                const droneEntryAssetsMapping = { }
                parseUnityFileYamlIntoAssetsMapping(assetpath, droneEntryAssetsMapping, undefined, (/** @type {string} */ fileData) => {
                    // Because yaml library tries to parse the key id as number and loses precision. Surround it in quotes.
                    return fileData.replaceAll(/(m_TableEntryReference:\s+m_KeyId:\s+)(\d+)(\s)/g, "$1\"$2\"$3");
                });
                if(Object.keys(droneEntryAssetsMapping).length !== 1) {
                    throw new Error("Expected only one asset to be in the drone asset file");
                }
                const droneEntryAssetJSON = Object.values(droneEntryAssetsMapping)[0];

                mapDroneEntryGUIDtoAssetJSONs[guid] = droneEntryAssetJSON;
            }
        ));
        // throw new Error("temp");

        // ingameDronePositions = await Promise.all(droneEntryMonoBehavioursEntries.map(mapFnDetermineResearchDronePosition(assetsMapping)));
        ingameDronePositions = await Promise.all(droneEntryMonoBehavioursEntries.map(async (/** @type {[ fileId: string, assetJSON: AssetJSONType ]} */ [fileId, assetJSON]) => {
            
            const referenceAssetJSON = mapDroneEntryGUIDtoAssetJSONs[assetJSON.props["_researchDroneEntry"]["guid"]];

            console.log(`[Research Drone ${referenceAssetJSON.props["referenceId"]}]: Extracting drone log and archive (if archive exists)`);

            const _archiveGUID = referenceAssetJSON.props["archivedEntry"]?.["guid"];
            const archiveAssetJSON = _archiveGUID && mapDroneEntryGUIDtoAssetJSONs[_archiveGUID];
            if(_archiveGUID && !archiveAssetJSON) {
                throw new Error(`There was an archiveEntry GUID of ${JSON.stringify(_archiveGUID)}, but no asset matching that GUID was found?`);
            }

            console.log(`[Research Drone ${referenceAssetJSON.props["referenceId"]}]: Determining position of drone`);

            const { gameObj: droneGameObj, transformChainChildToParent, position: pos } = followMonoBehaviourGameObjectTransformChain(assetsMapping, assetJSON);

            // for(const child of transformChainChildToParent) {
            //     console.log(child.typeName);
            //     console.log(child.fileKey);
            //     console.log(child.fileId);
            //     console.log(child.props["m_LocalPosition"]);
            //     console.log(child.props["m_LocalRotation"]);
            //     console.log(child.props["m_LocalScale"]);
            // }

            console.log(`[Research Drone ${referenceAssetJSON.props["referenceId"]}]: Through a chain of ${transformChainChildToParent.length} transform(s), found position to be ${JSON.stringify(pos)}`);

            return { fileId, assetJSON, droneGameObj, referenceAssetJSON, archiveAssetJSON, pos };

        }));

        console.log(`Determined ${ingameDronePositions.length} research drone assets and their positions.`);
        
        // // for debugging, cache the whole transform chain as well (and each transform's gameObject for good measure)
        // for(const d of ingameDronePositions) {
        //     const {podGameObj:depoGameObj,position,transformChainChildToParent} = followMonoBehaviourGameObjectTransformChain(assetsMapping, d.assetJSON);
        //     d.transformChainChildToParent = transformChainChildToParent.map(c => {
        //         const gameObj = assetsMapping[c.fileKey + "&" + c.props["m_GameObject"]["fileID"]];
        //         return { ...c, gameObject: gameObj };
        //     });
        // }

        if(cacheOpts.exportToCache) {
            const _export = () => {
                writeFileSync("./data_cache/droneAssetsAndPositions.json", JSON.stringify(ingameDronePositions));
                console.log("Exported research drone assets and their positions to cache.");
            };
            if(cacheOpts.exportToCache === "sync") {
                console.log("Exporting research drone assets and their positions to cache...")
                _export();
            }
            else (async () => { _export(); })();
        }

    }


    console.log("Parsing existing research drone data in the map data files...")

    const { fnWriteDronesBackToFile, existingDroneTSDataByDroneKey } = readExistingResearchDroneTSData(cacheOpts);

    console.log(`Parsed ${Object.keys(existingDroneTSDataByDroneKey).length} existing research drone data entries.`);

    /** @type {{ [tsDataDroneKey: string]: ExistingDroneDataType }} */
    const mergedDroneTSData = { ...existingDroneTSDataByDroneKey };

    console.log("Merging existing and extracted research drone data");
    
    // merge existing and extracted research drone data
    
    for(const { assetJSON, droneGameObj: droneGameObjJSON, referenceAssetJSON, archiveAssetJSON, pos } of ingameDronePositions) {
        /** @type {string} */
        // const internalDroneId = assetJSON.props["_id"];
        const internalDroneId = referenceAssetJSON.props["referenceId"];

        // /** @type {string} */
        // const internalName = droneGameObjJSON.props["m_Name"];

        const oldDroneId = droneIdInternalToOld(internalDroneId);

        let areaNameForKey;
        // TODO determine area name?
        if(!oldDroneId) {
            // areaNameForKey = groupOfDroneId(internalDroneId, cacheOpts)?.toLowerCase().replace(" ","")
            //     ?? "undeterminedarea";
            areaNameForKey = "undeterminedarea";
        }
        const tsDataKey = oldDroneId ?? (`research_${areaNameForKey}_${internalDroneId}`);

        // console.log(internalPodId, internalName, oldPodId, tsDataKey);

        /** @type {undefined | existingDroneTSDataByDroneKey[keyof existingDroneTSDataByDroneKey]} */
        const existingData = (
            existingDroneTSDataByDroneKey[oldDroneId]
            || existingDroneTSDataByDroneKey[internalDroneId]
            || existingDroneTSDataByDroneKey[tsDataKey]
            || Object.values(existingDroneTSDataByDroneKey).find(data => data.internalId === internalDroneId)
        );

        // remove existingData object from the merged data mapping;
        // we will be overwriting it later with the "standardized" tsDataKey
        for(const [k, v] of Object.entries(mergedDroneTSData)) {
            if(v === existingData) {
                delete mergedDroneTSData[k];
                break;
            }
        }

        const _translationsOfPage = page => {
            if(page["m_LocalVariables"] && page["m_LocalVariables"].length > 0)
                throw new Error(`Was not ready to handle page's m_LocalVariables ${JSON.stringify(page["m_LocalVariables"])}`);
            return dronePageTranslationsFor(page["m_TableEntryReference"]["m_KeyId"], cacheOpts);
        };

        const log = referenceAssetJSON.props["pages"].map(_translationsOfPage);
        const archive = archiveAssetJSON?.props["pages"].map(_translationsOfPage);

        const _mergedDataObj = {
            internalId: internalDroneId,
            // name: existingData?.name ?? ["TODO retrieve name from translation table"],
            name: existingData?.name ?? "Research Drone",
            log: log ?? existingData?.log ?? [{"en":["Todo: insert the correct log for this research drone"]}],
            archive: archive ?? existingData?.archive ?? [],
            description: existingData?.description ?? "Todo: insert a description for this research drone " + internalDroneId,
            // In-game coordinate system is at 90 degrees to our map; swap x and y axes.
            // pos: { x: -pos.z, y: pos.x },
            pos: transformIngameToMapPosition(pos),
            // dimension: existingData?.dimension ?? "MapType.overworld",
            dimension: existingData?.dimension ?? MapType.overworld,
            _otherLines: existingData?._otherLines,
        };
        // clear out all entries with undefined values
        Object.keys(_mergedDataObj).forEach(key => typeof _mergedDataObj[key] === "undefined" && delete _mergedDataObj[key]);
        // save merged data back
        mergedDroneTSData[tsDataKey] = _mergedDataObj;

        if(existingData)
            console.log(`Merged extracted research drone ${internalDroneId} data with existing ${tsDataKey} data`);
        else
            console.log(`Inserted extracted research drone ${internalDroneId} data to ${tsDataKey} data`)
    }

    console.log("Writing research drone data back to map data file");

    fnWriteDronesBackToFile(mergedDroneTSData);
}

async function exportGordosFromAssetsMapping(/** @type {AssetsMappingType | undefined} */ assetsMapping, /** @type {CacheOpts} */ cacheOpts) {

    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    /** @type {{ fileId: string, assetJSON: AssetJSONType, gordoGameObj: AssetJSONType, targetCount: number, slimeDefinitionAssetJson: AssetJSONType, dietGroupsAssetsJSON: AssetJSONType[], favoriteFoodsAssetJSON?: AssetJSONType[], drops?: string[], position: { x: number, y: number, z: number } }[]} */
    let ingameGordoPositions;
    
    if(cacheOpts.useCache && existsSync("./data_cache/gordoAssetsAndPositions.json")) {
    // if(false) {  // for debugging
        
        console.log("Reading cached gordo coordinates...");

        ingameGordoPositions = JSON.parse(readFileSync("./data_cache/gordoAssetsAndPositions.json"));

        console.log(`Read (${ingameGordoPositions.length}) gordo coordinates from cache file.`);

    } else {

        assetsMapping ??= await getOrExtractScenesAssetsMapping(cacheOpts);

        console.log("Extracting gordo coordinates from assets JSON...");

        const gordoMonoBehavioursEntries = Object.entries(assetsMapping)
            .filter(([, assetJSON]) => {
            
                const gordoId = assetJSON.props["_id"];
            
                if(!gordoId) return false;

                if(!/^gordo[0-9]+$/.test(gordoId)) return false;

                if(assetJSON.typeName !== "MonoBehaviour") {
                    console.log(assetJSON);
                    throw new Error("found asset with a pod id in \"_id\" prop, but it was not a MonoBehaviour?");
                }

                return true;

            });

        console.log(`Retrieved ${gordoMonoBehavioursEntries.length} gordo MonoBehaviour entries.`);

        /** @type {{ [fileGUID: string]: AssetJSONType }} */
        const mapIdentAndDefGUIDtoAssetJSONs = { };

        const metaFileGuidRegex = /^guid: *([0-9a-f]{32})$/im;
    
        const identsAndDefsFilePaths = globSync(GLOBS_TO_IDENTIFIABLETYPE_AND_DEFINITION_FILES);

        await Promise.all(identsAndDefsFilePaths.map(
            async (assetpath) => {
                // const filenameNoExt = basename(assetpath).split(".")[0];

                const metadata = await readFile(assetpath + ".meta", { encoding: "utf-8" });
                const guid = metaFileGuidRegex.exec(metadata)[1];
                
                /** @type {AssetsMappingType} */
                const identOrDefAssetsMapping = { }
                parseUnityFileYamlIntoAssetsMapping(assetpath, identOrDefAssetsMapping);
                if(Object.keys(identOrDefAssetsMapping).length !== 1) {
                    throw new Error("Expected only one asset to be in the identifiable type asset or definition asset file");
                }
                const identOrDefAssetJSON = Object.values(identOrDefAssetsMapping)[0];

                mapIdentAndDefGUIDtoAssetJSONs[guid] = identOrDefAssetJSON;
            }
        ));
        // throw new Error("temp");

        // ingameDronePositions = await Promise.all(droneEntryMonoBehavioursEntries.map(mapFnDetermineResearchDronePosition(assetsMapping)));
        ingameGordoPositions = await Promise.all(gordoMonoBehavioursEntries.map(async (/** @type {[ fileId: string, assetJSON: AssetJSONType ]} */ [fileId, assetJSON]) => {
            
            const slimeDefinitionAssetJSON = mapIdentAndDefGUIDtoAssetJSONs[assetJSON.props["SlimeDefinition"]["guid"]];

            const targetCount = assetJSON.props["TargetCount"];
            if(typeof targetCount !== "number" || targetCount <= 0) {
                throw new Error(`Expected gordo asset ${assetJSON.props["_id"]} to have a positive numeric TargetCount property, but got ${JSON.stringify(targetCount)}`);
            }

            const dietGroupsAssetsJSON = slimeDefinitionAssetJSON.props["Diet"]["MajorFoodIdentifiableTypeGroups"].map((/** @type {{ guid: string }} */ groupRef) => {
                const groupAssetJSON = mapIdentAndDefGUIDtoAssetJSONs[groupRef.guid];
                if(!groupAssetJSON) {
                    throw new Error(`Could not find diet group identifiable type asset with guid ${groupRef.guid} for gordo ${assetJSON.props["_id"]}`);
                }
                return groupAssetJSON;
            });

            const favoriteFoodsAssetJSON = slimeDefinitionAssetJSON.props["Diet"]["FavoriteIdents"].map((/** @type {{ guid: string }} */ groupRef) => {
                const foodAssetJSON = mapIdentAndDefGUIDtoAssetJSONs[groupRef.guid];
                if(!foodAssetJSON) {
                    throw new Error(`Could not find favorite food identifiable type asset with guid ${groupRef.guid} for gordo ${assetJSON.props["_id"]}`);
                }
                return foodAssetJSON;
            });

            console.log(`[Gordo ${assetJSON.props["_id"]}]: Determining position of gordo`);

            const { gameObj: gordoGameObj, transformChainChildToParent, position: pos } = followMonoBehaviourGameObjectTransformChain(assetsMapping, assetJSON);

            // for(const child of transformChainChildToParent) {
            //     console.log(child.typeName);
            //     console.log(child.fileKey);
            //     console.log(child.fileId);
            //     console.log(child.props["m_LocalPosition"]);
            //     console.log(child.props["m_LocalRotation"]);
            //     console.log(child.props["m_LocalScale"]);
            // }

            console.log(`[Gordo ${assetJSON.props["_id"]}]: Through a chain of ${transformChainChildToParent.length} transform(s), found position to be ${JSON.stringify(pos)}`);

            return { fileId, assetJSON, gordoGameObj, targetCount, slimeDefinitionAssetJSON, dietGroupsAssetsJSON, favoriteFoodsAssetJSON, pos };

        }));

        console.log(`Determined ${ingameGordoPositions.length} gordo assets and their positions.`);
        
        // // for debugging, cache the whole transform chain as well (and each transform's gameObject for good measure)
        // for(const d of ingameDronePositions) {
        //     const {podGameObj:depoGameObj,position,transformChainChildToParent} = followMonoBehaviourGameObjectTransformChain(assetsMapping, d.assetJSON);
        //     d.transformChainChildToParent = transformChainChildToParent.map(c => {
        //         const gameObj = assetsMapping[c.fileKey + "&" + c.props["m_GameObject"]["fileID"]];
        //         return { ...c, gameObject: gameObj };
        //     });
        // }

        if(cacheOpts.exportToCache) {
            const _export = () => {
                writeFileSync("./data_cache/gordoAssetsAndPositions.json", JSON.stringify(ingameGordoPositions));
                console.log("Exported gordo assets and their positions to cache.");
            };
            if(cacheOpts.exportToCache === "sync") {
                console.log("Exporting gordo assets and their positions to cache...")
                _export();
            }
            else (async () => { _export(); })();
        }

    }


    console.log("Parsing existing gordo data in the map data files...")

    const { fnWriteGordosBackToFile, existingGordoTSDataByDroneKey } = readExistingGordoTSData(cacheOpts);

    console.log(`Parsed ${Object.keys(existingGordoTSDataByDroneKey).length} existing gordo data entries.`);

    const mergedGordoTSData = { ...existingGordoTSDataByDroneKey };

    console.log("Merging existing and extracted gordo data");
    
    // merge existing and extracted gordo data
    
    for(const { assetJSON, gordoGameObj: gordoGameObjJSON, referenceAssetJSON, slimeDefinitionAssetJSON, dietGroupsAssetsJSON, favoriteFoodsAssetJSON, targetCount, pos } of ingameGordoPositions) {
        /** @type {string} */
        const internalGordoId = assetJSON.props["_id"];

        // /** @type {string} */
        // const internalName = droneGameObjJSON.props["m_Name"];

        /** @type {string} */
        const slimetype = slimeDefinitionAssetJSON.props["Name"]?.toLowerCase() ?? "unknownslimetype";

        // for testing
        // const gordoIdInternalToOld = (x) => undefined;
        
        const oldGordoId = gordoIdInternalToOld(internalGordoId);

        let areaNameForKey;
        // TODO determine area name?
        if(!oldGordoId) {
            console.log("debug: fileKey: ", assetJSON.fileKey);
            // make a best guess based on what scene file the asset was in.
            areaNameForKey = /((?:environment|zone|coreScene)[a-z0-9_]+).unity/i.exec(assetJSON.fileKey)[1].toLowerCase().replace("_","")
                ?? "undeterminedarea";
        }
        const tsDataKey = oldGordoId ?? (`${slimetype}gordo_${areaNameForKey}_${internalGordoId}`);

        // console.log(internalPodId, internalName, oldPodId, tsDataKey);

        /** @type {undefined | existingGordoTSDataByDroneKey[keyof existingGordoTSDataByDroneKey]} */
        const existingData = (
            existingGordoTSDataByDroneKey[oldGordoId]
            || existingGordoTSDataByDroneKey[internalGordoId]
            || existingGordoTSDataByDroneKey[tsDataKey]
            || Object.values(existingGordoTSDataByDroneKey).find(data => data.internalId === internalGordoId)
        );

        // remove existingData object from the merged data mapping;
        // we will be overwriting it later with the "standardized" tsDataKey
        for(const [k, v] of Object.entries(mergedGordoTSData)) {
            if(v === existingData) {
                delete mergedGordoTSData[k];
                break;
            }
        }

        const dimension = existingData?.dimension ?? (areaNameForKey?.match(/^((zone|coreScene)Lab|zoneRainbowCore)/i) ? MapType.labyrinth : MapType.overworld);

        const slimetypeUppercasedFirst = slimetype.charAt(0).toUpperCase() + slimetype.slice(1);

        const dietGroups = dietGroupsAssetsJSON.map(groupAssetJSON => {
            if(groupAssetJSON.props["m_Name"])
                // console.log(groupAssetJSON.props["m_Name"]);
                return /^([a-z]+?)(?:FoodGroup|Group)?$/i.exec(groupAssetJSON.props["m_Name"])[1];
            else {
                console.log(groupAssetJSON);
                throw new Error(`Could not determine diet group name for gordo ${assetJSON.props["_id"]} from asset with guid ${groupRef.guid}`);
            }
        });
        const favoriteFoods = favoriteFoodsAssetJSON.map(foodAssetJSON => {
            if(foodAssetJSON.props["m_Name"])
                // console.log(groupAssetJSON.props["m_Name"]);
                return /^([a-z]+?)(?:Fruit|Veggie|Meat)?$/i.exec(foodAssetJSON.props["m_Name"])[1];
            else {
                console.log(foodAssetJSON);
                throw new Error(`Could not determine diet group name for gordo ${assetJSON.props["_id"]} from asset with guid ${groupRef.guid}`);
            }
        });

        const foodType = joinedStringWithOxfordComma(dietGroups) || "- Todo: specify valid food types for this gordo";
        let favoriteFoodStr = joinedStringWithOxfordComma(favoriteFoods) || "";

        favoriteFoodStr = favoriteFoodStr.replace(/(\b)Beet/g, "$1Heart Beet");
        favoriteFoodStr = favoriteFoodStr.replace(/(\b)Tater/g, "$1Turbo Tater");
        favoriteFoodStr = favoriteFoodStr.replace(/(\b)Onion/g, "$1Odd Onion");
        favoriteFoodStr = favoriteFoodStr.replace(/(\b)Mango/g, "$1Mint Mango");

        // split camel cased words apart with spaces
        favoriteFoodStr = favoriteFoodStr.replace(/([a-z])([A-Z])/g, "$1 $2");

        // for some reason Oca Oca's Identifiable Food Type m_Name is concatenated as one word in the asset
        // favoriteFoodStr = favoriteFoodStr.replace("Ocaoca", "Oca Oca");

        // favoriteFoodStr = favoriteFoodStr.replace(/(?<!Heart ?)Beet/, "Heart Beet");
        // favoriteFoodStr = favoriteFoodStr.replace(/(?<!Turbo ?)Tater/, "Turbo Tater");
        // favoriteFoodStr = favoriteFoodStr.replace(/(?<!Odd ?)Onion/, "Odd Onion");
        // favoriteFoodStr = favoriteFoodStr.replace(/(?<!Mint ?)Mango/, "Mint Mango");

        const favoriteFoodFactor = 2; // favorite foods count as double towards gordo feeding

        /** @type {ExistingGordoDataType} */
        const _mergedDataObj = { ...existingData,
            internalId: internalGordoId,
            // name: existingData?.name ?? ["TODO retrieve name from translation table"],
            name: (existingData && !/([a-z]+) gordo/i.test(existingData.name)) ? existingData.name : `${slimetypeUppercasedFirst} Gordo`,
            description: existingData?.description ?? "Todo: insert a description for this gordo " + internalGordoId,
            // In-game coordinate system is at 90 degrees to our map; swap x and y axes.
            // pos: { x: -pos.z, y: pos.x },
            pos: transformIngameToMapPosition(pos),
            // dimension: existingData?.dimension ?? "MapType.overworld",
            // dimension: existingData?.dimension ?? MapType.overworld,
            dimension: dimension,
            drops: existingData?.drops ?? ["Todo: specify gordo drops"],
            unlocks: existingData?.unlocks ?? ["Todo: specify gordo unlocks"],
            // food: existingData?.food ?? "Todo: specify gordo food",
            food: `x${targetCount} ${foodType}` + (!favoriteFoodStr ? "" : `; or x${Math.ceil(targetCount/favoriteFoodFactor)} ${favoriteFoodStr}`),
            // image: existingData?.image ?? "Todo: specify gordo image path",
            image: `iconGordo${slimetypeUppercasedFirst}.png`,
            // _otherLines: existingData?._otherLines,
        };
        // clear out all entries with undefined values
        Object.keys(_mergedDataObj).forEach(key => typeof _mergedDataObj[key] === "undefined" && delete _mergedDataObj[key]);
        // save merged data back
        mergedGordoTSData[tsDataKey] = _mergedDataObj;

        if(existingData)
            console.log(`Merged extracted gordo ${internalGordoId} data with existing ${tsDataKey} data`);
        else
            console.log(`Inserted extracted gordo ${internalGordoId} data to ${tsDataKey} data`)
    }

    console.log("Writing gordo data back to map data file");

    fnWriteGordosBackToFile(mergedGordoTSData);
}

async function exportPuzzleDoorsFromAssetsMapping(/** @type {AssetsMappingType | undefined} */ assetsMapping, /** @type {CacheOpts} */ cacheOpts) {

    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    /** @type {{ fileId: string, assetJSON: AssetJSONType, puzzleGameObj: AssetJSONType, type: "door" | "receptacle", pos: { x: number, y: number, z: number } }[]} */
    let ingamePuzzleDoorPositions;
    
    if(cacheOpts.useCache && existsSync("./data_cache/puzzleDoorAssetsAndPositions.json")) {
    // if(false) {  // for debugging
        
        console.log("Reading cached puzzle door coordinates...");

        ingamePuzzleDoorPositions = JSON.parse(readFileSync("./data_cache/puzzleDoorAssetsAndPositions.json"));

        console.log(`Read (${ingamePuzzleDoorPositions.length}) puzzle door coordinates from cache file.`);

    } else {

        assetsMapping ??= await getOrExtractScenesAssetsMapping(cacheOpts);

        console.log("Extracting puzzle door coordinates from assets JSON...");

        const puzzleDoorMonoBehavioursEntries = Object.entries(assetsMapping)
            .filter(([, assetJSON]) => {
            
                const _id = assetJSON.props["_id"];
            
                if(!_id) return false;

                if(!/^(puz|puzzlelock)[0-9]+$/.test(_id)) return false;

                if(assetJSON.typeName !== "MonoBehaviour") {
                    console.log(assetJSON);
                    throw new Error("found asset with a puzzlelock or puz id in \"_id\" prop, but it was not a MonoBehaviour?");
                }

                return true;

            });
        console.log(`Retrieved ${puzzleDoorMonoBehavioursEntries.length} puzzlelock locked door / puz plort receptacle MonoBehaviour entries.`);

        // /** @type {{ [fileGUID: string]: AssetJSONType }} */
        // const mapIdentAndDefGUIDtoAssetJSONs = { };

        // const metaFileGuidRegex = /^guid: *([0-9a-f]{32})$/im;
    
        // const identsAndDefsFilePaths = globSync(GLOBS_TO_IDENTIFIABLETYPE_AND_DEFINITION_FILES);

        // await Promise.all(identsAndDefsFilePaths.map(
        //     async (assetpath) => {
        //         // const filenameNoExt = basename(assetpath).split(".")[0];

        //         const metadata = await readFile(assetpath + ".meta", { encoding: "utf-8" });
        //         const guid = metaFileGuidRegex.exec(metadata)[1];
                
        //         /** @type {AssetsMappingType} */
        //         const identOrDefAssetsMapping = { }
        //         parseUnityFileYamlIntoAssetsMapping(assetpath, identOrDefAssetsMapping);
        //         if(Object.keys(identOrDefAssetsMapping).length !== 1) {
        //             throw new Error("Expected only one asset to be in the identifiable type asset or definition asset file");
        //         }
        //         const identOrDefAssetJSON = Object.values(identOrDefAssetsMapping)[0];

        //         mapIdentAndDefGUIDtoAssetJSONs[guid] = identOrDefAssetJSON;
        //     }
        // ));
        // throw new Error("temp");

        // ingameDronePositions = await Promise.all(droneEntryMonoBehavioursEntries.map(mapFnDetermineResearchDronePosition(assetsMapping)));
        ingamePuzzleDoorPositions = await Promise.all(puzzleDoorMonoBehavioursEntries.map(async (/** @type {[ fileId: string, assetJSON: AssetJSONType ]} */ [fileId, assetJSON]) => {
            
            // const slimeDefinitionAssetJSON = mapIdentAndDefGUIDtoAssetJSONs[assetJSON.props["SlimeDefinition"]["guid"]];

            // const targetCount = assetJSON.props["TargetCount"];
            // if(typeof targetCount !== "number" || targetCount <= 0) {
            //     throw new Error(`Expected gordo asset ${assetJSON.props["_id"]} to have a positive numeric TargetCount property, but got ${JSON.stringify(targetCount)}`);
            // }

            // const dietGroupsAssetsJSON = slimeDefinitionAssetJSON.props["Diet"]["MajorFoodIdentifiableTypeGroups"].map((/** @type {{ guid: string }} */ groupRef) => {
            //     const groupAssetJSON = mapIdentAndDefGUIDtoAssetJSONs[groupRef.guid];
            //     if(!groupAssetJSON) {
            //         throw new Error(`Could not find diet group identifiable type asset with guid ${groupRef.guid} for gordo ${assetJSON.props["_id"]}`);
            //     }
            //     return groupAssetJSON;
            // });

            // const favoriteFoodsAssetJSON = slimeDefinitionAssetJSON.props["Diet"]["FavoriteIdents"].map((/** @type {{ guid: string }} */ groupRef) => {
            //     const foodAssetJSON = mapIdentAndDefGUIDtoAssetJSONs[groupRef.guid];
            //     if(!foodAssetJSON) {
            //         throw new Error(`Could not find favorite food identifiable type asset with guid ${groupRef.guid} for gordo ${assetJSON.props["_id"]}`);
            //     }
            //     return foodAssetJSON;
            // });

            const type = /^puz[0-9]/.test(assetJSON.props["_id"]) ? "receptacle" : "door";

            console.log(`[Puzzle ${type} ${assetJSON.props["_id"]}]: Determining position of ${type}`);

            const { gameObj: puzzleGameObj, transformChainChildToParent, position: pos } = followMonoBehaviourGameObjectTransformChain(assetsMapping, assetJSON);

            // for(const child of transformChainChildToParent) {
            //     console.log(child.typeName);
            //     console.log(child.fileKey);
            //     console.log(child.fileId);
            //     console.log(child.props["m_LocalPosition"]);
            //     console.log(child.props["m_LocalRotation"]);
            //     console.log(child.props["m_LocalScale"]);
            // }

            console.log(`[Puzzle ${type} ${assetJSON.props["_id"]}]: Through a chain of ${transformChainChildToParent.length} transform(s), found position to be ${JSON.stringify(pos)}`);

            // return { fileId, assetJSON, gordoGameObj, targetCount, slimeDefinitionAssetJSON, dietGroupsAssetsJSON, favoriteFoodsAssetJSON, pos };
            return { fileId, assetJSON, puzzleGameObj, type: type, pos };

        }));

        console.log(`Determined ${ingamePuzzleDoorPositions.length} puzzle door assets and their positions.`);
        
        // // for debugging, cache the whole transform chain as well (and each transform's gameObject for good measure)
        // for(const d of ingameDronePositions) {
        //     const {podGameObj:depoGameObj,position,transformChainChildToParent} = followMonoBehaviourGameObjectTransformChain(assetsMapping, d.assetJSON);
        //     d.transformChainChildToParent = transformChainChildToParent.map(c => {
        //         const gameObj = assetsMapping[c.fileKey + "&" + c.props["m_GameObject"]["fileID"]];
        //         return { ...c, gameObject: gameObj };
        //     });
        // }

        if(cacheOpts.exportToCache) {
            const _export = () => {
                writeFileSync("./data_cache/puzzleDoorAssetsAndPositions.json", JSON.stringify(ingamePuzzleDoorPositions));
                console.log("Exported puzzle door assets and their positions to cache.");
            };
            if(cacheOpts.exportToCache === "sync") {
                console.log("Exporting puzzle door assets and their positions to cache...")
                _export();
            }
            else (async () => { _export(); })();
        }

    }

    
    /** @type {{ [fileGUID: string]: AssetJSONType }} */
    const mapIdentAndDefGUIDtoAssetJSONs = { };

    const metaFileGuidRegex = /^guid: *([0-9a-f]{32})$/im;

    const identsAndDefsFilePaths = globSync(GLOBS_TO_IDENTIFIABLETYPE_AND_DEFINITION_FILES);

    await Promise.all(identsAndDefsFilePaths.map(
        async (assetpath) => {
            // const filenameNoExt = basename(assetpath).split(".")[0];

            const metadata = await readFile(assetpath + ".meta", { encoding: "utf-8" });
            const guid = metaFileGuidRegex.exec(metadata)[1];
            
            /** @type {AssetsMappingType} */
            const identOrDefAssetsMapping = { }
            parseUnityFileYamlIntoAssetsMapping(assetpath, identOrDefAssetsMapping);
            if(Object.keys(identOrDefAssetsMapping).length !== 1) {
                throw new Error("Expected only one asset to be in the identifiable type asset or definition asset file");
            }
            const identOrDefAssetJSON = Object.values(identOrDefAssetsMapping)[0];

            mapIdentAndDefGUIDtoAssetJSONs[guid] = identOrDefAssetJSON;
        }
    ));


    console.log("Parsing existing puzzle door data in the map data files...")

    const { fnWritePuzzleDoorsBackToFile, existingPuzzleDoorTSDataByDoorKey } = readExistingPuzzleDoorTSData(cacheOpts);

    console.log(`Parsed ${Object.keys(existingPuzzleDoorTSDataByDoorKey).length} existing puzzle door data entries.`);

    const mergedPuzzleDoorTSData = { ...existingPuzzleDoorTSDataByDoorKey };

    console.log("Merging existing and extracted puzzle door data");
    
    // merge existing and extracted puzzle door data
    
    for(const { fileId, assetJSON, puzzleGameObj: puzzleGameObjJSON, pos, type } of ingamePuzzleDoorPositions) {
        /** @type {string} */
        const internalId = assetJSON.props["_id"];

        // /** @type {string} */
        // const slimetype = slimeDefinitionAssetJSON.props["Name"]?.toLowerCase() ?? "unknownslimetype";

        // for testing
        // const puzzleDoorIdInternalToOld = (x) => undefined;
        
        const oldId = puzzleDoorIdInternalToOld(internalId);

        let areaNameForKey;
        // TODO determine area name?
        if(!oldId) {
            // console.log("debug: fileKey: ", assetJSON.fileKey);
            // make a best guess based on what scene file the asset was in.
            console.log(assetJSON.fileKey);
            areaNameForKey = /((?:environment|zone|coreScene)[a-z0-9_]+).unity/i.exec(assetJSON.fileKey)?.[1]?.toLowerCase()?.replace("_","")
                ?? "undeterminedarea";
            // areaNameForKey = "undeterminedarea";
        }
        const tsDataKey = oldId ?? (`locked${type === "door" ? "door" : ""}_${areaNameForKey}_${internalId}`);

        // console.log(internalPodId, internalName, oldPodId, tsDataKey);

        /** @type {undefined | existingPuzzleDoorTSDataByDroneKey[keyof existingPuzzleDoorTSDataByDroneKey]} */
        const existingData = (
            existingPuzzleDoorTSDataByDoorKey[oldId]
            || existingPuzzleDoorTSDataByDoorKey[internalId]
            || existingPuzzleDoorTSDataByDoorKey[tsDataKey]
            || Object.values(existingPuzzleDoorTSDataByDoorKey).find(data => data.internalId === internalId)
        );

        // remove existingData object from the merged data mapping;
        // we will be overwriting it later with the "standardized" tsDataKey
        for(const [k, v] of Object.entries(mergedPuzzleDoorTSData)) {
            if(v === existingData) {
                delete mergedPuzzleDoorTSData[k];
                break;
            }
        }

        const dimension = existingData?.dimension ?? (areaNameForKey?.match(/^((zone|coreScene)Lab|zoneRainbowCore)/i) ? MapType.labyrinth : MapType.overworld);

        // const dietGroups = dietGroupsAssetsJSON.map(groupAssetJSON => {
        //     if(groupAssetJSON.props["m_Name"])
        //         // console.log(groupAssetJSON.props["m_Name"]);
        //         return /^([a-z]+?)(?:FoodGroup|Group)?$/i.exec(groupAssetJSON.props["m_Name"])[1];
        //     else {
        //         console.log(groupAssetJSON);
        //         throw new Error(`Could not determine diet group name for gordo ${assetJSON.props["_id"]} from asset with guid ${groupRef.guid}`);
        //     }
        // });
        // const favoriteFoods = favoriteFoodsAssetJSON.map(foodAssetJSON => {
        //     if(foodAssetJSON.props["m_Name"])
        //         // console.log(groupAssetJSON.props["m_Name"]);
        //         return /^([a-z]+?)(?:Fruit|Veggie|Meat)?$/i.exec(foodAssetJSON.props["m_Name"])[1];
        //     else {
        //         console.log(foodAssetJSON);
        //         throw new Error(`Could not determine diet group name for gordo ${assetJSON.props["_id"]} from asset with guid ${groupRef.guid}`);
        //     }
        // });

        // const foodType = joinedStringWithOxfordComma(dietGroups) || "- Todo: specify valid food types for this gordo";
        // let favoriteFoodStr = joinedStringWithOxfordComma(favoriteFoods) || "";

        // favoriteFoodStr = favoriteFoodStr.replace(/(\b)Beet/g, "$1Heart Beet");
        // favoriteFoodStr = favoriteFoodStr.replace(/(\b)Tater/g, "$1Turbo Tater");
        // favoriteFoodStr = favoriteFoodStr.replace(/(\b)Onion/g, "$1Odd Onion");
        // favoriteFoodStr = favoriteFoodStr.replace(/(\b)Mango/g, "$1Mint Mango");

        // // split camel cased words apart with spaces
        // favoriteFoodStr = favoriteFoodStr.replace(/([a-z])([A-Z])/g, "$1 $2");

        // // for some reason Oca Oca's Identifiable Food Type m_Name is concatenated as one word in the asset
        // // favoriteFoodStr = favoriteFoodStr.replace("Ocaoca", "Oca Oca");

        // // favoriteFoodStr = favoriteFoodStr.replace(/(?<!Heart ?)Beet/, "Heart Beet");
        // // favoriteFoodStr = favoriteFoodStr.replace(/(?<!Turbo ?)Tater/, "Turbo Tater");
        // // favoriteFoodStr = favoriteFoodStr.replace(/(?<!Odd ?)Onion/, "Odd Onion");
        // // favoriteFoodStr = favoriteFoodStr.replace(/(?<!Mint ?)Mango/, "Mint Mango");

        // const favoriteFoodFactor = 2; // favorite foods count as double towards gordo feeding

        /** @type {string} */
        let plortText;
        /** @type {string} */
        let image;
        /** @type {string} */
        let name = existingData?.name;
        /** @type {AssetJSONType[] | undefined} */
        let puzJSONs = undefined;
        /** @type {AssetJSONType[] | undefined} */
        let depoJSONs = undefined;
        /** @type {AssetJSONType | undefined} */
        let puzdoorJSON = undefined;
        /*
         *** Relevant excerpt example of YAML properties for a puzzlelock MonoBehaviour:
         * _id: puzzlelock0425896758
         * _slots:
         * - {fileID: 64293}
         * - {fileID: 64294}
         * - {fileID: 64292}
         *** or sometimes, instead of _slots:
         * _depositors:
         * - {fileID: 24105}
         *
         *** Relevant excerpt example of YAML properties for a puz MonoBehaviour:
         * _id: puz0314448441
         * _catchIdentifiableType: {fileID: 11400000, guid: a8e447996f1b64e428a9801d0ff60e12, type: 2}
         * _targetString:
         *   m_TableReference:
         *     m_TableCollectionName: GUID:4db04717861c47447b4b8b4613627aa4
         *   m_TableEntryReference:
         *     m_KeyId: 444668425773150208
         */
        const _extractPuzAndDepoJSONsForLockedDoorJSON = (/** @type {AssetJSONType} */ puzzlelockJSON) => {
            /** @type {{ fileID: number }[]} */
            const puzzleSlots = puzzlelockJSON.props["_slots"];
            /** @type {{ fileID: number }[] | undefined} */
            const puzzleShadowDepos = puzzlelockJSON.props["_depositors"];
            let puzJSONs = puzzleSlots.map(slot => {
                const fileKeyFileId = puzzlelockJSON.fileKey + "&" + slot.fileID;
                // const puz = assetsMapping[fileKeyFileId];
                const puz = ingamePuzzleDoorPositions.find(data => data.fileId === fileKeyFileId).assetJSON;
                // console.log('puz:', puz);
                // console.log('target fileKeyFileId:', fileKeyFileId);
                // ingamePuzzleDoorPositions.forEach(data => {
                //     console.log(' ', data.fileId);
                // })
                return puz;
            });
            let depoJSONs = puzzleShadowDepos?.map(slot => {
                const fileKeyFileId = assetJSON.fileKey + "&" + slot.fileID;
                const depo = getOrLoadShadowDepoPositionCache(cacheOpts).find(data => data.fileId === fileKeyFileId).assetJSON;
                return depo;
            });
            return { puzJSONs, depoJSONs };
        }
        if(type === "door") {
            let _extracted = _extractPuzAndDepoJSONsForLockedDoorJSON(assetJSON);
            puzJSONs = _extracted.puzJSONs;
            depoJSONs = _extracted.depoJSONs;
            const plortNames = puzJSONs.map(puz => {
                const plortGuid = puz.props["_catchIdentifiableType"]["guid"];
                const plortIdent = mapIdentAndDefGUIDtoAssetJSONs[plortGuid];
                const plortName = plortIdent.props["m_Name"];
                return capitalizeFirst(plortName.replace(/Plort$/i, ""));
            });
            // if(depoJSONs) {
            //     // Add "Shadow" for each depo to plortNames array.
            //     // We can assume the shadow plort depositories only catch shadow plorts :)
            //     plortNames.push(...Array(depoJSONs.length).fill("Shadow"));
            // }
            console.log(plortNames);
            const plortNamesCounted = Object.entries(plortNames.reduce((acc, name) => {
                acc[name] = (acc[name] || 0) + 1;
                return acc;
            }, {})).map(([name, count]) => `x${count} ${name} Plort${count === 1 ? "" : "s"}`);
            if(depoJSONs) {
                const count = depoJSONs.reduce((acc, data) => {
                    return acc + data.props["_fillAmount"];
                }, 0);
                if(count !== 0) {
                    plortNames.push("Shadow");
                    plortNamesCounted.push(`x${count} Shadow Plort${count === 1 ? "" : "s"}`);
                }
            }
            console.log(plortNamesCounted);
            
            plortText = joinedStringWithOxfordComma(plortNamesCounted, "and");
            image = "../iconMapPlortDoor.png";
            
            // let namepart = plortText.replaceAll(" Plort", "");
            // const hasMultipleOfSomePlort = /\bx(?:[2-9]|[1-9][0-9]+)\b/i.test(namepart);
            // if(!hasMultipleOfSomePlort) {
            //     namepart = namepart.replaceAll(/x1 /ig, "");
            // }
            let namePartPlorts = plortNames.filter((v, i, arr) => i === arr.indexOf(v)).join(", ");
            name ??= "Locked Door" + (namePartPlorts ? ` (${namePartPlorts})` : '');
        }
        else {   // else type is receptacle
            // find parent puzzlelock which has this receptacle as one of its requirements
            puzdoorJSON = ingamePuzzleDoorPositions.find(data => data.assetJSON.props["_slots"]?.find(slot => slot.fileID === assetJSON.fileId))?.assetJSON;
            
            let doorReceptacles = _extractPuzAndDepoJSONsForLockedDoorJSON(puzdoorJSON);
            let doorReceptaclesCt = (doorReceptacles.puzJSONs?.length || 0) + (doorReceptacles.depoJSONs?.length || 0);
            let indOfThisReceptacle = doorReceptaclesCt === 1 ? 0 : [...doorReceptacles.puzJSONs, ...doorReceptacles.depoJSONs].sort((a, b) => {
                // sort all of door's receptacles for deterministic index positioning, just in case.
                let aId = a.props["_id"];
                let bId = b.props["_id"];
                return aId === bId ? 0 : aId < bId ? -1 : 1;
            }).findIndex(a => a.props["_id"] === assetJSON.props["_id"]);

            const plortGuid = assetJSON.props["_catchIdentifiableType"]["guid"];
            const plortIdent = mapIdentAndDefGUIDtoAssetJSONs[plortGuid];
            const plortName = plortIdent.props["m_Name"];
            const strippedName = capitalizeFirst(plortName.replace(/Plort$/i, ""));
            
            plortText = "x1 " + strippedName + " Plort";
            image = `iconPlort${strippedName}.png`;
            name ??= `${strippedName} Plort Receptacle` + (doorReceptaclesCt === 1 ? "" : ` (${indOfThisReceptacle + 1}/${doorReceptaclesCt})`);
        }

        console.log(plortText);

        /** @type {ExistingPuzzleDoorDataType} */
        const _mergedDataObj = { ...existingData,
            internalId: internalId,
            // name: existingData?.name ?? ["TODO retrieve name from translation table"],
            // name: (existingData && !/([a-z]+) gordo/i.test(existingData.name)) ? existingData.name : `${slimetypeUppercasedFirst} Gordo`,
            name: name,
            plort: plortText,
            // In-game coordinate system is at 90 degrees to our map; swap x and y axes.
            // pos: { x: -pos.z, y: pos.x },
            pos: transformIngameToMapPosition(pos),
            image: image,
            type: type,
            doorId: type === "door" ? undefined : puzdoorJSON?.props["_id"],
            receptacleIds: type === "receptacle" ? undefined : [...puzJSONs, ...depoJSONs].map(asset => asset.props["_id"]),
            description: existingData?.description ?? "Todo: insert a description for this puzzle " + type + " " + internalId,
            // dimension: existingData?.dimension ?? "MapType.overworld",
            // dimension: existingData?.dimension ?? MapType.overworld,
            unlocks: existingData?.unlocks ?? "Todo: specify puzzle door unlocks",
            dimension: dimension,
            // drops: existingData?.drops ?? ["Todo: specify gordo drops"],
            // food: `x${targetCount} ${foodType}` + (!favoriteFoodStr ? "" : `; or x${Math.ceil(targetCount/favoriteFoodFactor)} ${favoriteFoodStr}`),
        };
        // clear out all entries with undefined values
        Object.keys(_mergedDataObj).forEach(key => typeof _mergedDataObj[key] === "undefined" && delete _mergedDataObj[key]);
        // save merged data back
        mergedPuzzleDoorTSData[tsDataKey] = _mergedDataObj;

        if(existingData)
            console.log(`Merged extracted puzzle door ${internalId} data with existing ${tsDataKey} data`);
        else
            console.log(`Inserted extracted puzzle door ${internalId} data to ${tsDataKey} data`)
    }

    console.log("Writing puzzle door data back to map data file");

    fnWritePuzzleDoorsBackToFile(mergedPuzzleDoorTSData);
}

async function exportStabilizingGatesFromAssetsMapping(/** @type {AssetsMappingType | undefined} */ assetsMapping, /** @type {CacheOpts} */ cacheOpts) {

    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    /** @type {{ fileId: string, assetJSON: AssetJSONType, gateGameObj: AssetJSONType, pos: { x: number, y: number, z: number } }[]} */
    let ingameGatePositions;
    
    if(cacheOpts.useCache && existsSync("./data_cache/stabilizingGateAssetsAndPositions.json")) {
    // if(false) {  // for debugging
        
        console.log("Reading cached stabilizing gate coordinates...");

        ingameGatePositions = JSON.parse(readFileSync("./data_cache/stabilizingGateAssetsAndPositions.json"));

        console.log(`Read (${ingameGatePositions.length}) stabilizing gate coordinates from cache file.`);

    } else {

        assetsMapping ??= await getOrExtractScenesAssetsMapping(cacheOpts);

        console.log("Extracting stabilizing gate coordinates from assets JSON...");

        const gateMonoBehavioursEntries = Object.entries(assetsMapping)
            .filter(([, assetJSON]) => {
            
                const _id = assetJSON.props["_id"];
            
                if(!_id) return false;

                if(!/^stabilizinggate[0-9]+$/.test(_id)) return false;

                if(assetJSON.typeName !== "MonoBehaviour") {
                    console.log(assetJSON);
                    throw new Error("found asset with a stabilizinggate id in \"_id\" prop, but it was not a MonoBehaviour?");
                }

                return true;

            });
        console.log(`Retrieved ${gateMonoBehavioursEntries.length} stabilizinggate MonoBehaviour entries.`);

        // /** @type {{ [fileGUID: string]: AssetJSONType }} */
        // const mapIdentAndDefGUIDtoAssetJSONs = { };

        // const metaFileGuidRegex = /^guid: *([0-9a-f]{32})$/im;
    
        // const identsAndDefsFilePaths = globSync(GLOBS_TO_IDENTIFIABLETYPE_AND_DEFINITION_FILES);

        // await Promise.all(identsAndDefsFilePaths.map(
        //     async (assetpath) => {
        //         // const filenameNoExt = basename(assetpath).split(".")[0];

        //         const metadata = await readFile(assetpath + ".meta", { encoding: "utf-8" });
        //         const guid = metaFileGuidRegex.exec(metadata)[1];
                
        //         /** @type {AssetsMappingType} */
        //         const identOrDefAssetsMapping = { }
        //         parseUnityFileYamlIntoAssetsMapping(assetpath, identOrDefAssetsMapping);
        //         if(Object.keys(identOrDefAssetsMapping).length !== 1) {
        //             throw new Error("Expected only one asset to be in the identifiable type asset or definition asset file");
        //         }
        //         const identOrDefAssetJSON = Object.values(identOrDefAssetsMapping)[0];

        //         mapIdentAndDefGUIDtoAssetJSONs[guid] = identOrDefAssetJSON;
        //     }
        // ));
        // throw new Error("temp");

        // ingameDronePositions = await Promise.all(droneEntryMonoBehavioursEntries.map(mapFnDetermineResearchDronePosition(assetsMapping)));
        ingameGatePositions = await Promise.all(gateMonoBehavioursEntries.map(async (/** @type {[ fileId: string, assetJSON: AssetJSONType ]} */ [fileId, assetJSON]) => {

            console.log(`[Stabilizing Gate ${assetJSON.props["_id"]}]: Determining position of stabilizing gate`);

            const { gameObj: gateGameObj, transformChainChildToParent, position: pos } = followMonoBehaviourGameObjectTransformChain(assetsMapping, assetJSON);

            // for(const child of transformChainChildToParent) {
            //     console.log(child.typeName);
            //     console.log(child.fileKey);
            //     console.log(child.fileId);
            //     console.log(child.props["m_LocalPosition"]);
            //     console.log(child.props["m_LocalRotation"]);
            //     console.log(child.props["m_LocalScale"]);
            // }

            console.log(`[Stabilizing Gate ${assetJSON.props["_id"]}]: Through a chain of ${transformChainChildToParent.length} transform(s), found position to be ${JSON.stringify(pos)}`);

            // return { fileId, assetJSON, gordoGameObj, targetCount, slimeDefinitionAssetJSON, dietGroupsAssetsJSON, favoriteFoodsAssetJSON, pos };
            return { fileId, assetJSON, gateGameObj, pos };

        }));

        console.log(`Determined ${ingameGatePositions.length} stabilizing gate assets and their positions.`);
        
        // // for debugging, cache the whole transform chain as well (and each transform's gameObject for good measure)
        // for(const d of ingameDronePositions) {
        //     const {podGameObj:depoGameObj,position,transformChainChildToParent} = followMonoBehaviourGameObjectTransformChain(assetsMapping, d.assetJSON);
        //     d.transformChainChildToParent = transformChainChildToParent.map(c => {
        //         const gameObj = assetsMapping[c.fileKey + "&" + c.props["m_GameObject"]["fileID"]];
        //         return { ...c, gameObject: gameObj };
        //     });
        // }

        if(cacheOpts.exportToCache) {
            const _export = () => {
                writeFileSync("./data_cache/stabilizingGateAssetsAndPositions.json", JSON.stringify(ingameGatePositions));
                console.log("Exported stabilizing gate assets and their positions to cache.");
            };
            if(cacheOpts.exportToCache === "sync") {
                console.log("Exporting stabilizing gate assets and their positions to cache...")
                _export();
            }
            else (async () => { _export(); })();
        }

    }

    
    // /** @type {{ [fileGUID: string]: AssetJSONType }} */
    // const mapIdentAndDefGUIDtoAssetJSONs = { };

    // const metaFileGuidRegex = /^guid: *([0-9a-f]{32})$/im;

    // const identsAndDefsFilePaths = globSync(GLOBS_TO_IDENTIFIABLETYPE_AND_DEFINITION_FILES);

    // await Promise.all(identsAndDefsFilePaths.map(
    //     async (assetpath) => {
    //         // const filenameNoExt = basename(assetpath).split(".")[0];

    //         const metadata = await readFile(assetpath + ".meta", { encoding: "utf-8" });
    //         const guid = metaFileGuidRegex.exec(metadata)[1];
            
    //         /** @type {AssetsMappingType} */
    //         const identOrDefAssetsMapping = { }
    //         parseUnityFileYamlIntoAssetsMapping(assetpath, identOrDefAssetsMapping);
    //         if(Object.keys(identOrDefAssetsMapping).length !== 1) {
    //             throw new Error("Expected only one asset to be in the identifiable type asset or definition asset file");
    //         }
    //         const identOrDefAssetJSON = Object.values(identOrDefAssetsMapping)[0];

    //         mapIdentAndDefGUIDtoAssetJSONs[guid] = identOrDefAssetJSON;
    //     }
    // ));


    console.log("Parsing existing stabilizing gate data in the map data files...")

    const { fnWriteStabilizingGatesBackToFile, existingStabilizingGateTSDataByGateKey } = readExistingStabilizingGatesTSData(cacheOpts);

    console.log(`Parsed ${Object.keys(existingStabilizingGateTSDataByGateKey).length} existing stabilizing gate data entries.`);

    const mergedGateTSData = { ...existingStabilizingGateTSDataByGateKey };

    console.log("Merging existing and extracted stabilizing gate data");
    
    // merge existing and extracted stabilizing gate data
    
    for(const { fileId, assetJSON, gateGameObj: gateGameObjJSON, pos } of ingameGatePositions) {
        /** @type {string} */
        const internalId = assetJSON.props["_id"];

        // /** @type {string} */
        // const slimetype = slimeDefinitionAssetJSON.props["Name"]?.toLowerCase() ?? "unknownslimetype";

        // for testing
        // const stabilizingGateIdInternalToOld = (x) => undefined;
        
        const oldId = stabilizingGateIdInternalToOld(internalId);

        let areaNameForKey;
        // TODO determine area name?
        // if(!oldId) {
        //     // console.log("debug: fileKey: ", assetJSON.fileKey);
        //     // make a best guess based on what scene file the asset was in.
        //     console.log(assetJSON.fileKey);
        //     areaNameForKey = /((?:zone|coreScene)[a-z0-9_]+).unity/i.exec(assetJSON.fileKey)?.[1]?.toLowerCase()?.replace("_","")
        //         ?? "undeterminedarea";
        //     // areaNameForKey = "undeterminedarea";
        // }
        const tsDataKey = oldId ?? (`stabilizinggate_${internalId}`);

        // console.log(internalPodId, internalName, oldPodId, tsDataKey);

        /** @type {undefined | existingStabilizingGateTSDataByGateKey[keyof existingStabilizingGateTSDataByGateKey]} */
        const existingData = (
            existingStabilizingGateTSDataByGateKey[oldId]
            || existingStabilizingGateTSDataByGateKey[internalId]
            || existingStabilizingGateTSDataByGateKey[tsDataKey]
            || Object.values(existingStabilizingGateTSDataByGateKey).find(data => data.internalId === internalId)
        );

        // remove existingData object from the merged data mapping;
        // we will be overwriting it later with the "standardized" tsDataKey
        for(const [k, v] of Object.entries(mergedGateTSData)) {
            if(v === existingData) {
                delete mergedGateTSData[k];
                break;
            }
        }

        // const dimension = existingData?.dimension ?? (areaNameForKey?.match(/^(zone|coreScene)Lab/i) ? MapType.labyrinth : MapType.overworld);

        /** @type {ExistingStabilizingGateDataType} */
        const _mergedDataObj = { ...existingData,
            internalId: internalId,
            // name: existingData?.name ?? ["TODO retrieve name from translation table"],
            // name: (existingData && !/([a-z]+) gordo/i.test(existingData.name)) ? existingData.name : `${slimetypeUppercasedFirst} Gordo`,
            // name: name,
            // In-game coordinate system is at 90 degrees to our map; swap x and y axes.
            // position: { x: -pos.z, y: pos.x },
            position: transformIngameToMapPosition(pos),
            // image: image,
            description: existingData?.description ?? "Todo: insert a description for this stabilizing gate " + internalId,
            // dimension: existingData?.dimension ?? "MapType.overworld",
            // dimension: existingData?.dimension ?? MapType.labyrinth,
            // unlocks: existingData?.unlocks ?? ["Todo: specify puzzle door unlocks"],
        };
        // clear out all entries with undefined values
        Object.keys(_mergedDataObj).forEach(key => typeof _mergedDataObj[key] === "undefined" && delete _mergedDataObj[key]);
        // save merged data back
        mergedGateTSData[tsDataKey] = _mergedDataObj;

        if(existingData)
            console.log(`Merged extracted stabilizing gate ${internalId} data with existing ${tsDataKey} data`);
        else
            console.log(`Inserted extracted stabilizing gate ${internalId} data to ${tsDataKey} data`)
    }

    console.log("Writing stabilizing gate data back to map data file");

    fnWriteStabilizingGatesBackToFile(mergedGateTSData);
}

async function exportNullifierDoorsFromAssetsMapping(/** @type {AssetsMappingType | undefined} */ assetsMapping, /** @type {CacheOpts} */ cacheOpts) {

    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    /** @type {{ fileId: string, assetJSON: AssetJSONType, doorGameObj: AssetJSONType, pos: { x: number, y: number, z: number } }[]} */
    let ingameNullifierDoorPositions;
    
    if(cacheOpts.useCache && existsSync("./data_cache/nullifierDoorAssetsAndPositions.json")) {
    // if(false) {  // for debugging
        
        console.log("Reading cached nullifier door coordinates...");

        ingameNullifierDoorPositions = JSON.parse(readFileSync("./data_cache/nullifierDoorAssetsAndPositions.json"));

        console.log(`Read (${ingameNullifierDoorPositions.length}) nullifier door coordinates from cache file.`);

    } else {

        assetsMapping ??= await getOrExtractScenesAssetsMapping(cacheOpts);

        console.log("Extracting nullifier door coordinates from assets JSON...");

        const doorMonoBehavioursEntries = Object.entries(assetsMapping)
            .filter(([, assetJSON]) => {
            
                // const _id = assetJSON.props["_id"];
            
                // if(!_id) return false;

                // if(!/^nullifierdoor[0-9]+$/.test(_id)) return false;

                // if it's for a Discordant Wall, I expect it to have both of these properties. Otherwise, I expect it to have neither.
                const prop_holeTransform = assetJSON.props["_holeTransform"];
                const prop_wallTransform = assetJSON.props["_wallTransform"];

                if(!prop_holeTransform && !prop_wallTransform) {
                    // has neither
                    return false;
                }

                if(!prop_holeTransform || !prop_wallTransform) {
                    console.log(assetJSON);
                    throw new Error(`Asset had only one of \"_holeTransform\" and \"_wallTransform\" props! (!!prop_holeTransform = ${!!prop_holeTransform}, !!prop_wallTransform = ${!!prop_wallTransform})`)
                }

                if(assetJSON.typeName !== "MonoBehaviour") {
                    console.log(assetJSON);
                    throw new Error("found asset with a \"_holeTransform\" and \"_wallTransform\" props, but it was not a MonoBehaviour?");
                }

                return true;

            });
        console.log(`Retrieved ${doorMonoBehavioursEntries.length} nullifierdoor MonoBehaviour entries.`);

        // /** @type {{ [fileGUID: string]: AssetJSONType }} */
        // const mapIdentAndDefGUIDtoAssetJSONs = { };

        // const metaFileGuidRegex = /^guid: *([0-9a-f]{32})$/im;
    
        // const identsAndDefsFilePaths = globSync(GLOBS_TO_IDENTIFIABLETYPE_AND_DEFINITION_FILES);

        // await Promise.all(identsAndDefsFilePaths.map(
        //     async (assetpath) => {
        //         // const filenameNoExt = basename(assetpath).split(".")[0];

        //         const metadata = await readFile(assetpath + ".meta", { encoding: "utf-8" });
        //         const guid = metaFileGuidRegex.exec(metadata)[1];
                
        //         /** @type {AssetsMappingType} */
        //         const identOrDefAssetsMapping = { }
        //         parseUnityFileYamlIntoAssetsMapping(assetpath, identOrDefAssetsMapping);
        //         if(Object.keys(identOrDefAssetsMapping).length !== 1) {
        //             throw new Error("Expected only one asset to be in the identifiable type asset or definition asset file");
        //         }
        //         const identOrDefAssetJSON = Object.values(identOrDefAssetsMapping)[0];

        //         mapIdentAndDefGUIDtoAssetJSONs[guid] = identOrDefAssetJSON;
        //     }
        // ));
        // throw new Error("temp");

        // ingameDronePositions = await Promise.all(droneEntryMonoBehavioursEntries.map(mapFnDetermineResearchDronePosition(assetsMapping)));
        ingameNullifierDoorPositions = await Promise.all(doorMonoBehavioursEntries.map(async (/** @type {[ fileId: string, assetJSON: AssetJSONType ]} */ [fileId, assetJSON]) => {

            console.log(`[Nullifier Door (assetJSON fileKeyFileId: ${assetJSON.fileKey + '&' + assetJSON.fileId})]: Determining position of nullifier door`);

            const { gameObj: doorGameObj, transformChainChildToParent, position: pos } = followMonoBehaviourGameObjectTransformChain(assetsMapping, assetJSON);

            // for(const child of transformChainChildToParent) {
            //     console.log(child.typeName);
            //     console.log(child.fileKey);
            //     console.log(child.fileId);
            //     console.log(child.props["m_LocalPosition"]);
            //     console.log(child.props["m_LocalRotation"]);
            //     console.log(child.props["m_LocalScale"]);
            // }

            console.log(`[Nullifier Door ${manufactureNullifierDoorIdFromAssets(assetJSON, doorGameObj, pos)}]: Through a chain of ${transformChainChildToParent.length} transform(s), found position to be ${JSON.stringify(pos)}`);

            // return { fileId, assetJSON, gordoGameObj, targetCount, slimeDefinitionAssetJSON, dietGroupsAssetsJSON, favoriteFoodsAssetJSON, pos };
            return { fileId, assetJSON, doorGameObj, pos };

        }));

        console.log(`Determined ${ingameNullifierDoorPositions.length} nullifier door assets and their positions.`);
        
        // // for debugging, cache the whole transform chain as well (and each transform's gameObject for good measure)
        // for(const d of ingameDronePositions) {
        //     const {podGameObj:depoGameObj,position,transformChainChildToParent} = followMonoBehaviourGameObjectTransformChain(assetsMapping, d.assetJSON);
        //     d.transformChainChildToParent = transformChainChildToParent.map(c => {
        //         const gameObj = assetsMapping[c.fileKey + "&" + c.props["m_GameObject"]["fileID"]];
        //         return { ...c, gameObject: gameObj };
        //     });
        // }

        if(cacheOpts.exportToCache) {
            const _export = () => {
                writeFileSync("./data_cache/nullifierDoorAssetsAndPositions.json", JSON.stringify(ingameNullifierDoorPositions));
                console.log("Exported nullifier door assets and their positions to cache.");
            };
            if(cacheOpts.exportToCache === "sync") {
                console.log("Exporting nullifier door assets and their positions to cache...")
                _export();
            }
            else (async () => { _export(); })();
        }

    }

    
    // /** @type {{ [fileGUID: string]: AssetJSONType }} */
    // const mapIdentAndDefGUIDtoAssetJSONs = { };

    // const metaFileGuidRegex = /^guid: *([0-9a-f]{32})$/im;

    // const identsAndDefsFilePaths = globSync(GLOBS_TO_IDENTIFIABLETYPE_AND_DEFINITION_FILES);

    // await Promise.all(identsAndDefsFilePaths.map(
    //     async (assetpath) => {
    //         // const filenameNoExt = basename(assetpath).split(".")[0];

    //         const metadata = await readFile(assetpath + ".meta", { encoding: "utf-8" });
    //         const guid = metaFileGuidRegex.exec(metadata)[1];
            
    //         /** @type {AssetsMappingType} */
    //         const identOrDefAssetsMapping = { }
    //         parseUnityFileYamlIntoAssetsMapping(assetpath, identOrDefAssetsMapping);
    //         if(Object.keys(identOrDefAssetsMapping).length !== 1) {
    //             throw new Error("Expected only one asset to be in the identifiable type asset or definition asset file");
    //         }
    //         const identOrDefAssetJSON = Object.values(identOrDefAssetsMapping)[0];

    //         mapIdentAndDefGUIDtoAssetJSONs[guid] = identOrDefAssetJSON;
    //     }
    // ));


    console.log("Parsing existing nullifier door data in the map data files...")

    const { fnWriteNullifierDoorsBackToFile, existingNullifierDoorTSDataByGateKey } = readExistingNullifierDoorsTSData(cacheOpts);

    console.log(`Parsed ${Object.keys(existingNullifierDoorTSDataByGateKey).length} existing nullifier door data entries.`);

    const mergedDoorTSData = { ...existingNullifierDoorTSDataByGateKey };

    console.log("Merging existing and extracted nullifier door data");
    
    // merge existing and extracted nullifier door data
    
    for(const { fileId, assetJSON, doorGameObj: doorGameObjJSON, pos } of ingameNullifierDoorPositions) {
        /** @type {string} */
        const manufacturedId = manufactureNullifierDoorIdFromAssets(assetJSON, doorGameObjJSON, pos);

        // /** @type {string} */
        // const slimetype = slimeDefinitionAssetJSON.props["Name"]?.toLowerCase() ?? "unknownslimetype";

        // for testing
        const nullifierDoorIdInternalToOld = (x) => undefined;
        
        const oldId = nullifierDoorIdInternalToOld(manufacturedId);

        let areaNameForKey;
        // TODO determine area name?
        // if(!oldId) {
        //     // console.log("debug: fileKey: ", assetJSON.fileKey);
        //     // make a best guess based on what scene file the asset was in.
        //     console.log(assetJSON.fileKey);
        //     areaNameForKey = /((?:zone|coreScene)[a-z0-9_]+).unity/i.exec(assetJSON.fileKey)?.[1]?.toLowerCase()?.replace("_","")
        //         ?? "undeterminedarea";
        //     // areaNameForKey = "undeterminedarea";
        // }
        const tsDataKey = oldId ?? (`nullifierdoor_${manufacturedId}`);

        // console.log(internalPodId, internalName, oldPodId, tsDataKey);

        /** @type {undefined | existingNullifierDoorTSDataByGateKey[keyof existingNullifierDoorTSDataByGateKey]} */
        const existingData = (
            existingNullifierDoorTSDataByGateKey[oldId]
            || existingNullifierDoorTSDataByGateKey[manufacturedId]
            || existingNullifierDoorTSDataByGateKey[tsDataKey]
            || Object.values(existingNullifierDoorTSDataByGateKey).find(data => data.internalId === manufacturedId)
        );

        // remove existingData object from the merged data mapping;
        // we will be overwriting it later with the "standardized" tsDataKey
        for(const [k, v] of Object.entries(mergedDoorTSData)) {
            if(v === existingData) {
                delete mergedDoorTSData[k];
                break;
            }
        }

        // const dimension = existingData?.dimension ?? (areaNameForKey?.match(/^(zone|coreScene)Lab/i) ? MapType.labyrinth : MapType.overworld);

        /** @type {ExistingNullifierDoorDataType} */
        const _mergedDataObj = { ...existingData,
            // internalId: internalId,
            // name: existingData?.name ?? ["TODO retrieve name from translation table"],
            // name: (existingData && !/([a-z]+) gordo/i.test(existingData.name)) ? existingData.name : `${slimetypeUppercasedFirst} Gordo`,
            // name: name,
            // In-game coordinate system is at 90 degrees to our map; swap x and y axes.
            // position: { x: -pos.z, y: pos.x },
            position: transformIngameToMapPosition(pos),
            // image: image,
            description: existingData?.description ?? "Todo: insert a description for this nullifier door " + manufacturedId,
            // dimension: existingData?.dimension ?? "MapType.overworld",
            // dimension: existingData?.dimension ?? MapType.labyrinth,
            // unlocks: existingData?.unlocks ?? ["Todo: specify puzzle door unlocks"],
        };
        // clear out all entries with undefined values
        Object.keys(_mergedDataObj).forEach(key => typeof _mergedDataObj[key] === "undefined" && delete _mergedDataObj[key]);
        // save merged data back
        mergedDoorTSData[tsDataKey] = _mergedDataObj;

        if(existingData)
            console.log(`Merged extracted nullifier door ${manufacturedId} data with existing ${tsDataKey} data`);
        else
            console.log(`Inserted extracted nullifier door ${manufacturedId} data to ${tsDataKey} data`)
    }

    console.log("Writing nullifier door data back to map data file");

    fnWriteNullifierDoorsBackToFile(mergedDoorTSData);
}

async function exportGigiHologramsFromAssetsMapping(/** @type {AssetsMappingType | undefined} */ assetsMapping, /** @type {CacheOpts} */ cacheOpts) {

    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    /** @type {{ fileId: string, assetJSON: AssetJSONType, gigiGameObj: AssetJSONType, pos: { x: number, y: number, z: number } }[]} */
    let ingameGigiHologramPositions;
    
    if(cacheOpts.useCache && existsSync("./data_cache/gigiHologramAssetsAndPositions.json")) {
    // if(false) {  // for debugging
        
        console.log("Reading cached Gigi hologram coordinates...");

        ingameGigiHologramPositions = JSON.parse(readFileSync("./data_cache/gigiHologramAssetsAndPositions.json"));

        console.log(`Read (${ingameGigiHologramPositions.length}) Gigi hologram coordinates from cache file.`);

    } else {

        assetsMapping ??= await getOrExtractScenesAssetsMapping(cacheOpts);

        console.log("Extracting Gigi hologram coordinates from assets JSON...");

        const doorMonoBehavioursEntries = Object.entries(assetsMapping)
            .filter(([, assetJSON]) => {
            
                // const _id = assetJSON.props["_id"];
            
                // if(!_id) return false;

                // if(!/^nullifierdoor[0-9]+$/.test(_id)) return false;

                // if it's for a Gigi hologram, I expect it to have both of these properties. Otherwise, I expect it to have neither.
                const prop_gigi = assetJSON.props["_gigi"];
                const prop_gigiAnimator = assetJSON.props["_gigiAnimator"];

                if(!prop_gigi && !prop_gigiAnimator) {
                    // has neither
                    return false;
                }

                if(!prop_gigi || !prop_gigiAnimator) {
                    console.log(assetJSON);
                    throw new Error(`Asset had only one of \"_gigi\" and \"_gigiAnimator\" props! (!!prop_gigi = ${!!prop_gigi}, !!prop_gigiAnimator = ${!!prop_gigiAnimator})`)
                }

                if(assetJSON.typeName !== "MonoBehaviour") {
                    console.log(assetJSON);
                    throw new Error("found asset with a \"_gigi\" and \"_gigiAnimator\" props, but it was not a MonoBehaviour?");
                }

                return true;

            });
        console.log(`Retrieved ${doorMonoBehavioursEntries.length} gigihologram MonoBehaviour entries.`);

        // /** @type {{ [fileGUID: string]: AssetJSONType }} */
        // const mapIdentAndDefGUIDtoAssetJSONs = { };

        // const metaFileGuidRegex = /^guid: *([0-9a-f]{32})$/im;
    
        // const identsAndDefsFilePaths = globSync(GLOBS_TO_IDENTIFIABLETYPE_AND_DEFINITION_FILES);

        // await Promise.all(identsAndDefsFilePaths.map(
        //     async (assetpath) => {
        //         // const filenameNoExt = basename(assetpath).split(".")[0];

        //         const metadata = await readFile(assetpath + ".meta", { encoding: "utf-8" });
        //         const guid = metaFileGuidRegex.exec(metadata)[1];
                
        //         /** @type {AssetsMappingType} */
        //         const identOrDefAssetsMapping = { }
        //         parseUnityFileYamlIntoAssetsMapping(assetpath, identOrDefAssetsMapping);
        //         if(Object.keys(identOrDefAssetsMapping).length !== 1) {
        //             throw new Error("Expected only one asset to be in the identifiable type asset or definition asset file");
        //         }
        //         const identOrDefAssetJSON = Object.values(identOrDefAssetsMapping)[0];

        //         mapIdentAndDefGUIDtoAssetJSONs[guid] = identOrDefAssetJSON;
        //     }
        // ));
        // throw new Error("temp");

        // ingameDronePositions = await Promise.all(droneEntryMonoBehavioursEntries.map(mapFnDetermineResearchDronePosition(assetsMapping)));
        ingameGigiHologramPositions = await Promise.all(doorMonoBehavioursEntries.map(async (/** @type {[ fileId: string, assetJSON: AssetJSONType ]} */ [fileId, assetJSON]) => {

            console.log(`[Gigi Hologram (assetJSON fileKeyFileId: ${assetJSON.fileKey + '&' + assetJSON.fileId})]: Determining position of Gigi hologram`);

            const { gameObj: gigiGameObj, transformChainChildToParent, position: pos } = followMonoBehaviourGameObjectTransformChain(assetsMapping, assetJSON);

            // for(const child of transformChainChildToParent) {
            //     console.log(child.typeName);
            //     console.log(child.fileKey);
            //     console.log(child.fileId);
            //     console.log(child.props["m_LocalPosition"]);
            //     console.log(child.props["m_LocalRotation"]);
            //     console.log(child.props["m_LocalScale"]);
            // }

            console.log(`[Gigi Hologram ${manufactureGigiHologramIdFromAssets(assetJSON, gigiGameObj, pos)}]: Through a chain of ${transformChainChildToParent.length} transform(s), found position to be ${JSON.stringify(pos)}`);

            // return { fileId, assetJSON, gordoGameObj, targetCount, slimeDefinitionAssetJSON, dietGroupsAssetsJSON, favoriteFoodsAssetJSON, pos };
            return { fileId, assetJSON, gigiGameObj, pos };

        }));

        console.log(`Determined ${ingameGigiHologramPositions.length} Gigi hologram assets and their positions.`);
        
        // // for debugging, cache the whole transform chain as well (and each transform's gameObject for good measure)
        // for(const d of ingameDronePositions) {
        //     const {podGameObj:depoGameObj,position,transformChainChildToParent} = followMonoBehaviourGameObjectTransformChain(assetsMapping, d.assetJSON);
        //     d.transformChainChildToParent = transformChainChildToParent.map(c => {
        //         const gameObj = assetsMapping[c.fileKey + "&" + c.props["m_GameObject"]["fileID"]];
        //         return { ...c, gameObject: gameObj };
        //     });
        // }

        if(cacheOpts.exportToCache) {
            const _export = () => {
                writeFileSync("./data_cache/gigiHologramAssetsAndPositions.json", JSON.stringify(ingameGigiHologramPositions));
                console.log("Exported Gigi hologram assets and their positions to cache.");
            };
            if(cacheOpts.exportToCache === "sync") {
                console.log("Exporting Gigi hologram assets and their positions to cache...")
                _export();
            }
            else (async () => { _export(); })();
        }

    }

    
    // /** @type {{ [fileGUID: string]: AssetJSONType }} */
    // const mapIdentAndDefGUIDtoAssetJSONs = { };

    // const metaFileGuidRegex = /^guid: *([0-9a-f]{32})$/im;

    // const identsAndDefsFilePaths = globSync(GLOBS_TO_IDENTIFIABLETYPE_AND_DEFINITION_FILES);

    // await Promise.all(identsAndDefsFilePaths.map(
    //     async (assetpath) => {
    //         // const filenameNoExt = basename(assetpath).split(".")[0];

    //         const metadata = await readFile(assetpath + ".meta", { encoding: "utf-8" });
    //         const guid = metaFileGuidRegex.exec(metadata)[1];
            
    //         /** @type {AssetsMappingType} */
    //         const identOrDefAssetsMapping = { }
    //         parseUnityFileYamlIntoAssetsMapping(assetpath, identOrDefAssetsMapping);
    //         if(Object.keys(identOrDefAssetsMapping).length !== 1) {
    //             throw new Error("Expected only one asset to be in the identifiable type asset or definition asset file");
    //         }
    //         const identOrDefAssetJSON = Object.values(identOrDefAssetsMapping)[0];

    //         mapIdentAndDefGUIDtoAssetJSONs[guid] = identOrDefAssetJSON;
    //     }
    // ));


    console.log("Parsing existing Gigi hologram data in the map data files...")

    const { fnWriteGigiHologramsBackToFile, existingGigiHologramTSDataByGigiHologramKey } = readExistingGigiHologramsTSData(cacheOpts);

    console.log(`Parsed ${Object.keys(existingGigiHologramTSDataByGigiHologramKey).length} existing Gigi hologram data entries.`);

    const mergedGigiTSData = { ...existingGigiHologramTSDataByGigiHologramKey };
    
    const processedDialogues = processManualGigiConversations(cacheOpts);

    console.log("Merging existing and extracted Gigi hologram data");
    
    // merge existing and extracted gigi hologram data
    
    for(const { fileId, assetJSON, gigiGameObj: gigiGameObjJSON, pos } of ingameGigiHologramPositions) {
        /** @type {string} */
        const manufacturedId = manufactureGigiHologramIdFromAssets(assetJSON, gigiGameObjJSON, pos);

        // /** @type {string} */
        // const slimetype = slimeDefinitionAssetJSON.props["Name"]?.toLowerCase() ?? "unknownslimetype";

        // for testing
        const gigiHologramIdInternalToOld = (x) => undefined;
        
        const oldId = gigiHologramIdInternalToOld(manufacturedId);

        let areaNameForKey;
        // TODO determine area name?
        // if(!oldId) {
        //     // console.log("debug: fileKey: ", assetJSON.fileKey);
        //     // make a best guess based on what scene file the asset was in.
        //     console.log(assetJSON.fileKey);
        //     areaNameForKey = /((?:zone|coreScene)[a-z0-9_]+).unity/i.exec(assetJSON.fileKey)?.[1]?.toLowerCase()?.replace("_","")
        //         ?? "undeterminedarea";
        //     // areaNameForKey = "undeterminedarea";
        // }
        const tsDataKey = oldId ?? (`gigihologram_${manufacturedId}`);

        // console.log(internalPodId, internalName, oldPodId, tsDataKey);

        /** @type {undefined | existingGigiHologramTSDataByGigiHologramKey[keyof existingGigiHologramTSDataByGigiHologramKey]} */
        const existingData = (
            existingGigiHologramTSDataByGigiHologramKey[oldId]
            || existingGigiHologramTSDataByGigiHologramKey[manufacturedId]
            || existingGigiHologramTSDataByGigiHologramKey[tsDataKey]
            || Object.values(existingGigiHologramTSDataByGigiHologramKey).find(data => data.internalId === manufacturedId)
        );

        // remove existingData object from the merged data mapping;
        // we will be overwriting it later with the "standardized" tsDataKey
        for(const [k, v] of Object.entries(mergedGigiTSData)) {
            if(v === existingData) {
                delete mergedGigiTSData[k];
                break;
            }
        }

        // const processedManualDialogue = processedDialogues[tsDataKey];
        // console.log(tsDataKey, processedManualDialogue);

        // const dimension = existingData?.dimension ?? (areaNameForKey?.match(/^(zone|coreScene)Lab/i) ? MapType.labyrinth : MapType.overworld);

        /** @type {ExistingGigiHologramDataType} */
        const _mergedDataObj = { ...existingData,
            // internalId: internalId,
            name: existingData?.name ?? "Gigi Hologram",
            // name: (existingData && !/([a-z]+) gordo/i.test(existingData.name)) ? existingData.name : `${slimetypeUppercasedFirst} Gordo`,
            // name: name,
            // In-game coordinate system is at 90 degrees to our map; swap x and y axes.
            // position: { x: -pos.z, y: pos.x },
            position: transformIngameToMapPosition(pos),
            // image: image,
            description: existingData?.description ?? "Todo: insert a description for this Gigi hologram " + manufacturedId,
            // dimension: existingData?.dimension ?? "MapType.overworld",
            // dimension: existingData?.dimension ?? MapType.labyrinth,
            // unlocks: existingData?.unlocks ?? ["Todo: specify puzzle door unlocks"],
            dialogue: processedDialogues[tsDataKey],
        };
        // clear out all entries with undefined values
        Object.keys(_mergedDataObj).forEach(key => typeof _mergedDataObj[key] === "undefined" && delete _mergedDataObj[key]);
        // save merged data back
        mergedGigiTSData[tsDataKey] = _mergedDataObj;

        if(existingData)
            console.log(`Merged extracted Gigi hologram ${manufacturedId} data with existing ${tsDataKey} data`);
        else
            console.log(`Inserted extracted Gigi hologram ${manufacturedId} data to ${tsDataKey} data`)
    }

    console.log("Writing Gigi hologram data back to map data file");

    fnWriteGigiHologramsBackToFile(mergedGigiTSData);
}

async function exportMapNodesFromAssetsMapping(/** @type {AssetsMappingType | undefined} */ assetsMapping, /** @type {CacheOpts} */ cacheOpts) {

    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    /** @type {{ fileId: string, assetJSON: AssetJSONType, gameObj: AssetJSONType, pos: { x: number, y: number, z: number } }[]} */
    let ingameMapNodePositions;
    
    if(cacheOpts.useCache && existsSync("./data_cache/mapNodeAssetsAndPositions.json")) {
    // if(false) {  // for debugging
        
        console.log("Reading cached map node coordinates...");

        ingameMapNodePositions = JSON.parse(readFileSync("./data_cache/mapNodeAssetsAndPositions.json"));

        console.log(`Read (${ingameMapNodePositions.length}) map node coordinates from cache file.`);

    } else {

        assetsMapping ??= await getOrExtractScenesAssetsMapping(cacheOpts);

        console.log("Extracting map node coordinates from assets JSON...");

        const mapnodeMonoBehavioursEntries = Object.entries(assetsMapping)
            .filter(([, assetJSON]) => {
            
                // const _id = assetJSON.props["_id"];
            
                // if(!_id) return false;

                // if(!/^nullifierdoor[0-9]+$/.test(_id)) return false;

                // if it's for a Map Node, I expect it to have both of these properties. Otherwise, I expect it to have neither.
                const prop_onZoneUnlockEvent = assetJSON.props["_onZoneUnlockEvent"];
                const prop_hologram = assetJSON.props["_hologram"];

                if(!prop_onZoneUnlockEvent && !prop_hologram) {
                    // has neither
                    return false;
                }

                if(!prop_onZoneUnlockEvent || !prop_hologram) {
                    console.log(assetJSON);
                    throw new Error(`Asset had only one of \"_onZoneUnlockEvent\" and \"_hologram\" props! (!!prop_onZoneUnlockEvent = ${!!prop_onZoneUnlockEvent}, !!prop_hologram = ${!!prop_hologram})`)
                }

                if(assetJSON.typeName !== "MonoBehaviour") {
                    console.log(assetJSON);
                    throw new Error("found asset with a \"_onZoneUnlockEvent\" and \"_hologram\" props, but it was not a MonoBehaviour?");
                }

                return true;

            });
        console.log(`Retrieved ${mapnodeMonoBehavioursEntries.length} map node MonoBehaviour entries.`);

        // /** @type {{ [fileGUID: string]: AssetJSONType }} */
        // const mapIdentAndDefGUIDtoAssetJSONs = { };

        // const metaFileGuidRegex = /^guid: *([0-9a-f]{32})$/im;
    
        // const identsAndDefsFilePaths = globSync(GLOBS_TO_IDENTIFIABLETYPE_AND_DEFINITION_FILES);

        // await Promise.all(identsAndDefsFilePaths.map(
        //     async (assetpath) => {
        //         // const filenameNoExt = basename(assetpath).split(".")[0];

        //         const metadata = await readFile(assetpath + ".meta", { encoding: "utf-8" });
        //         const guid = metaFileGuidRegex.exec(metadata)[1];
                
        //         /** @type {AssetsMappingType} */
        //         const identOrDefAssetsMapping = { }
        //         parseUnityFileYamlIntoAssetsMapping(assetpath, identOrDefAssetsMapping);
        //         if(Object.keys(identOrDefAssetsMapping).length !== 1) {
        //             throw new Error("Expected only one asset to be in the identifiable type asset or definition asset file");
        //         }
        //         const identOrDefAssetJSON = Object.values(identOrDefAssetsMapping)[0];

        //         mapIdentAndDefGUIDtoAssetJSONs[guid] = identOrDefAssetJSON;
        //     }
        // ));
        // throw new Error("temp");

        // ingameDronePositions = await Promise.all(droneEntryMonoBehavioursEntries.map(mapFnDetermineResearchDronePosition(assetsMapping)));
        ingameMapNodePositions = await Promise.all(mapnodeMonoBehavioursEntries.map(async (/** @type {[ fileId: string, assetJSON: AssetJSONType ]} */ [fileId, assetJSON]) => {

            console.log(`[Map Node (assetJSON fileKeyFileId: ${assetJSON.fileKey + '&' + assetJSON.fileId})]: Determining position of map node`);

            const { gameObj: doorGameObj, transformChainChildToParent, position: pos } = followMonoBehaviourGameObjectTransformChain(assetsMapping, assetJSON);

            // for(const child of transformChainChildToParent) {
            //     console.log(child.typeName);
            //     console.log(child.fileKey);
            //     console.log(child.fileId);
            //     console.log(child.props["m_LocalPosition"]);
            //     console.log(child.props["m_LocalRotation"]);
            //     console.log(child.props["m_LocalScale"]);
            // }

            console.log(`[Map Node ${manufactureMapNodeIdFromAssets(assetJSON, doorGameObj, pos)}]: Through a chain of ${transformChainChildToParent.length} transform(s), found position to be ${JSON.stringify(pos)}`);

            // return { fileId, assetJSON, gordoGameObj, targetCount, slimeDefinitionAssetJSON, dietGroupsAssetsJSON, favoriteFoodsAssetJSON, pos };
            return { fileId, assetJSON, doorGameObj, pos };

        }));

        console.log(`Determined ${ingameMapNodePositions.length} map node assets and their positions.`);
        
        // // for debugging, cache the whole transform chain as well (and each transform's gameObject for good measure)
        // for(const d of ingameDronePositions) {
        //     const {podGameObj:depoGameObj,position,transformChainChildToParent} = followMonoBehaviourGameObjectTransformChain(assetsMapping, d.assetJSON);
        //     d.transformChainChildToParent = transformChainChildToParent.map(c => {
        //         const gameObj = assetsMapping[c.fileKey + "&" + c.props["m_GameObject"]["fileID"]];
        //         return { ...c, gameObject: gameObj };
        //     });
        // }

        if(cacheOpts.exportToCache) {
            const _export = () => {
                writeFileSync("./data_cache/mapNodeAssetsAndPositions.json", JSON.stringify(ingameMapNodePositions));
                console.log("Exported map node assets and their positions to cache.");
            };
            if(cacheOpts.exportToCache === "sync") {
                console.log("Exporting map node assets and their positions to cache...")
                _export();
            }
            else (async () => { _export(); })();
        }

    }

    
    // /** @type {{ [fileGUID: string]: AssetJSONType }} */
    // const mapIdentAndDefGUIDtoAssetJSONs = { };

    // const metaFileGuidRegex = /^guid: *([0-9a-f]{32})$/im;

    // const identsAndDefsFilePaths = globSync(GLOBS_TO_IDENTIFIABLETYPE_AND_DEFINITION_FILES);

    // await Promise.all(identsAndDefsFilePaths.map(
    //     async (assetpath) => {
    //         // const filenameNoExt = basename(assetpath).split(".")[0];

    //         const metadata = await readFile(assetpath + ".meta", { encoding: "utf-8" });
    //         const guid = metaFileGuidRegex.exec(metadata)[1];
            
    //         /** @type {AssetsMappingType} */
    //         const identOrDefAssetsMapping = { }
    //         parseUnityFileYamlIntoAssetsMapping(assetpath, identOrDefAssetsMapping);
    //         if(Object.keys(identOrDefAssetsMapping).length !== 1) {
    //             throw new Error("Expected only one asset to be in the identifiable type asset or definition asset file");
    //         }
    //         const identOrDefAssetJSON = Object.values(identOrDefAssetsMapping)[0];

    //         mapIdentAndDefGUIDtoAssetJSONs[guid] = identOrDefAssetJSON;
    //     }
    // ));


    console.log("Parsing existing map node data in the map data files...")

    const { fnWriteMapNodesBackToFile, existingMapNodeTSDataByKey } = readExistingMapNodesTSData(cacheOpts);

    console.log(`Parsed ${Object.keys(existingMapNodeTSDataByKey).length} existing map node data entries.`);

    const mergedMapNodeTSData = { ...existingMapNodeTSDataByKey };

    console.log("Merging existing and extracted map node data");
    
    // merge existing and extracted map node data
    
    for(const { fileId, assetJSON, gameObj: mapnodeGameObjJSON, pos } of ingameMapNodePositions) {
        /** @type {string} */
        const manufacturedId = manufactureMapNodeIdFromAssets(assetJSON, mapnodeGameObjJSON, pos);

        // /** @type {string} */
        // const slimetype = slimeDefinitionAssetJSON.props["Name"]?.toLowerCase() ?? "unknownslimetype";

        // for testing
        // const mapNodeIdInternalToOld = (x) => undefined;
        
        const oldId = mapNodeIdInternalToOld(manufacturedId);

        let areaNameForKey;
        // TODO determine area name?
        if(!oldId) {
            // console.log("debug: fileKey: ", assetJSON.fileKey);
            // make a best guess based on what scene file the asset was in.
            console.log(assetJSON.fileKey);
            areaNameForKey = /((?:environment|zone|coreScene)[a-z0-9_]+).unity/i.exec(assetJSON.fileKey)?.[1]?.toLowerCase()?.replace("_","")
                ?? "undeterminedarea";
            // areaNameForKey = "undeterminedarea";
        }
        const tsDataKey = oldId ?? (`mapnode_${areaNameForKey}_${manufacturedId}`);

        /** @type {undefined | existingMapNodeTSDataByKey[keyof existingMapNodeTSDataByKey]} */
        const existingData = (
            existingMapNodeTSDataByKey[oldId]
            || existingMapNodeTSDataByKey[manufacturedId]
            || existingMapNodeTSDataByKey[tsDataKey]
            || Object.values(existingMapNodeTSDataByKey).find(data => data.internalId === manufacturedId)
        );

        // remove existingData object from the merged data mapping;
        // we will be overwriting it later with the "standardized" tsDataKey
        for(const [k, v] of Object.entries(mergedMapNodeTSData)) {
            if(v === existingData) {
                delete mergedMapNodeTSData[k];
                break;
            }
        }

        const dimension = existingData?.dimension ?? (areaNameForKey?.match(/^((zone|coreScene)Lab|zoneRainbowCore)/i) ? MapType.labyrinth : MapType.overworld);

        /** @type {ExistingMapNodeDataType} */
        const _mergedDataObj = { ...existingData,
            internalId: "idk_todo",  // TODO
            name: existingData?.name ?? "Todo: give this Map Node a name",
            // name: (existingData && !/([a-z]+) gordo/i.test(existingData.name)) ? existingData.name : `${slimetypeUppercasedFirst} Gordo`,
            // name: name,
            // In-game coordinate system is at 90 degrees to our map; swap x and y axes.
            // position: { x: -pos.z, y: pos.x },
            pos: transformIngameToMapPosition(pos),
            // image: image,
            description: existingData?.description ?? "Todo: insert a description for this map node " + manufacturedId,
            // dimension: existingData?.dimension ?? "MapType.overworld",
            // dimension: existingData?.dimension ?? MapType.overworld,
            dimension: dimension,
            // unlocks: existingData?.unlocks ?? ["Todo: specify puzzle door unlocks"],
        };
        // clear out all entries with undefined values
        Object.keys(_mergedDataObj).forEach(key => typeof _mergedDataObj[key] === "undefined" && delete _mergedDataObj[key]);
        // save merged data back
        mergedMapNodeTSData[tsDataKey] = _mergedDataObj;

        if(existingData)
            console.log(`Merged extracted map node ${manufacturedId} data with existing ${tsDataKey} data`);
        else
            console.log(`Inserted extracted map node ${manufacturedId} data to ${tsDataKey} data`)
    }

    console.log("Writing map node data back to map data file");

    fnWriteMapNodesBackToFile(mergedMapNodeTSData);
}

/** @type {{[fileKey: string]: AssetsMappingType}} */
let _sceneFileLineRendererAssetsMappingsCache = {};

function getLineRendererAssetsMappingForSceneFile(sceneFile) {

    if(typeof _sceneFileLineRendererAssetsMappingsCache[sceneFile] === "undefined") {

        console.log(` Extracting LineRenderer assets from scene file ${sceneFile} ...`)
        
        /** @type {AssetsMappingType} */
        const lineRenderersAssetsMappingForScene = {};
        
        parseUnityFileYamlIntoAssetsMapping(sceneFile, lineRenderersAssetsMappingForScene, n => /^(LineRenderer)$/i.test(n));

        console.log(` Extracted ${Object.keys(lineRenderersAssetsMappingForScene).length} LineRenderer assets from scene file ${sceneFile}`)

        _sceneFileLineRendererAssetsMappingsCache[sceneFile] = lineRenderersAssetsMappingForScene;

    }

    return _sceneFileLineRendererAssetsMappingsCache[sceneFile];
    
}

async function exportProjectorPuzzlesFromAssetsMapping(/** @type {AssetsMappingType | undefined} */ assetsMapping, /** @type {CacheOpts} */ cacheOpts) {

    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    /** @type {{ fileId: string, assetJSON: AssetJSONType, puzzleGameObj: AssetJSONType, beamPointType: "start" | "end", pos: { x: number, y: number, z: number } }[]} */
    let ingameProjectorPuzzlePositions;
    
    if(cacheOpts.useCache && existsSync("./data_cache/projectorPuzzleAssetsAndPositions.json")) {
    // if(false) {  // for debugging
        
        console.log("Reading cached projector puzzle coordinates...");

        ingameProjectorPuzzlePositions = JSON.parse(readFileSync("./data_cache/projectorPuzzleAssetsAndPositions.json"));

        console.log(`Read (${ingameProjectorPuzzlePositions.length}) projector puzzle coordinates from cache file.`);

    } else {

        assetsMapping ??= await getOrExtractScenesAssetsMapping(cacheOpts);

        console.log("Extracting projector puzzle coordinates from assets JSON...");

        const puzzleMonoBehavioursEntries = Object.entries(assetsMapping)
            .filter(([, assetJSON]) => {
            
                // const _id = assetJSON.props["_id"];
            
                // if(!_id) return false;

                // if(!/^nullifierdoor[0-9]+$/.test(_id)) return false;

                // // if it's for an energy beam receiver or transmitter, I expect it to have both of these properties. Otherwise, I expect it to have neither.
                // const prop_holeTransform = assetJSON.props["_holeTransform"];
                // const prop_wallTransform = assetJSON.props["_wallTransform"];

                /*
                * example properties of interest:
                * _emitAngleOffset: 0
                * _emitAngleRange: 60
                * _emitRadius: 30
                * _receiveAngleOffset: 30
                * _receiveAngleRange: 180
                * _laserFireOrigin: {fileID: 5262}
                * _laserReceiveOrigin: {fileID: 5262}
                */
                // if it's for an energy beam receiver or transmitter, I expect it to have all of these properties. Otherwise, I expect it to have none.
                const expectedProperties = [
                    "_emitAngleOffset",
                    "_emitAngleRange",
                    "_emitRadius",
                    "_receiveAngleOffset",
                    "_receiveAngleRange",
                    "_laserFireOrigin",
                    "_laserReceiveOrigin",
                ]
                const propsVals = Object.fromEntries(expectedProperties.map(prop => [prop, assetJSON.props[prop]]));

                // if(!prop_holeTransform && !prop_wallTransform) {
                //     // has neither
                //     return false;
                // }

                const existingProps = new Set(Object.entries(propsVals).filter(([,v]) => typeof v !== "undefined").map(([k,]) => k));
                const foundCt = existingProps.size;
                const expectedCt = expectedProperties.length;

                if(foundCt === 0) {
                    // has none
                    return false;
                }

                if(foundCt < expectedCt) {
                    console.log(assetJSON);
                    throw new Error(`Asset had only ${foundCt} of ${expectedCt} expected props! (${Object.keys(propsVals).map((k) => `has prop ${k} = ${existingProps.has(k)}`).join(", ")})`)
                }

                if(assetJSON.typeName !== "MonoBehaviour") {
                    console.log(assetJSON);
                    throw new Error("found asset with expected projector puzzle props, but it was not a MonoBehaviour?");
                }

                return true;

            });
        console.log(`Retrieved ${puzzleMonoBehavioursEntries.length} projector puzzle MonoBehaviour entries.`);

        // ingameDronePositions = await Promise.all(droneEntryMonoBehavioursEntries.map(mapFnDetermineResearchDronePosition(assetsMapping)));
        ingameProjectorPuzzlePositions = await Promise.all(puzzleMonoBehavioursEntries.map(async (/** @type {[ fileId: string, assetJSON: AssetJSONType ]} */ [fileId, assetJSON]) => {

            console.log(`[Projector Puzzle (assetJSON fileKeyFileId: ${assetJSON.fileKey + '&' + assetJSON.fileId})]: Determining position of projector puzzle`);

            const { gameObj: puzzleGameObj, transformChainChildToParent, position: pos } = followMonoBehaviourGameObjectTransformChain(assetsMapping, assetJSON);

            // for(const child of transformChainChildToParent) {
            //     console.log(child.typeName);
            //     console.log(child.fileKey);
            //     console.log(child.fileId);
            //     console.log(child.props["m_LocalPosition"]);
            //     console.log(child.props["m_LocalRotation"]);
            //     console.log(child.props["m_LocalScale"]);
            // }

            let hasLineRenderer = false;

            for(const childGameObj of iterChildGameObjects_DFS(assetsMapping, puzzleGameObj, { includeTransforms: false, includeThisGameObj: true, recurse: true })) {

                const lineRenderersAssetsMapping = getLineRendererAssetsMappingForSceneFile(childGameObj.fileKey);

                // check if it's a game object with a line renderer component
                const _ignoreFalsyComponentObjs = true;  // because some are not LineRenderer assets; e.g. the Transform assets, ...
                for(const componentObj of iterGameObjectComponentObjs(lineRenderersAssetsMapping, childGameObj, _ignoreFalsyComponentObjs)) {
                    if(componentObj.typeName === "LineRenderer") {
                        hasLineRenderer = true;
                        break;
                    }
                }
            }

            const beamPointType = hasLineRenderer ? "start" : "end";

            console.log(`[Projector Puzzle ${manufactureProjectorPuzzleIdFromAssets(assetJSON, puzzleGameObj, pos)}]: Through a chain of ${transformChainChildToParent.length} transform(s), found position to be ${JSON.stringify(pos)}`);

            return { fileId, assetJSON, puzzleGameObj, pos, beamPointType };

        }));

        // reset the extra assets mapping cache for memory release purposes
        _sceneFileLineRendererAssetsMappingsCache = { };

        console.log(`Determined ${ingameProjectorPuzzlePositions.length} projector puzzle assets and their positions.`);
        
        // // for debugging, cache the whole transform chain as well (and each transform's gameObject for good measure)
        // for(const d of ingameDronePositions) {
        //     const {podGameObj:depoGameObj,position,transformChainChildToParent} = followMonoBehaviourGameObjectTransformChain(assetsMapping, d.assetJSON);
        //     d.transformChainChildToParent = transformChainChildToParent.map(c => {
        //         const gameObj = assetsMapping[c.fileKey + "&" + c.props["m_GameObject"]["fileID"]];
        //         return { ...c, gameObject: gameObj };
        //     });
        // }

        if(cacheOpts.exportToCache) {
            const _export = () => {
                writeFileSync("./data_cache/projectorPuzzleAssetsAndPositions.json", JSON.stringify(ingameProjectorPuzzlePositions));
                console.log("Exported projector puzzle assets and their positions to cache.");
            };
            if(cacheOpts.exportToCache === "sync") {
                console.log("Exporting projector puzzle assets and their positions to cache...")
                _export();
            }
            else (async () => { _export(); })();
        }

    }


    console.log("Parsing existing projector puzzle data in the map data files...")

    const { fnWriteProjectorPuzzlesBackToFile, existingProjectorPuzzleTSDataByKey } = readExistingProjectorPuzzlesTSData(cacheOpts);

    console.log(`Parsed ${Object.keys(existingProjectorPuzzleTSDataByKey).length} existing projector puzzle data entries.`);

    const mergedPuzzleTSData = { ...existingProjectorPuzzleTSDataByKey };

    console.log("Merging existing and extracted projector puzzle data");

    /** search through existing ts data, looking for entry that contains this beam point, matching by its beam point id */
    const findPuzzleDataEntryWithBeamPointWithId = (
        /** @type {ingameProjectorPuzzlePositions[number]} */ assetInfoAndPosition,
        /** @type {string} */ beamPointId,
        // /** @type {string} */ oldId,
        // /** @type {string} */ tsDataKey,
    ) => {
        const { beamPointType } = assetInfoAndPosition;
        /** @type {`${beamPointType}Point`} */
        const typeSubkey = `${beamPointType}Point`;  // -> startPoint or endPoint
        for(const tsDataEntryKey of Object.keys(existingProjectorPuzzleTSDataByKey)) {
            const v = existingProjectorPuzzleTSDataByKey[tsDataEntryKey];
            if(v[typeSubkey]?.id === beamPointId) {
                return { tsDataEntryKey, typeSubkey, entry: v[typeSubkey] };
            }
        }
        return undefined;
    }
    
    // merge existing and extracted projector puzzle data
    
    for(const assetInfoAndPosition of ingameProjectorPuzzlePositions) {
        const { fileId, assetJSON, puzzleGameObj: puzzleGameObjJSON, pos, beamPointType } = assetInfoAndPosition;

        /** @type {string} */
        const manufacturedBeamPointId = manufactureProjectorPuzzleIdFromAssets(assetJSON, puzzleGameObjJSON, pos, beamPointType);

        // /** @type {string} */
        // const slimetype = slimeDefinitionAssetJSON.props["Name"]?.toLowerCase() ?? "unknownslimetype";

        // for testing
        // const projectorPuzzleIdInternalToOld = (x) => undefined;
        
        // const oldId = projectorPuzzleIdInternalToOld(manufacturedId);

        let areaNameForKey;
        // TODO determine area name?
        // if(!oldId) {
        //     // console.log("debug: fileKey: ", assetJSON.fileKey);
        //     // make a best guess based on what scene file the asset was in.
        //     console.log(assetJSON.fileKey);
        //     areaNameForKey = /((?:zone|coreScene)[a-z0-9_]+).unity/i.exec(assetJSON.fileKey)?.[1]?.toLowerCase()?.replace("_","")
        //         ?? "undeterminedarea";
        //     // areaNameForKey = "undeterminedarea";
        // }
        // const tsDataKey = oldId ?? (`projectorpuzzle_${manufacturedId}`);

        // console.log(internalPodId, internalName, oldPodId, tsDataKey);

        /* @type {undefined | existingProjectorPuzzleTSDataByKey[keyof existingProjectorPuzzleTSDataByKey]} */
        // const existingData = (
        //     existingProjectorPuzzleTSDataByKey[oldId]
        //     || existingProjectorPuzzleTSDataByKey[manufacturedId]
        //     || existingProjectorPuzzleTSDataByKey[tsDataKey]
        //     || Object.values(existingProjectorPuzzleTSDataByKey).find(data => data.internalId === manufacturedId)
        // );
        const found = findPuzzleDataEntryWithBeamPointWithId(assetInfoAndPosition, manufacturedBeamPointId);

        const tsDataKey = found?.tsDataEntryKey ?? `undeterminedpuzzle_beampoint_${manufacturedBeamPointId}`;

        const tsDataBeamPointTypeSubkey = found?.typeSubkey ?? `${beamPointType}Point`;

        // remove existingData object from the merged data mapping;
        // we will be overwriting it later with the "standardized" tsDataKey
        // for(const [k, v] of Object.entries(mergedPuzzleTSData)) {
        //     if(v === existingData) {
        //         delete mergedPuzzleTSData[k];
        //         break;
        //     }
        // }
        if(found && mergedPuzzleTSData[tsDataKey]?.[tsDataBeamPointTypeSubkey]) {
            delete mergedPuzzleTSData[tsDataKey][tsDataBeamPointTypeSubkey];
        }

        // const dimension = existingData?.dimension ?? (areaNameForKey?.match(/^(zone|coreScene)Lab/i) ? MapType.labyrinth : MapType.overworld);

        /** @type {ExistingProjectorPuzzleDataType["startPoint" | "endPoint"]} */
        const _mergedBeamPointDataObj = { ...found?.entry,
            id: manufacturedBeamPointId,
            nameSuffix: found?.entry.nameSuffix ?? `Beam ${beamPointType === "start" ? "Emitter" : "Receiver"}`,
            position: transformIngameToMapPosition(pos),
            description: found?.entry.description ?? "Todo: insert a description for this projector puzzle beam point " + manufacturedBeamPointId,
        };
        // clear out all entries with undefined values
        Object.keys(_mergedBeamPointDataObj).forEach(key => typeof _mergedBeamPointDataObj[key] === "undefined" && delete _mergedBeamPointDataObj[key]);

        // const _existingRootPuzzleObj = mergedPuzzleTSData[tsDataKey];

        // merge some data into parent puzzle object
        mergedPuzzleTSData[tsDataKey] ??= { };
        mergedPuzzleTSData[tsDataKey].unlocks ??= ["Todo: specify the unlocks of this radiant projector puzzle"];
        mergedPuzzleTSData[tsDataKey].name ??= `${areaNameForKey ? areaNameForKey + " " : ""}Puzzle`;

        // save merged data back
        mergedPuzzleTSData[tsDataKey][tsDataBeamPointTypeSubkey] = _mergedBeamPointDataObj;

        if(found)
            console.log(`Merged extracted projector puzzle ${beamPointType} ${manufacturedBeamPointId} data with existing ${tsDataKey} data`);
        else
            console.log(`Inserted extracted projector puzzle ${beamPointType} ${manufacturedBeamPointId} data to ${tsDataKey} data`)
    }

    console.log("Writing projector puzzle data back to map data file");

    fnWriteProjectorPuzzlesBackToFile(mergedPuzzleTSData);
}

async function exportTeleportersFromAssetsMapping(/** @type {AssetsMappingType | undefined} */ assetsMapping, /** @type {CacheOpts} */ cacheOpts) {

    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    /** @type {{ [sourceNodeFileGUID: string]: {
     *      sourceTeleporterAssetInfo: { assetJSON: AssetJSONType, pos: Vec3 },
     *      linkName: string,
     *      destGUID: string,
     *      destTeleporterAssetInfo: { assetJSON: AssetJSONType, pos: Vec3, dimension: MapType },
     * }}} */
    let networkNodeLinksMapping;
    
    if(cacheOpts.useCache && existsSync("./data_cache/teleporterNetworkAssetsAndPositions.json")) {
    // if(false) {  // for debugging
        
        console.log("Reading cached teleporter network's assets and coordinates...");

        networkNodeLinksMapping = JSON.parse(readFileSync("./data_cache/teleporterNetworkAssetsAndPositions.json"));

        console.log(`Read (${Object.keys(networkNodeLinksMapping).length}) teleporter network's links' assets and coordinates from cache file.`);

    } else {

        assetsMapping ??= await getOrExtractScenesAssetsMapping(cacheOpts);

        console.log("Extracting teleporter network's assets and coordinates from assets JSON...");

        // const doorMonoBehavioursEntries = Object.entries(assetsMapping)
        //     .filter(([, assetJSON]) => {
            
        //         // const _id = assetJSON.props["_id"];
            
        //         // if(!_id) return false;

        //         // if(!/^nullifierdoor[0-9]+$/.test(_id)) return false;

        //         // if it's for a Discordant Wall, I expect it to have both of these properties. Otherwise, I expect it to have neither.
        //         const prop_holeTransform = assetJSON.props["_holeTransform"];
        //         const prop_wallTransform = assetJSON.props["_wallTransform"];

        //         if(!prop_holeTransform && !prop_wallTransform) {
        //             // has neither
        //             return false;
        //         }

        //         if(!prop_holeTransform || !prop_wallTransform) {
        //             console.log(assetJSON);
        //             throw new Error(`Asset had only one of \"_holeTransform\" and \"_wallTransform\" props! (!!prop_holeTransform = ${!!prop_holeTransform}, !!prop_wallTransform = ${!!prop_wallTransform})`)
        //         }

        //         if(assetJSON.typeName !== "MonoBehaviour") {
        //             console.log(assetJSON);
        //             throw new Error("found asset with a \"_holeTransform\" and \"_wallTransform\" props, but it was not a MonoBehaviour?");
        //         }

        //         return true;

        //     });
        // console.log(`Retrieved ${doorMonoBehavioursEntries.length} nullifierdoor MonoBehaviour entries.`);


        const mapTeleporterAssetGUIDsToAssetJSONs = await fromGlobsMapAssetGUIDsToAssetJSONs(GLOBS_TO_ANCIENT_TELEPORTER_ASSETS);

        const teleporterAssetGUIDsSet = new Set(Object.keys(mapTeleporterAssetGUIDsToAssetJSONs));

        /** @type {{ [teleporterGUID: string]: { assetJSON: AssetJSONType, pos: Vec3 }} */
        const mapTeleporterAssetGUIDsToAssetJSONInfo = Object.values(assetsMapping)
            .filter(
                (assetJSON) => {
                    /** @type {UnityFileRefType} */
                    const teleporterNodeDef = assetJSON.props["_nodeDefinition"];

                    if(typeof teleporterNodeDef === "undefined") {
                        return false;
                    }

                    if(teleporterNodeDef.fileID === 0 || typeof teleporterNodeDef.guid === "undefined") {
                        console.warn("found asset with a \"_nodeDefinition\" prop, but it was a blank (fileID=0) reference! Skipping it for now.");
                        console.warn(assetJSON);
                        return false;
                    }
                    
                    if(!teleporterAssetGUIDsSet.has(teleporterNodeDef.guid)) {
                        console.error(assetJSON);
                        throw new Error("found asset with a \"_nodeDefinition\" prop, but it was not a reference to a teleporter asset?");
                    }

                    if(assetJSON.typeName !== "MonoBehaviour") {
                        console.error(assetJSON);
                        throw new Error("found asset with a \"_nodeDefinition\" prop, but it was not a MonoBehaviour?");
                    }

                    return true;
                }
            ).map(
                (assetJSON) => {
                    /** @type {string} */
                    const teleporterGUID = assetJSON.props["_nodeDefinition"].guid;
                    const teleporterNodeAsset = assetJSON;
                    const { gameObj, position: pos } = followMonoBehaviourGameObjectTransformChain(assetsMapping, teleporterNodeAsset);
                    return { teleporterGUID, assetJSON, pos };
                }
            ).reduce(
                (accumObj, { teleporterGUID, assetJSON, pos }) => {
                    if(Object.hasOwn(accumObj, teleporterGUID)) {
                        console.error(`previously accumulated teleporter assetJSON:\n`, accumObj[teleporterGUID]);
                        console.error(`current teleporter assetJSON:\n`, assetJSON);
                        throw new Error("Found two extracted teleporter node definition file refs in scene(s) pointing to the same teleporter asset!");
                    }
                    console.log(teleporterGUID);
                    accumObj[teleporterGUID] = { assetJSON, pos };
                    return accumObj;
                },
                { }
            );

        /** @type {{ [fileGUID: string]: AssetJSONType }} */
        const mapSceneGroupAssetGUIDtoAssetJSONs = await fromGlobsMapAssetGUIDsToAssetJSONs(GLOBS_TO_SCENE_GROUP_ASSETS);

        /** @type {AssetsMappingType} */
        const teleportNetworkAssetsMapping = { }

        const teleportNetworkAssetsFilePaths = globSync(GLOB_TO_TELEPORT_NETWORK_DEFINITION);

        // expecting only one network definition file
        if(teleportNetworkAssetsFilePaths.length !== 1) {
            console.warn(`Expected the glob to teleport network definition to only have one file! Found ${teleportNetworkAssetsFilePaths.length}. glob: ${GLOB_TO_TELEPORT_NETWORK_DEFINITION}`);
        }

        await Promise.all(teleportNetworkAssetsFilePaths.map(
            async (assetpath) => {
                parseUnityFileYamlIntoAssetsMapping(assetpath, teleportNetworkAssetsMapping);
            }
        ));

        /*
         * Example teleport network definition items of interest:
         * ...
         * items:
         * - Name: FieldsToGorgeMain
         *   SourceNode: {fileID: 11400000, guid: 759fb6beac478744cb786463b0ca774c, type: 2}
         *   DestinationNodes:
         *   - DestinationNode: {fileID: 11400000, guid: db65b5a3b5784904cb97dcb350145c76, type: 2}
         *     DestinationSceneGroup: {fileID: 11400000, guid: 00fd5d1ba07c8b24b9e97f1cf7023590, type: 2}
         *   ForceSceneTransition: 0
         * - ...
         */

        /** @typedef {{ fileID: number, guid: string, type: number }} UnityFileRefType */

        /** @type {{ Name: string, SourceNode: UnityFileRefType, DestinationNodes: Array<{ DestinationNode: UnityFileRefType, DestinationSceneGroup: UnityFileRefType }> }[]} */
        const networkDefItems = Object.values(teleportNetworkAssetsMapping).flatMap(networkAssetJSON => networkAssetJSON.props["items"]);
        console.debug(`  networkDefItems.length: ${networkDefItems.length}`);

        /** @type {{ [sourceNodeFileGUID: string]: {
         *      sourceTeleporterAssetInfo: { assetJSON: AssetJSONType, pos: Vec3 },
         *      linkName: string,
         *      destGUID: string,
         *      destTeleporterAssetInfo: { assetJSON: AssetJSONType, pos: Vec3 },
         *      destDimension: MapType
         * }}} */
        networkNodeLinksMapping = Object.fromEntries(networkDefItems.map(item => {

            if(item.DestinationNodes.length !== 1) {
                throw new Error(`Why was there not exactly one destination for this teleport network item? ${JSON.stringify(item)}`);
            }

            const sceneGroupGUID = item.DestinationNodes[0].DestinationSceneGroup.guid;
            const destGUID = item.DestinationNodes[0].DestinationNode.guid;
            const destSceneGroupDimension = (
                /Labyrinth\.asset/i.test(mapSceneGroupAssetGUIDtoAssetJSONs[sceneGroupGUID].fileKey)
                ? MapType.labyrinth
                : MapType.overworld
            );

            if(!mapTeleporterAssetGUIDsToAssetJSONInfo[item.SourceNode.guid]) {
                // console.log(mapTeleporterAssetGUIDsToAssetJSONInfo);
                console.log("No extracted teleporter asset for item.SourceNode.guid ?")
                console.log(item.SourceNode.guid);
                console.log(item);
            }

            return [
                item.SourceNode.guid,
                {
                    sourceTeleporterAssetInfo: mapTeleporterAssetGUIDsToAssetJSONInfo[item.SourceNode.guid],
                    linkName: item.Name,
                    destGUID: destGUID,
                    destTeleporterAssetInfo: mapTeleporterAssetGUIDsToAssetJSONInfo[destGUID],
                    destDimension: destSceneGroupDimension,
                }
            ];

        }));

        // throw new Error("temp");



        // // ingameDronePositions = await Promise.all(droneEntryMonoBehavioursEntries.map(mapFnDetermineResearchDronePosition(assetsMapping)));
        // ingameTeleporterAssetsAndPositions = await Promise.all(doorMonoBehavioursEntries.map(async (/** @type {[ fileId: string, assetJSON: AssetJSONType ]} */ [fileId, assetJSON]) => {

        //     console.log(`[Nullifier Door (assetJSON fileKeyFileId: ${assetJSON.fileKey + '&' + assetJSON.fileId})]: Determining position of teleporter`);

        //     const { gameObj: doorGameObj, transformChainChildToParent, position: pos } = followMonoBehaviourGameObjectTransformChain(assetsMapping, assetJSON);

        //     // for(const child of transformChainChildToParent) {
        //     //     console.log(child.typeName);
        //     //     console.log(child.fileKey);
        //     //     console.log(child.fileId);
        //     //     console.log(child.props["m_LocalPosition"]);
        //     //     console.log(child.props["m_LocalRotation"]);
        //     //     console.log(child.props["m_LocalScale"]);
        //     // }

        //     console.log(`[Nullifier Door ${manufactureTeleporterAssetsAndIdFromAssets(assetJSON, doorGameObj, pos)}]: Through a chain of ${transformChainChildToParent.length} transform(s), found position to be ${JSON.stringify(pos)}`);

        //     // return { fileId, assetJSON, gordoGameObj, targetCount, slimeDefinitionAssetJSON, dietGroupsAssetsJSON, favoriteFoodsAssetJSON, pos };
        //     return { fileId, assetJSON, doorGameObj, pos };

        // }));

        // console.log(`Determined ${ingameTeleporterAssetsAndPositions.length} teleporter assets and their positions.`);
        
        // // // for debugging, cache the whole transform chain as well (and each transform's gameObject for good measure)
        // // for(const d of ingameDronePositions) {
        // //     const {podGameObj:depoGameObj,position,transformChainChildToParent} = followMonoBehaviourGameObjectTransformChain(assetsMapping, d.assetJSON);
        // //     d.transformChainChildToParent = transformChainChildToParent.map(c => {
        // //         const gameObj = assetsMapping[c.fileKey + "&" + c.props["m_GameObject"]["fileID"]];
        // //         return { ...c, gameObject: gameObj };
        // //     });
        // // }

        if(cacheOpts.exportToCache) {
            const _export = () => {
                writeFileSync("./data_cache/teleporterNetworkAssetsAndPositions.json", JSON.stringify(networkNodeLinksMapping));
                console.log("Exported teleporter network's assets and their positions to cache.");
            };
            if(cacheOpts.exportToCache === "sync") {
                console.log("Exporting teleporter network's assets and their positions to cache...")
                _export();
            }
            else (async () => { _export(); })();
        }

    }

    //

    console.log("Parsing existing teleporter data in the data files...");

    const {
        teleportLines: {
            existingTSDataByTsDataKey: existingTeleportLinesTSDataByTsDataKey,
            fnWriteTSDataBackToFile: fnWriteTeleportLinesTSDataBackToFile
        },
        teleportPads: {
            existingTSDataByTsDataKey: existingTeleportPadsTSDataByTsDataKey,
            fnWriteTSDataBackToFile: fnWriteTeleportPadsTSDataBackToFile
        },
    } = readExistingTeleportersTSData(cacheOpts);

    console.log(
        `Parsed ${Object.keys(existingTeleportLinesTSDataByTsDataKey).length} existing teleporter line entries`
        + ` and ${Object.keys(existingTeleportPadsTSDataByTsDataKey).length} existing teleporter pad entries.`
    );

    //

    console.log("Merging existing and extracted teleporter line data");

    const mergedTeleportLinesTSData = { ...existingTeleportLinesTSDataByTsDataKey };

    // extract the linked pairs of teleport pads

    /** @type {{ [teleporterGUID: string]: { assetJSON: AssetJSONType, pos: Vec3, dimension: MapType } }} */
    const teleporterGUIDsToAssetJSONsMapReconstructed = { };

    /** @type {[guid1: string, guid2: string][]} */
    const teleporterLinkPairs = [];

    for(const sourceGUID of Object.keys(networkNodeLinksMapping)) {
        const { linkName, sourceTeleporterAssetInfo, destGUID, destTeleporterAssetInfo, destDimension } = networkNodeLinksMapping[sourceGUID];

        // reconstruct the mapping of teleporters as the links are iterated
        if(sourceTeleporterAssetInfo) {
            teleporterGUIDsToAssetJSONsMapReconstructed[sourceGUID] = {
                dimension: /^(?:core|scene|environment)?lab/i.test(basename(sourceTeleporterAssetInfo.assetJSON.fileKey)) ? MapType.labyrinth : MapType.overworld,
                ...teleporterGUIDsToAssetJSONsMapReconstructed[sourceGUID],
                ...sourceTeleporterAssetInfo,
            };
        }
        if(destTeleporterAssetInfo) {
            teleporterGUIDsToAssetJSONsMapReconstructed[destGUID] = {
                ...teleporterGUIDsToAssetJSONsMapReconstructed[destGUID],
                ...destTeleporterAssetInfo,
                dimension: destDimension,
            };
        }

        assert(!!sourceGUID, `sourceGUID was not truthy? sourceGUID = ${sourceGUID}`);
        assert(!!destGUID, `destGUID was not truthy? destGUID = ${destGUID}`);

        if(!sourceTeleporterAssetInfo)
            console.warn(`sourceTeleporterAssetInfo was not truthy? sourceGUID = ${sourceGUID} ; sourceTeleporterAssetInfo = ${sourceTeleporterAssetInfo}`);
        if(!destTeleporterAssetInfo)
            console.warn(`destTeleporterAssetInfo was not truthy? destGUID = ${destGUID} ; destTeleporterAssetInfo = ${destTeleporterAssetInfo}`);
        if(!sourceTeleporterAssetInfo || !destTeleporterAssetInfo) {
            // this link couldn't be made because one or both of the teleporter assets weren't found in the scenes
            //  (e.g., they may be the gadget teleporters?)
            continue;
        }

        // if this pair hasn't already been found,
        //   from either teleportation direction (source->dest or dest->source),
        //   then add it to the list of pairs.
        if(!teleporterLinkPairs.find(([linkGUID1, linkGUID2]) => (linkGUID1 === sourceGUID && linkGUID2 === destGUID) || (linkGUID1 === destGUID && linkGUID2 === sourceGUID))) {
            const linkPairSorted = sourceGUID < destGUID ? [sourceGUID, destGUID] : [destGUID, sourceGUID];
            teleporterLinkPairs.push(linkPairSorted);
        }
    }

    // merge/insert the linked pairs

    for(const [ guid1, guid2 ] of teleporterLinkPairs) {

        const teleporterAsset1Info = teleporterGUIDsToAssetJSONsMapReconstructed[guid1];
        const teleporterAsset2Info = teleporterGUIDsToAssetJSONsMapReconstructed[guid2];

        // console.log('guid1: ', guid1);
        // console.log('guid2: ', guid2);

        if(teleporterAsset1Info.dimension && teleporterAsset2Info.dimension && (teleporterAsset1Info.dimension !== teleporterAsset2Info.dimension)) {
            // They're in separate dimensions. Don't try drawing a line between them.
            continue;
        }

        // const teleporter1ShortName = basename(teleporterAsset1Info.assetJSON.fileKey).replaceAll(/[^A-Z0-9]+/g,"");
        const teleporter1ShortName = basename(teleporterAsset1Info.assetJSON.fileKey).replaceAll(/(^zone|^scene|^environment|\..+$)/gi,"");
        // const teleporter2ShortName = basename(teleporterAsset2Info.assetJSON.fileKey).replaceAll(/[^A-Z0-9]+/g,"");
        const teleporter2ShortName = basename(teleporterAsset2Info.assetJSON.fileKey).replaceAll(/(^zone|^scene|^environment|\..+$)/gi,"");

        const tsDataKey = `line_${teleporter1ShortName}_${teleporter2ShortName}`;

        /** @type {undefined | mergedTeleportLinesTSData[keyof mergedTeleportLinesTSData]} */
        const existingData = (
            mergedTeleportLinesTSData[tsDataKey]
        );

        // remove existingData object from the merged data mapping;
        // we will be overwriting it later with the "standardized" tsDataKey
        for(const [k, v] of Object.entries(mergedTeleportLinesTSData)) {
            if(v === existingData) {
                delete mergedTeleportLinesTSData[k];
                break;
            }
        }

        // const dimension = existingData?.dimension ?? (areaNameForKey?.match(/^(zone|coreScene)Lab/i) ? MapType.labyrinth : MapType.overworld);

        const pos1 = transformIngameToMapPosition(teleporterAsset1Info.pos);
        const pos2 = transformIngameToMapPosition(teleporterAsset2Info.pos);

        /** @type {ExportFilterMetaPropertiesType["__noModify"]} */
        let __noModify = [];

        const extractedPositions = [ pos1, pos2 ];

        let positions;
        if(existingData?.positions) {
            positions = existingData.positions;
            // __noModify.push(...positions.filter(({ x, y }, i) =>
            //     // if the existing position at index i is not found in the extracted positions, mark it as __noModify
            //     existingData.positions.length !== extractedPositions.length
            //     || !extractedPositions.some((extractedPos) => extractedPos.x === x && extractedPos.y === y)
            // ).map((_, i) =>
            //     ["positions", i]
            // ));
        } else {
            positions = extractedPositions;
        }
        let midpoint;
        if(existingData?.positions && existingData.positions.length > 2) {
            midpoint = undefined;
            // __noModify.push(["midpoint"]);
        } else {
            midpoint = existingData?.midpoint ?? { x: (pos1.x + pos2.x) / 2, y: (pos1.y + pos2.y) / 2 };
        }

        /** @type {ExistingTeleportLineDataType} */
        const _mergedDataObj = { ...existingData,
            name: existingData?.name ?? "Todo: insert a name for this teleporter line " + tsDataKey,
            dimension: existingData?.dimension ?? teleporterAsset1Info.dimension ?? teleporterAsset2Info.dimension ?? MapType.overworld,
            positions: positions,
            midpoint: midpoint,
            __noModify: __noModify.length > 0 ? __noModify : undefined,
        };
        // clear out all entries with undefined values
        Object.keys(_mergedDataObj).forEach(key => typeof _mergedDataObj[key] === "undefined" && delete _mergedDataObj[key]);
        // save merged data back
        mergedTeleportLinesTSData[tsDataKey] = _mergedDataObj;

        if(existingData)
            console.log(`Merged extracted teleporter ${/*manufacturedId*/tsDataKey} data with existing ${tsDataKey} data`);
        else
            console.log(`Inserted extracted teleporter ${/*manufacturedId*/tsDataKey} data to ${tsDataKey} data`)
    }

    console.log("Writing teleporter lines data back to data file");

    fnWriteTeleportLinesTSDataBackToFile(mergedTeleportLinesTSData);

    // merge/insert the pad
    
    console.log("Merging existing and extracted teleporter pad data");

    const mergedTeleportPadsTSData = { ...existingTeleportPadsTSDataByTsDataKey };

    for(const [teleporterGUID, teleporterAssetJSONInfo] of Object.entries(teleporterGUIDsToAssetJSONsMapReconstructed)) {
        /** @type {string} */
        const manufacturedId = manufactureTeleporterPadIdFromAssets(teleporterAssetJSONInfo.assetJSON, teleporterAssetJSONInfo.pos);

        const oldId = undefined;

        if(!teleporterAssetJSONInfo || !teleporterAssetJSONInfo.assetJSON) {
            continue;
        }

        // const teleporterShortName = basename(teleporterAssetJSONInfo.assetJSON.fileKey).replaceAll(/[^A-Z0-9]+/g,"");
        const teleporterShortName = basename(teleporterAssetJSONInfo.assetJSON.fileKey).replaceAll(/(^zone|^scene|^environment|\..+$)/gi,"");

        const tsDataKey = `teleporter_${teleporterShortName}_${manufacturedId}`;

        /** @type {undefined | mergedTeleportLinesTSData[keyof mergedTeleportLinesTSData]} */
        const existingData = (
            mergedTeleportLinesTSData[oldId]
            || mergedTeleportLinesTSData[manufacturedId]
            || mergedTeleportLinesTSData[tsDataKey]
            || Object.values(mergedTeleportLinesTSData).find(data => data.internalId === manufacturedId)
        );


        // remove existingData object from the merged data mapping;
        // we will be overwriting it later with the "standardized" tsDataKey
        for(const [k, v] of Object.entries(mergedTeleportPadsTSData)) {
            if(v === existingData) {
                delete mergedTeleportPadsTSData[k];
                break;
            }
        }

        // const dimension = existingData?.dimension ?? (areaNameForKey?.match(/^(zone|coreScene)Lab/i) ? MapType.labyrinth : MapType.overworld);
        let dimension = existingData?.dimension ?? teleporterAssetJSONInfo.dimension;
        // let dimension = teleporterAssetJSONInfo.dimension;
        if(typeof dimension === "undefined") {
            console.warn(`Could not find a dimension for teleporter asset ${(teleporterAssetJSONInfo.assetJSON.fileKey + "&" + teleporterAssetJSONInfo.assetJSON.fileId)} ;`);
            // dimension = /^lab/i.test(teleporterShortName) ? MapType.labyrinth : MapType.overworld;
            console.warn(`  Defaulting to overworld.`)
            dimension = MapType.overworld;
        }

        /** @type {ExistingTeleportPadDataType} */
        const _mergedDataObj = { ...existingData,
            internalId: manufacturedId,
            name: existingData?.name ?? ((teleporterShortName + " ") + "Ancient Teleporter"),
            position: transformIngameToMapPosition(teleporterAssetJSONInfo.pos),
            description: existingData?.description ?? "Todo: insert a description for this teleporter " + manufacturedId,
            dimension: dimension,
        };
        // clear out all entries with undefined values
        Object.keys(_mergedDataObj).forEach(key => typeof _mergedDataObj[key] === "undefined" && delete _mergedDataObj[key]);
        // save merged data back
        mergedTeleportPadsTSData[tsDataKey] = _mergedDataObj;

        if(existingData)
            console.log(`Merged extracted teleporter ${manufacturedId} data with existing ${tsDataKey} data`);
        else
            console.log(`Inserted extracted teleporter ${manufacturedId} data to ${tsDataKey} data`)


        
    }

    console.log("Writing teleporter pads data back to data file");

    fnWriteTeleportPadsTSDataBackToFile(mergedTeleportPadsTSData);

    return;



    // for(const { fileId, assetJSON, doorGameObj: doorGameObjJSON, pos } of ingameTeleporterAssetsAndPositions) {
    //     /** @type {string} */
    //     const manufacturedId = manufactureTeleporterAssetsAndIdFromAssets(assetJSON, doorGameObjJSON, pos);

    //     // /** @type {string} */
    //     // const slimetype = slimeDefinitionAssetJSON.props["Name"]?.toLowerCase() ?? "unknownslimetype";

    //     // for testing
    //     const teleporterLineIdInternalToOld = (x) => undefined;
        
    //     const oldId = teleporterLineIdInternalToOld(manufacturedId);

    //     let areaNameForKey;
    //     // TODO determine area name?
    //     // if(!oldId) {
    //     //     // console.log("debug: fileKey: ", assetJSON.fileKey);
    //     //     // make a best guess based on what scene file the asset was in.
    //     //     console.log(assetJSON.fileKey);
    //     //     areaNameForKey = /((?:zone|coreScene)[a-z0-9_]+).unity/i.exec(assetJSON.fileKey)?.[1]?.toLowerCase()?.replace("_","")
    //     //         ?? "undeterminedarea";
    //     //     // areaNameForKey = "undeterminedarea";
    //     // }
    //     const tsDataKey = oldId ?? (`nullifierdoor_${manufacturedId}`);

    //     // console.log(internalPodId, internalName, oldPodId, tsDataKey);

    //     /** @type {undefined | existingTeleporterAssetsAndTSDataByGateKey[keyof existingTeleporterAssetsAndTSDataByGateKey]} */
    //     const existingData = (
    //         existingTeleporterAssetsAndTSDataByGateKey[oldId]
    //         || existingTeleporterAssetsAndTSDataByGateKey[manufacturedId]
    //         || existingTeleporterAssetsAndTSDataByGateKey[tsDataKey]
    //         || Object.values(existingTeleporterAssetsAndTSDataByGateKey).find(data => data.internalId === manufacturedId)
    //     );

    //     // remove existingData object from the merged data mapping;
    //     // we will be overwriting it later with the "standardized" tsDataKey
    //     for(const [k, v] of Object.entries(mergedDoorTSData)) {
    //         if(v === existingData) {
    //             delete mergedDoorTSData[k];
    //             break;
    //         }
    //     }

    //     // const dimension = existingData?.dimension ?? (areaNameForKey?.match(/^(zone|coreScene)Lab/i) ? MapType.labyrinth : MapType.overworld);

    //     /** @type {ExistingTeleporterAssetsAndDataType} */
    //     const _mergedDataObj = { ...existingData,
    //         // internalId: internalId,
    //         // name: existingData?.name ?? ["TODO retrieve name from translation table"],
    //         // name: (existingData && !/([a-z]+) gordo/i.test(existingData.name)) ? existingData.name : `${slimetypeUppercasedFirst} Gordo`,
    //         // name: name,
    //         // In-game coordinate system is at 90 degrees to our map; swap x and y axes.
    //         // position: { x: -pos.z, y: pos.x },
    //         position: transformIngameToMapPositions(pos),
    //         // image: image,
    //         description: existingData?.description ?? "Todo: insert a description for this teleporter " + manufacturedId,
    //         // dimension: existingData?.dimension ?? "MapType.overworld",
    //         // dimension: existingData?.dimension ?? MapType.labyrinth,
    //         // unlocks: existingData?.unlocks ?? ["Todo: specify puzzle door unlocks"],
    //     };
    //     // clear out all entries with undefined values
    //     Object.keys(_mergedDataObj).forEach(key => typeof _mergedDataObj[key] === "undefined" && delete _mergedDataObj[key]);
    //     // save merged data back
    //     mergedDoorTSData[tsDataKey] = _mergedDataObj;

    //     if(existingData)
    //         console.log(`Merged extracted teleporter ${manufacturedId} data with existing ${tsDataKey} data`);
    //     else
    //         console.log(`Inserted extracted teleporter ${manufacturedId} data to ${tsDataKey} data`)
    // }

    // console.log("Writing teleporter data back to map data file");

    // fnWriteTeleporterAssetsAndsBackToFile(mergedDoorTSData);

}

// /**
//  * @param {AssetsMappingType | undefined} assetsMapping 
//  * @param {CacheOpts | undefined} cacheOpts 
//  * @param {string} nameForLogging 
//  * @param {string} assetsAndPositionsCacheFile 
//  * @param {(([fileKeyFileId, assetJSON]: [string, AssetJSONType]) => boolean)} monoBehaviourAssetFilter 
//  */
// async function exportObjectsFromAssetsMapping(
//     assetsMapping,
//     cacheOpts,
//     nameForLogging,
//     assetsAndPositionsCacheFile,
//     monoBehaviourAssetFilter
// ) {

//     cacheOpts = {...defaultCacheSettings, ...cacheOpts};

//     /** @type {{ fileId: string, assetJSON: AssetJSONType, doorGameObj: AssetJSONType, pos: { x: number, y: number, z: number } }[]} */
//     let assetsAndIngamePositions;
    
//     if(cacheOpts.useCache && existsSync(assetsAndPositionsCacheFile)) {
//     // if(false) {  // for debugging
        
//         console.log(`Reading cached ${nameForLogging} coordinates...`);

//         assetsAndIngamePositions = JSON.parse(readFileSync(assetsAndPositionsCacheFile));

//         console.log(`Read (${assetsAndIngamePositions.length}) ${nameForLogging} coordinates from cache file.`);

//     } else {

//         assetsMapping ??= await getOrExtractScenesAssetsMapping(cacheOpts);

//         console.log(`Extracting ${nameForLogging} coordinates from assets JSON...`);

//         const doorMonoBehavioursEntries = Object.entries(assetsMapping)
//             .filter(([, assetJSON]) => {
            
//                 // const _id = assetJSON.props["_id"];
            
//                 // if(!_id) return false;

//                 // if(!/^nullifierdoor[0-9]+$/.test(_id)) return false;

//                 // if it's for a Discordant Wall, I expect it to have both of these properties. Otherwise, I expect it to have neither.
//                 const prop_holeTransform = assetJSON.props["_holeTransform"];
//                 const prop_wallTransform = assetJSON.props["_wallTransform"];

//                 if(!prop_holeTransform && !prop_wallTransform) {
//                     // has neither
//                     return false;
//                 }

//                 if(!prop_holeTransform || !prop_wallTransform) {
//                     console.log(assetJSON);
//                     throw new Error(`Asset had only one of \"_holeTransform\" and \"_wallTransform\" props! (!!prop_holeTransform = ${!!prop_holeTransform}, !!prop_wallTransform = ${!!prop_wallTransform})`)
//                 }

//                 if(assetJSON.typeName !== "MonoBehaviour") {
//                     console.log(assetJSON);
//                     throw new Error("found asset with a \"_holeTransform\" and \"_wallTransform\" props, but it was not a MonoBehaviour?");
//                 }

//                 return true;

//             });
//         console.log(`Retrieved ${doorMonoBehavioursEntries.length} ${nameForLogging} MonoBehaviour entries.`);

//         // /** @type {{ [fileGUID: string]: AssetJSONType }} */
//         // const mapIdentAndDefGUIDtoAssetJSONs = { };

//         // const metaFileGuidRegex = /^guid: *([0-9a-f]{32})$/im;
    
//         // const identsAndDefsFilePaths = globSync(GLOBS_TO_IDENTIFIABLETYPE_AND_DEFINITION_FILES);

//         // await Promise.all(identsAndDefsFilePaths.map(
//         //     async (assetpath) => {
//         //         // const filenameNoExt = basename(assetpath).split(".")[0];

//         //         const metadata = await readFile(assetpath + ".meta", { encoding: "utf-8" });
//         //         const guid = metaFileGuidRegex.exec(metadata)[1];
                
//         //         /** @type {AssetsMappingType} */
//         //         const identOrDefAssetsMapping = { }
//         //         parseUnityFileYamlIntoAssetsMapping(assetpath, identOrDefAssetsMapping);
//         //         if(Object.keys(identOrDefAssetsMapping).length !== 1) {
//         //             throw new Error("Expected only one asset to be in the identifiable type asset or definition asset file");
//         //         }
//         //         const identOrDefAssetJSON = Object.values(identOrDefAssetsMapping)[0];

//         //         mapIdentAndDefGUIDtoAssetJSONs[guid] = identOrDefAssetJSON;
//         //     }
//         // ));
//         // throw new Error("temp");

//         const _capitalizedNameForLogging = nameForLogging.split(" ").map(word => word && /^[a-z]$/.test(word) ? capitalizeFirst(word) : word).join(" ");

//         // ingameDronePositions = await Promise.all(droneEntryMonoBehavioursEntries.map(mapFnDetermineResearchDronePosition(assetsMapping)));
//         assetsAndIngamePositions = await Promise.all(doorMonoBehavioursEntries.map(async (/** @type {[ fileId: string, assetJSON: AssetJSONType ]} */ [fileId, assetJSON]) => {

//             console.log(`[${_capitalizedNameForLogging} (assetJSON fileKeyFileId: ${assetJSON.fileKey + '&' + assetJSON.fileId})]: Determining position of ${nameForLogging}`);

//             const { gameObj: doorGameObj, transformChainChildToParent, position: pos } = followMonoBehaviourGameObjectTransformChain(assetsMapping, assetJSON);

//             // for(const child of transformChainChildToParent) {
//             //     console.log(child.typeName);
//             //     console.log(child.fileKey);
//             //     console.log(child.fileId);
//             //     console.log(child.props["m_LocalPosition"]);
//             //     console.log(child.props["m_LocalRotation"]);
//             //     console.log(child.props["m_LocalScale"]);
//             // }

//             console.log(`[${_capitalizedNameForLogging} ${manufactureNullifierDoorIdFromAssets(assetJSON, doorGameObj, pos)}]: Through a chain of ${transformChainChildToParent.length} transform(s), found position to be ${JSON.stringify(pos)}`);

//             // return { fileId, assetJSON, gordoGameObj, targetCount, slimeDefinitionAssetJSON, dietGroupsAssetsJSON, favoriteFoodsAssetJSON, pos };
//             return { fileId, assetJSON, doorGameObj, pos };

//         }));

//         console.log(`Determined ${assetsAndIngamePositions.length} ${nameForLogging} assets and their positions.`);
        
//         // // for debugging, cache the whole transform chain as well (and each transform's gameObject for good measure)
//         // for(const d of ingameDronePositions) {
//         //     const {podGameObj:depoGameObj,position,transformChainChildToParent} = followMonoBehaviourGameObjectTransformChain(assetsMapping, d.assetJSON);
//         //     d.transformChainChildToParent = transformChainChildToParent.map(c => {
//         //         const gameObj = assetsMapping[c.fileKey + "&" + c.props["m_GameObject"]["fileID"]];
//         //         return { ...c, gameObject: gameObj };
//         //     });
//         // }

//         if(cacheOpts.exportToCache) {
//             const _export = () => {
//                 writeFileSync(assetsAndPositionsCacheFile, JSON.stringify(assetsAndIngamePositions));
//                 console.log(`Exported ${nameForLogging} assets and their positions to cache.`);
//             };
//             if(cacheOpts.exportToCache === "sync") {
//                 console.log(`Exporting ${nameForLogging} assets and their positions to cache...`);
//                 _export();
//             }
//             else (async () => { _export(); })();
//         }

//     }

    
//     // /** @type {{ [fileGUID: string]: AssetJSONType }} */
//     // const mapIdentAndDefGUIDtoAssetJSONs = { };

//     // const metaFileGuidRegex = /^guid: *([0-9a-f]{32})$/im;

//     // const identsAndDefsFilePaths = globSync(GLOBS_TO_IDENTIFIABLETYPE_AND_DEFINITION_FILES);

//     // await Promise.all(identsAndDefsFilePaths.map(
//     //     async (assetpath) => {
//     //         // const filenameNoExt = basename(assetpath).split(".")[0];

//     //         const metadata = await readFile(assetpath + ".meta", { encoding: "utf-8" });
//     //         const guid = metaFileGuidRegex.exec(metadata)[1];
            
//     //         /** @type {AssetsMappingType} */
//     //         const identOrDefAssetsMapping = { }
//     //         parseUnityFileYamlIntoAssetsMapping(assetpath, identOrDefAssetsMapping);
//     //         if(Object.keys(identOrDefAssetsMapping).length !== 1) {
//     //             throw new Error("Expected only one asset to be in the identifiable type asset or definition asset file");
//     //         }
//     //         const identOrDefAssetJSON = Object.values(identOrDefAssetsMapping)[0];

//     //         mapIdentAndDefGUIDtoAssetJSONs[guid] = identOrDefAssetJSON;
//     //     }
//     // ));


//     console.log(`Parsing existing ${nameForLogging} data in the map data files...`);

//     const { fnWriteNullifierDoorsBackToFile, existingNullifierDoorTSDataByGateKey } = readExistingNullifierDoorsTSData(cacheOpts);

//     console.log(`Parsed ${Object.keys(existingNullifierDoorTSDataByGateKey).length} existing ${nameForLogging} data entries.`);

//     const mergedDoorTSData = { ...existingNullifierDoorTSDataByGateKey };

//     console.log(`Merging existing and extracted ${nameForLogging} data`);
    
//     // merge existing and extracted shadow depo data
    
//     for(const { fileId, assetJSON, doorGameObj: doorGameObjJSON, pos } of assetsAndIngamePositions) {
//         /** @type {string} */
//         const manufacturedId = manufactureNullifierDoorIdFromAssets(assetJSON, doorGameObjJSON, pos);

//         // /** @type {string} */
//         // const slimetype = slimeDefinitionAssetJSON.props["Name"]?.toLowerCase() ?? "unknownslimetype";

//         // for testing
//         const nullifierDoorIdInternalToOld = (x) => undefined;
        
//         const oldId = nullifierDoorIdInternalToOld(manufacturedId);

//         let areaNameForKey;
//         // TODO determine area name?
//         // if(!oldId) {
//         //     // console.log("debug: fileKey: ", assetJSON.fileKey);
//         //     // make a best guess based on what scene file the asset was in.
//         //     console.log(assetJSON.fileKey);
//         //     areaNameForKey = /((?:zone|coreScene)[a-z0-9_]+).unity/i.exec(assetJSON.fileKey)?.[1]?.toLowerCase()?.replace("_","")
//         //         ?? "undeterminedarea";
//         //     // areaNameForKey = "undeterminedarea";
//         // }
//         const tsDataKey = oldId ?? (`nullifierdoor_${manufacturedId}`);

//         // console.log(internalPodId, internalName, oldPodId, tsDataKey);

//         /** @type {undefined | existingNullifierDoorTSDataByGateKey[keyof existingNullifierDoorTSDataByGateKey]} */
//         const existingData = (
//             existingNullifierDoorTSDataByGateKey[oldId]
//             || existingNullifierDoorTSDataByGateKey[manufacturedId]
//             || existingNullifierDoorTSDataByGateKey[tsDataKey]
//             || Object.values(existingNullifierDoorTSDataByGateKey).find(data => data.internalId === manufacturedId)
//         );

//         // remove existingData object from the merged data mapping;
//         // we will be overwriting it later with the "standardized" tsDataKey
//         for(const [k, v] of Object.entries(mergedDoorTSData)) {
//             if(v === existingData) {
//                 delete mergedDoorTSData[k];
//                 break;
//             }
//         }

//         // const dimension = existingData?.dimension ?? (areaNameForKey?.match(/^(zone|coreScene)Lab/i) ? MapType.labyrinth : MapType.overworld);

//         /** @type {ExistingNullifierDoorDataType} */
//         const _mergedDataObj = { ...existingData,
//             // internalId: internalId,
//             // name: existingData?.name ?? ["TODO retrieve name from translation table"],
//             // name: (existingData && !/([a-z]+) gordo/i.test(existingData.name)) ? existingData.name : `${slimetypeUppercasedFirst} Gordo`,
//             // name: name,
//             // In-game coordinate system is at 90 degrees to our map; swap x and y axes.
//             // position: { x: -pos.z, y: pos.x },
//             position: transformIngameToMapPositions(pos),
//             // image: image,
//             description: existingData?.description ?? `Todo: insert a description for this ${nameForLogging ?? ""} ${manufacturedId}`,
//             // dimension: existingData?.dimension ?? "MapType.overworld",
//             // dimension: existingData?.dimension ?? MapType.labyrinth,
//             // unlocks: existingData?.unlocks ?? ["Todo: specify puzzle door unlocks"],
//         };
//         // clear out all entries with undefined values
//         Object.keys(_mergedDataObj).forEach(key => typeof _mergedDataObj[key] === "undefined" && delete _mergedDataObj[key]);
//         // save merged data back
//         mergedDoorTSData[tsDataKey] = _mergedDataObj;

//         if(existingData)
//             console.log(`Merged extracted ${nameForLogging} ${manufacturedId} data with existing ${tsDataKey} data`);
//         else
//             console.log(`Inserted extracted ${nameForLogging} ${manufacturedId} data to ${tsDataKey} data`)
//     }

//     console.log(`Writing ${nameForLogging} data back to map data file`);

//     fnWriteNullifierDoorsBackToFile(mergedDoorTSData);
// }

async function exportPlotPlannersFromAssetsMapping(/** @type {AssetsMappingType | undefined} */ assetsMapping, /** @type {CacheOpts} */ cacheOpts) {

    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    /** @type {{ fileId: string, assetJSON: AssetJSONType, plotGameObj: AssetJSONType, pos: { x: number, y: number, z: number } }[]} */
    let ingamePlotPlannerPositions;
    
    if(cacheOpts.useCache && existsSync("./data_cache/plotPlannerAssetsAndPositions.json")) {
    // if(false) {  // for debugging
        
        console.log("Reading cached plot planner coordinates...");

        ingamePlotPlannerPositions = JSON.parse(readFileSync("./data_cache/plotPlannerAssetsAndPositions.json"));

        console.log(`Read (${ingamePlotPlannerPositions.length}) plot planner coordinates from cache file.`);

    } else {

        assetsMapping ??= await getOrExtractScenesAssetsMapping(cacheOpts);

        console.log("Extracting plot planner coordinates from assets JSON...");

        const plotMonoBehavioursEntries = Object.entries(assetsMapping)
            .filter(([, assetJSON]) => {
            
                const prop_landPlot = assetJSON.props["landPlot"];

                if(!prop_landPlot) {
                    return false;
                }

                if(assetJSON.typeName !== "MonoBehaviour") {
                    console.log(assetJSON);
                    throw new Error("found asset with a \"landPlot\" prop, but it was not a MonoBehaviour?");
                }

                return true;

            });
        console.log(`Retrieved ${plotMonoBehavioursEntries.length} plot planner MonoBehaviour entries.`);

        // /** @type {{ [fileGUID: string]: AssetJSONType }} */
        // const mapIdentAndDefGUIDtoAssetJSONs = { };

        // const metaFileGuidRegex = /^guid: *([0-9a-f]{32})$/im;
    
        // const identsAndDefsFilePaths = globSync(GLOBS_TO_IDENTIFIABLETYPE_AND_DEFINITION_FILES);

        // await Promise.all(identsAndDefsFilePaths.map(
        //     async (assetpath) => {
        //         // const filenameNoExt = basename(assetpath).split(".")[0];

        //         const metadata = await readFile(assetpath + ".meta", { encoding: "utf-8" });
        //         const guid = metaFileGuidRegex.exec(metadata)[1];
                
        //         /** @type {AssetsMappingType} */
        //         const identOrDefAssetsMapping = { }
        //         parseUnityFileYamlIntoAssetsMapping(assetpath, identOrDefAssetsMapping);
        //         if(Object.keys(identOrDefAssetsMapping).length !== 1) {
        //             throw new Error("Expected only one asset to be in the identifiable type asset or definition asset file");
        //         }
        //         const identOrDefAssetJSON = Object.values(identOrDefAssetsMapping)[0];

        //         mapIdentAndDefGUIDtoAssetJSONs[guid] = identOrDefAssetJSON;
        //     }
        // ));
        // throw new Error("temp");

        // ingameDronePositions = await Promise.all(droneEntryMonoBehavioursEntries.map(mapFnDetermineResearchDronePosition(assetsMapping)));
        ingamePlotPlannerPositions = await Promise.all(plotMonoBehavioursEntries.map(async (/** @type {[ fileId: string, assetJSON: AssetJSONType ]} */ [fileId, assetJSON]) => {

            console.log(`[Plot Planner (assetJSON fileKeyFileId: ${assetJSON.fileKey + '&' + assetJSON.fileId})]: Determining position of plot planner`);

            const { gameObj: plotGameObj, transformChainChildToParent, position: pos } = followMonoBehaviourGameObjectTransformChain(assetsMapping, assetJSON);

            // for(const child of transformChainChildToParent) {
            //     console.log(child.typeName);
            //     console.log(child.fileKey);
            //     console.log(child.fileId);
            //     console.log(child.props["m_LocalPosition"]);
            //     console.log(child.props["m_LocalRotation"]);
            //     console.log(child.props["m_LocalScale"]);
            // }

            console.log(`[Plot Planner (assetJSON fileKeyFileId: ${assetJSON.fileKey + '&' + assetJSON.fileId})]: Through a chain of ${transformChainChildToParent.length} transform(s), found position to be ${JSON.stringify(pos)}`);

            return { fileId, assetJSON, plotGameObj, pos };

        }));

        console.log(`Determined ${ingamePlotPlannerPositions.length} plot planner assets and their positions.`);
        
        // // for debugging, cache the whole transform chain as well (and each transform's gameObject for good measure)
        // for(const d of ingameDronePositions) {
        //     const {podGameObj:depoGameObj,position,transformChainChildToParent} = followMonoBehaviourGameObjectTransformChain(assetsMapping, d.assetJSON);
        //     d.transformChainChildToParent = transformChainChildToParent.map(c => {
        //         const gameObj = assetsMapping[c.fileKey + "&" + c.props["m_GameObject"]["fileID"]];
        //         return { ...c, gameObject: gameObj };
        //     });
        // }

        if(cacheOpts.exportToCache) {
            const _export = () => {
                writeFileSync("./data_cache/plotPlannerAssetsAndPositions.json", JSON.stringify(ingamePlotPlannerPositions));
                console.log("Exported plot planner assets and their positions to cache.");
            };
            if(cacheOpts.exportToCache === "sync") {
                console.log("Exporting plot planner assets and their positions to cache...")
                _export();
            }
            else (async () => { _export(); })();
        }

    }

    
    // /** @type {{ [fileGUID: string]: AssetJSONType }} */
    // const mapIdentAndDefGUIDtoAssetJSONs = { };

    // const metaFileGuidRegex = /^guid: *([0-9a-f]{32})$/im;

    // const identsAndDefsFilePaths = globSync(GLOBS_TO_IDENTIFIABLETYPE_AND_DEFINITION_FILES);

    // await Promise.all(identsAndDefsFilePaths.map(
    //     async (assetpath) => {
    //         // const filenameNoExt = basename(assetpath).split(".")[0];

    //         const metadata = await readFile(assetpath + ".meta", { encoding: "utf-8" });
    //         const guid = metaFileGuidRegex.exec(metadata)[1];
            
    //         /** @type {AssetsMappingType} */
    //         const identOrDefAssetsMapping = { }
    //         parseUnityFileYamlIntoAssetsMapping(assetpath, identOrDefAssetsMapping);
    //         if(Object.keys(identOrDefAssetsMapping).length !== 1) {
    //             throw new Error("Expected only one asset to be in the identifiable type asset or definition asset file");
    //         }
    //         const identOrDefAssetJSON = Object.values(identOrDefAssetsMapping)[0];

    //         mapIdentAndDefGUIDtoAssetJSONs[guid] = identOrDefAssetJSON;
    //     }
    // ));


    console.log("Parsing existing plot planner data in the map data files...")

    const { fnWriteTSDataBackToFile: fnWritePlotPlannersBackToFile, existingTSDataByTsDataKey: existingPlotPlannerTSDataByRegion } = readExistingPlotPlannersTSData(cacheOpts);

    console.log(`Parsed ${Object.keys(existingPlotPlannerTSDataByRegion).reduce((accumCt, regionKey) => accumCt + Object.keys(existingPlotPlannerTSDataByRegion[regionKey]).length, 0)} existing plot planner data entries.`);

    const mergedPlotTSData = { ...existingPlotPlannerTSDataByRegion };

    console.log("Merging existing and extracted plot planner data");
    
    // merge existing and extracted plot planner data

    /** @type {{ [regionKey: string]: Array<typeof ingamePlotPlannerPositions[number]> }} */
    const plotPlannerInfoByRegion = { }

    for(const info of ingamePlotPlannerPositions) {
        const { pos } = info;
        const posOnMap = transformIngameToMapPosition(pos);
        const regions = getMapRegionsContaining(posOnMap, MapType.overworld);
        // console.log();
        const regionKey = regions[0].name.toLowerCase().replace("mapvoronoiexpansion", "");
        // console.log(pos, posOnMap, regionKey, regions);
        plotPlannerInfoByRegion[regionKey] ??= [];
        plotPlannerInfoByRegion[regionKey].push(info);
    }
    for(const regionKey of Object.keys(plotPlannerInfoByRegion)) {
        // /** @type {string} */
        // const manufacturedId = manufacturePlotPlannerIdFromAssets(assetJSON, plotGameObjJSON, pos);

        // let areaNameForKey;
        // // TODO determine area name?
        // // if(!oldId) {
        // //     // console.log("debug: fileKey: ", assetJSON.fileKey);
        // //     // make a best guess based on what scene file the asset was in.
        // //     console.log(assetJSON.fileKey);
        // //     areaNameForKey = /((?:zone|coreScene)[a-z0-9_]+).unity/i.exec(assetJSON.fileKey)?.[1]?.toLowerCase()?.replace("_","")
        // //         ?? "undeterminedarea";
        // //     // areaNameForKey = "undeterminedarea";
        // // }
        // const tsDataKey = oldId ?? (`nullifierdoor_${manufacturedId}`);

        // console.log(internalPodId, internalName, oldPodId, tsDataKey);

        // /** @type {undefined | existingPlotPlannerTSDataByRegion[keyof existingPlotPlannerTSDataByRegion]} */
        // const existingData = (
        //     existingPlotPlannerTSDataByRegion[oldId]
        //     || existingPlotPlannerTSDataByRegion[manufacturedId]
        //     || existingPlotPlannerTSDataByRegion[tsDataKey]
        //     || Object.values(existingPlotPlannerTSDataByRegion).find(data => data.internalId === manufacturedId)
        // );

        // // remove existingData object from the merged data mapping;
        // // we will be overwriting it later with the "standardized" tsDataKey
        // for(const [k, v] of Object.entries(mergedPlotTSData)) {
        //     if(v === existingData) {
        //         delete mergedPlotTSData[k];
        //         break;
        //     }
        // }

        // // const dimension = existingData?.dimension ?? (areaNameForKey?.match(/^(zone|coreScene)Lab/i) ? MapType.labyrinth : MapType.overworld);

        // /** @type {ExistingPlotPlannerDataType} */
        // const _mergedDataObj = { ...existingData,
        //     // internalId: internalId,
        //     // name: existingData?.name ?? ["TODO retrieve name from translation table"],
        //     // name: (existingData && !/([a-z]+) gordo/i.test(existingData.name)) ? existingData.name : `${slimetypeUppercasedFirst} Gordo`,
        //     // name: name,
        //     // In-game coordinate system is at 90 degrees to our map; swap x and y axes.
        //     // position: { x: -pos.z, y: pos.x },
        //     position: transformIngameToMapPosition(pos),
        //     // image: image,
        //     description: existingData?.description ?? "Todo: insert a description for this plot planner " + manufacturedId,
        //     // dimension: existingData?.dimension ?? "MapType.overworld",
        //     // dimension: existingData?.dimension ?? MapType.labyrinth,
        //     // unlocks: existingData?.unlocks ?? ["Todo: specify puzzle door unlocks"],
        // };
        // // clear out all entries with undefined values
        // Object.keys(_mergedDataObj).forEach(key => typeof _mergedDataObj[key] === "undefined" && delete _mergedDataObj[key]);
        // // save merged data back
        // mergedPlotTSData[tsDataKey] = _mergedDataObj;

        const priorPlotsCt = existingPlotPlannerTSDataByRegion[regionKey] ? Object.keys(existingPlotPlannerTSDataByRegion[regionKey]).length : null;

        /** @type {typeof existingPlotPlannerTSDataByRegion[string]} */
        const newData = { };

        let plotCtInd = 0;
        for(const { assetJSON, plotGameObj, fileId, pos } of plotPlannerInfoByRegion[regionKey]) {
            newData[plotCtInd] = {
                position: transformIngameToMapPosition(pos)
            };
            plotCtInd++;
        }

        mergedPlotTSData[regionKey] = newData;

        if(priorPlotsCt !== null)
            console.log(`Replaced existing ${regionKey} plot planner data (${priorPlotsCt} plots) with extracted ${regionKey} data (${plotCtInd} plots)`);
        else
            console.log(`Inserted extracted ${regionKey} plot planner data (${plotCtInd} plots)`);
    }

    console.log("Writing plot planner data back to map data file");

    fnWritePlotPlannersBackToFile(mergedPlotTSData);
}

/** @typedef {(import("../../../src/types.ts").PlannerPosition)} ExistingPlotPlannerDataType */

/** @type {ReturnType<typeof makeTSDataFileParserFn<{ [key: string | number]: ExistingPlotPlannerDataType }>>} */
const readExistingPlotPlannersTSData = makeTSDataFileParserFn(
    PATH_TO_PLOT_POSITIONS_DATA_FILE,
    "planner_positions",
    schemautils.objectAnyKey(
        schemautils.objectAnyKey({
            schematype: "object",
            subschema: {
                "position": _schema_Vec2
            }
        })
    ),
    { ..._jsonStringifyTransformerFns,
        shouldQuoteKey: (key, depth, keys, obj) => {
            if(depth === 0) {
                return null;
            }
            return _jsonStringifyTransformerFns.shouldQuoteKey(key, depth, keys, obj);
        },
    }
);

/** @typedef {{ internalId: string, name: string, description: string, position: Vec2, dimension: MapType, [other]?: any }} ExistingTeleportPadDataType */
/** @typedef {{ name: string, positions: Vec2[], midpoint: Vec2, dimension: MapType, [other]?: any }} ExistingTeleportLineDataType */

function readExistingTeleportersTSData(/** @type {CacheOpts} */ cacheOpts) {
    return {
        teleportPads: /** @type {ReturnType<typeof makeTSDataFileParserFn<ExistingTeleportPadDataType>>} */(makeTSDataFileParserFn(
            PATH_TO_TELEPORT_PADS_DATA_FILE,
            "teleport_pads",
            schemautils.objectAnyKey({
                schematype: "object",
                subschema: {
                    "name": "string",
                    "description": "string",
                    "position": _schema_Vec2,
                    "dimension": _schema_MapType
                }
            })
        ))(cacheOpts),
        teleportLines: /** @type {ReturnType<typeof makeTSDataFileParserFn<ExistingTeleportLineDataType>>} */(makeTSDataFileParserFn(
            PATH_TO_TELEPORT_LINES_DATA_FILE,
            "teleport_lines",
            schemautils.objectAnyKey({
                schematype: "object",
                subschema: {
                    "name": "string",
                    "positions": {
                        schematype: "array",
                        subschema: _schema_Vec2
                    },
                    // "midpoint": _schema_Vec2,
                    "dimension": _schema_MapType
                }
            })
        ))(cacheOpts),
    };
}

/**
 * @template {Record<any, any>} T
 * @param {string} pathToTSDataFile 
 * @param {string} variableNameInFile 
 * @param {ExpectedSchemaType} expectedSchema 
 * @param {import("./processing_utils.js").LooseStringifyTransformingFunctionsType<unknown>} [jsonStringifyTransformerFns=_jsonStringifyTransformerFns] 
 * @returns {((cacheOpts: CacheOpts) => {
 *     fnWriteTSDataBackToFile: (mergedTSData: { [tsDataKey: string]: T }) => void;
 *     existingTSDataByTsDataKey: { [tsDataKey: string]: T };
 * })}
 */
function makeTSDataFileParserFn(pathToTSDataFile, variableNameInFile, expectedSchema, jsonStringifyTransformerFns = _jsonStringifyTransformerFns) {
    return (/** @type {CacheOpts} */ cacheOpts) => {
        
        cacheOpts = {...defaultCacheSettings, ...cacheOpts};

        // let fileTextPrefix, fileTextPostfix;

        // if(!existsSync(path_to_ts_data_file)) {
        //     fileTextPrefix = "import { Teleporter } from \"../types\";\n\nexport const nullifier_doors: { [key: string]: Teleporter } = ";
        // }
        // else {
        //     //
        // }

        const fileText = readFileSync(pathToTSDataFile, { encoding: "utf-8" });

        // const [ , fileTextPrefix, dataObjInJsCode, fileTextPostfix ] = /^(.*const\s+nullifier_doors.*?=\s*)({\s*(?:"?[a-zA-Z0-9_]+"?\s*:\s*(?:.*)\s*,?\s*)*})(;?.*)$/s.exec(fileText);

        const pattern = new RegExp(
            `^(.*const\\s+${variableNameInFile}.*?=\\s*)({\\s*(?:"?[a-zA-Z0-9_\\-]+"?\\s*:\\s*(?:.*)\\s*,?\\s*)*})(;?.*)$`,
            "s"
        );

        const [ , fileTextPrefix, dataObjInJsCode, fileTextPostfix ] = pattern.exec(fileText);

        const parsedObj = looseJsonParseWithEval(dataObjInJsCode);

        // const _objMatchesExpectedSchema = (
        //     typeof parsedObj === "object"
        //     && Object.keys(parsedObj).every(k => (
        //         typeof parsedObj[k] === "object"
        //         && setContains(new Set(Object.keys(parsedObj[k])), ["description", "position"])
        //     ))
        // );

        // if(!_objMatchesExpectedSchema) {
        //     console.log("dataObjAsInitText = ", dataObjInJsCode);
        //     console.log("_obj = ", parsedObj);
        //     for(const k of Object.keys(parsedObj)) {
        //         if(!(
        //             typeof parsedObj[k] === "object"
        //             && setContains(new Set(Object.keys(parsedObj[k])), ["description", "position"])
        //         )) {
        //             console.log(k)
        //         }
        //     }
        //     throw new Error("unexpected loose json parse result, did not match expected schema");
        // }
        
        let _entireObjMatchesExpectedSchema = matchAgainstSchema(parsedObj, expectedSchema);

        if(!_entireObjMatchesExpectedSchema) {
            console.error("dataObjInJsCode: ", dataObjInJsCode);
            console.error("parsedObj: ", parsedObj);
            throw new Error("unexpected loose json parse result, did not match expected schema");
        }

        const fnWriteTSDataBackToFile = (/** @type {{ [tsDataKey: string]: T }} */ mergedTSData) => {
            const dataObjAsJsCode = looseJsonStringify(
                filterDataObjBeforeExport(pathToTSDataFile, mergedTSData),
                "    ",
                jsonStringifyTransformerFns
            );
            
            const newFileText = fileTextPrefix + dataObjAsJsCode + fileTextPostfix;

            writeFileSync(pathToTSDataFile, newFileText);
        };

        return {
            fnWriteTSDataBackToFile,
            /** @type {{ [tsDataKey: string]: T }} */
            existingTSDataByTsDataKey: parsedObj
        }
        
    };
}


/** @typedef {import("../../../src/types.js").ProjectorPuzzle} ExistingProjectorPuzzleDataType */

function readExistingProjectorPuzzlesTSData(/** @type {CacheOpts} */ cacheOpts) {
    
    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    const fileText = readFileSync(PATH_TO_PROJECTOR_PUZZLES_DATA_FILE, { encoding: "utf-8" });

    const [ , fileTextPrefix, dataObjInJsCode, fileTextPostfix ] = /^(.*const\s+projector_puzzles.*?=\s*)({\s*(?:"?[a-zA-Z0-9_]+"?\s*:\s*(?:.*)\s*,?\s*)*})(;?.*)$/s.exec(fileText);

    const parsedObj = looseJsonParseWithEval(dataObjInJsCode);

    const _entryMatchesExpectedSchema = k => (
        typeof parsedObj[k] === "object"
        // should have at least one of startPoint or endPoint
        && Object.keys(parsedObj[k]).some(k2 => (
            (k2 === "startPoint" || k2 === "endPoint")
            && typeof parsedObj[k][k2] === "object"
            && setContains(new Set(Object.keys(parsedObj[k][k2])), ["id", "nameSuffix", "position", "description"])
        ))
    );

    const _objMatchesExpectedSchema = (
        typeof parsedObj === "object"
        && Object.keys(parsedObj).every(_entryMatchesExpectedSchema)
    );

    if(!_objMatchesExpectedSchema) {
        console.log("dataObjAsInitText = ", dataObjInJsCode);
        console.log("_obj = ", parsedObj);
        for(const k of Object.keys(parsedObj)) {
            if(!_entryMatchesExpectedSchema(k)) {
                console.log(k)
            }
        }
        throw new Error("unexpected loose json parse result, did not match expected schema");
    }

    const fnWriteProjectorPuzzlesBackToFile = (/** @type {{ [tsDataProjectorPuzzleKey: string]: ExistingProjectorPuzzleDataType }} */ mergedProjectorPuzzleTSData) => {
        const dataObjAsJsCode = looseJsonStringify(
            filterDataObjBeforeExport(PATH_TO_PROJECTOR_PUZZLES_DATA_FILE, mergedProjectorPuzzleTSData),
            "    ",
            _jsonStringifyTransformerFns
        );
        
        const newFileText = fileTextPrefix + dataObjAsJsCode + fileTextPostfix;

        writeFileSync(PATH_TO_PROJECTOR_PUZZLES_DATA_FILE, newFileText);
    };

    return {
        fnWriteProjectorPuzzlesBackToFile,
        /** @type {{ [tsDataProjectorPuzzleKey: string]: ExistingProjectorPuzzleDataType }} */
        existingProjectorPuzzleTSDataByKey: parsedObj
    }
}

/** @typedef {{ internalId?: string, name: string, description: string, pos: { x: number, y: number }, dimension: MapType, [other]?: any }} ExistingMapNodeDataType */

function readExistingMapNodesTSData(/** @type {CacheOpts} */ cacheOpts) {
    
    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    // let fileTextPrefix, fileTextPostfix;

    const fileText = readFileSync(PATH_TO_MAP_NODES_DATA_FILE, { encoding: "utf-8" });

    // console.log(/^(.*const\s+map_nodes.*?=\s*)({\s*(?:(?:\s*\/\/[^\r\n]+\s+)*"?[a-zA-Z0-9_]+"?\s*:\s*(?:.*)\s*,?\s*)*})(;?.*)$/s.exec(fileText));
    const [ , fileTextPrefix, dataObjInJsCode, fileTextPostfix ] = /^(.*const\s+map_nodes.*?=\s*)({\s*(?:(?:\s*\/\/[^\r\n]+\s+)*"?[a-zA-Z0-9_]+"?\s*:\s*(?:.*)\s*,?\s*)*})(;?.*)$/s.exec(fileText);
    // console.log(dataObjInJsCode.length);
    // throw new Error();

    const parsedObj = looseJsonParseWithEval(dataObjInJsCode);

    const _objMatchesExpectedSchema = (
        typeof parsedObj === "object"
        && Object.keys(parsedObj).every(k => (
            typeof parsedObj[k] === "object"
            && setContains(new Set(Object.keys(parsedObj[k])), ["name", "pos", "description", "dimension"])
        ))
    );

    if(!_objMatchesExpectedSchema) {
        console.log("dataObjAsInitText = ", dataObjInJsCode);
        console.log("_obj = ", parsedObj);
        for(const k of Object.keys(parsedObj)) {
            if(!(
                typeof parsedObj[k] === "object"
                && setContains(new Set(Object.keys(parsedObj[k])), ["name", "pos", "description", "dimension"])
            )) {
                console.log(k)
            }
        }
        throw new Error("unexpected loose json parse result, did not match expected schema");
    }

    const fnWriteMapNodesBackToFile = (/** @type {{ [tsDataMapNodeKey: string]: ExistingMapNodeDataType }} */ mergedMapNodeTSData) => {
        const dataObjAsJsCode = looseJsonStringify(
            filterDataObjBeforeExport(PATH_TO_MAP_NODES_DATA_FILE, mergedMapNodeTSData),
            "    ",
            _jsonStringifyTransformerFns
        );
        
        const newFileText = fileTextPrefix + dataObjAsJsCode + fileTextPostfix;

        writeFileSync(PATH_TO_MAP_NODES_DATA_FILE, newFileText);
    };

    return {
        fnWriteMapNodesBackToFile,
        /** @type {{ [tsDataMapNodeKey: string]: ExistingMapNodeDataType }} */
        existingMapNodeTSDataByKey: parsedObj
    }
}

/** @typedef {import("../../../src/types.js").GigiHologram} ExistingGigiHologramDataType */

function readExistingGigiHologramsTSData(/** @type {CacheOpts} */ cacheOpts) {
    
    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    const fileText = readFileSync(PATH_TO_GIGI_HOLOGRAMS_DATA_FILE, { encoding: "utf-8" });

    const [ , fileTextPrefix, dataObjInJsCode, fileTextPostfix ] = /^(.*gigi_holograms.*?=\s*)({\s*(?:"?[a-zA-Z0-9_]+"?\s*:\s*(?:.*)\s*,?\s*)*})(;?.*)$/s.exec(fileText);

    const parsedObj = looseJsonParseWithEval(dataObjInJsCode);

    const _objMatchesExpectedSchema = (
        typeof parsedObj === "object"
        && Object.keys(parsedObj).every(k => (
            typeof parsedObj[k] === "object"
            && setContains(new Set(Object.keys(parsedObj[k])), ["name", "position", "description"])
        ))
    );

    if(!_objMatchesExpectedSchema) {
        console.log("dataObjAsInitText = ", dataObjInJsCode);
        console.log("_obj = ", parsedObj);
        for(const k of Object.keys(parsedObj)) {
            if(!(
                typeof parsedObj[k] === "object"
                && setContains(new Set(Object.keys(parsedObj[k])), ["name", "position", "description"])
            )) {
                console.log(k)
            }
        }
        throw new Error("unexpected loose json parse result, did not match expected schema");
    }

    const fnWriteGigiHologramsBackToFile = (/** @type {{ [tsDataGigiHologramKey: string]: ExistingGigiHologramDataType }} */ mergedGigiHologramTSData) => {
        const dataObjAsJsCode = looseJsonStringify(
            filterDataObjBeforeExport(PATH_TO_GIGI_HOLOGRAMS_DATA_FILE, mergedGigiHologramTSData),
            "    ",
            { ..._jsonStringifyTransformerFns,
                shouldSortKeys: (key, depth, keys, obj) => {
                    if (key === "dialogue") {
                        // put "entries" as the last item
                        return (a, b) => {
                            a = a.toLowerCase(); b = b.toLowerCase();
                            if(a === b) return 0;
                            if(a === "entries") return 1;
                            if(b === "entries") return -1;
                            let defaultResult = _jsonStringifyTransformerFns.shouldSortKeys(key, depth, keys, obj);
                            if(typeof defaultResult === "function") {
                                return defaultResult(a, b);
                            }
                            else if(defaultResult === true) {
                                return sortStringsWithNumbers(a, b);
                            }
                            else return 0;
                        };
                    }
                }
            }
        );
        
        const newFileText = fileTextPrefix + dataObjAsJsCode + fileTextPostfix;

        writeFileSync(PATH_TO_GIGI_HOLOGRAMS_DATA_FILE, newFileText);
    };

    return {
        fnWriteGigiHologramsBackToFile,
        /** @type {{ [tsDataGigiHologramKey: string]: ExistingGigiHologramDataType }} */
        existingGigiHologramTSDataByGigiHologramKey: parsedObj
    }
}

/** @typedef {{ description: string, position: { x: number, y: number }, [other]?: any }} ExistingNullifierDoorDataType */

function readExistingNullifierDoorsTSData(/** @type {CacheOpts} */ cacheOpts) {
    
    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    // let fileTextPrefix, fileTextPostfix;

    // if(!existsSync(PATH_TO_NULLIFIER_DOORS_DATA_FILE)) {
    //     fileTextPrefix = "import { NullifierDoor } from \"../types\";\n\nexport const nullifier_doors: { [key: string]: NullifierDoor } = ";
    // }
    // else {
    //     //
    // }

    const fileText = readFileSync(PATH_TO_NULLIFIER_DOORS_DATA_FILE, { encoding: "utf-8" });

    const [ , fileTextPrefix, dataObjInJsCode, fileTextPostfix ] = /^(.*const\s+nullifier_doors.*?=\s*)({\s*(?:"?[a-zA-Z0-9_]+"?\s*:\s*(?:.*)\s*,?\s*)*})(;?.*)$/s.exec(fileText);

    const parsedObj = looseJsonParseWithEval(dataObjInJsCode);

    const _objMatchesExpectedSchema = (
        typeof parsedObj === "object"
        && Object.keys(parsedObj).every(k => (
            typeof parsedObj[k] === "object"
            && setContains(new Set(Object.keys(parsedObj[k])), ["description", "position"])
        ))
    );

    if(!_objMatchesExpectedSchema) {
        console.log("dataObjAsInitText = ", dataObjInJsCode);
        console.log("_obj = ", parsedObj);
        for(const k of Object.keys(parsedObj)) {
            if(!(
                typeof parsedObj[k] === "object"
                && setContains(new Set(Object.keys(parsedObj[k])), ["description", "position"])
            )) {
                console.log(k)
            }
        }
        throw new Error("unexpected loose json parse result, did not match expected schema");
    }

    const fnWriteNullifierDoorsBackToFile = (/** @type {{ [tsDataNullifierDoorKey: string]: ExistingNullifierDoorDataType }} */ mergedNullifierDoorTSData) => {
        const dataObjAsJsCode = looseJsonStringify(
            filterDataObjBeforeExport(PATH_TO_NULLIFIER_DOORS_DATA_FILE, mergedNullifierDoorTSData),
            "    ",
            _jsonStringifyTransformerFns
        );
        
        const newFileText = fileTextPrefix + dataObjAsJsCode + fileTextPostfix;

        writeFileSync(PATH_TO_NULLIFIER_DOORS_DATA_FILE, newFileText);
    };

    return {
        fnWriteNullifierDoorsBackToFile,
        /** @type {{ [tsDataNullifierDoorKey: string]: ExistingNullifierDoorDataType }} */
        existingNullifierDoorTSDataByGateKey: parsedObj
    }
}

/** @typedef {{ internalId: string, description: string, position: { x: number, y: number }, [other]?: any }} ExistingStabilizingGateDataType */

function readExistingStabilizingGatesTSData(/** @type {CacheOpts} */ cacheOpts) {
    
    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    const fileText = readFileSync(PATH_TO_STABILIZING_GATES_DATA_FILE, { encoding: "utf-8" });

    const [ , fileTextPrefix, dataObjInJsCode, fileTextPostfix ] = /^(.*const\s+stabilizing_gates.*?=\s*)({\s*(?:"?[a-zA-Z0-9_]+"?\s*:\s*(?:.*)\s*,?\s*)*})(;?.*)$/s.exec(fileText);

    const parsedObj = looseJsonParseWithEval(dataObjInJsCode);

    const _objMatchesExpectedSchema = (
        typeof parsedObj === "object"
        && Object.keys(parsedObj).every(k => (
            typeof parsedObj[k] === "object"
            && setContains(new Set(Object.keys(parsedObj[k])), ["description", "position"])
        ))
    );

    if(!_objMatchesExpectedSchema) {
        console.log("dataObjAsInitText = ", dataObjInJsCode);
        console.log("_obj = ", parsedObj);
        for(const k of Object.keys(parsedObj)) {
            if(!(
                typeof parsedObj[k] === "object"
                && setContains(new Set(Object.keys(parsedObj[k])), ["description", "position"])
            )) {
                console.log(k)
            }
        }
        throw new Error("unexpected loose json parse result, did not match expected schema");
    }

    const fnWriteStabilizingGatesBackToFile = (/** @type {{ [tsDataStabilizingGateKey: string]: ExistingStabilizingGateDataType }} */ mergedGateTSData) => {
        const dataObjAsJsCode = looseJsonStringify(
            filterDataObjBeforeExport(PATH_TO_STABILIZING_GATES_DATA_FILE, mergedGateTSData),
            "    ",
            _jsonStringifyTransformerFns
        );
        
        const newFileText = fileTextPrefix + dataObjAsJsCode + fileTextPostfix;

        writeFileSync(PATH_TO_STABILIZING_GATES_DATA_FILE, newFileText);
    };

    return {
        fnWriteStabilizingGatesBackToFile,
        /** @type {{ [tsDataStabilizingGateKey: string]: ExistingStabilizingGateDataType }} */
        existingStabilizingGateTSDataByGateKey: parsedObj
    }
}

/** @typedef {{ internalId: string, type: "door" | "receptacle", doorId?: string, receptacleIds?: string[], name: string, plort: string, image: string, description: string, unlocks: string, pos: { x: number, y: number }, dimension: MapType, [other]?: any }} ExistingPuzzleDoorDataType */

function readExistingPuzzleDoorTSData(/** @type {CacheOpts} */ cacheOpts) {
    
    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    const fileText = readFileSync(PATH_TO_PUZZLE_DOORS_DATA_FILE, { encoding: "utf-8" });

    const [ , fileTextPrefix, dataObjInJsCode, fileTextPostfix ] = /^(.*const\s+locked_doors.*?=\s*)({\s*(?:"?[a-zA-Z0-9_]+"?\s*:\s*(?:.*)\s*,?\s*)*})(;?.*)$/s.exec(fileText);

    const parsedObj = looseJsonParseWithEval(dataObjInJsCode);

    const _objMatchesExpectedSchema = (
        typeof parsedObj === "object"
        && Object.keys(parsedObj).every(k => (
            typeof parsedObj[k] === "object"
            && setContains(new Set(Object.keys(parsedObj[k])), ["name", "plort", "image", "pos", "description", "unlocks", "dimension"])
        ))
    );

    if(!_objMatchesExpectedSchema) {
        console.log("dataObjAsInitText = ", dataObjInJsCode);
        console.log("_obj = ", parsedObj);
        for(const k of Object.keys(parsedObj)) {
            if(!(
                typeof parsedObj[k] === "object"
                && setContains(new Set(Object.keys(parsedObj[k])), ["name", "plort", "image", "pos", "description", "unlocks", "dimension"])
            )) {
                console.log(k)
            }
        }
        throw new Error("unexpected loose json parse result, did not match expected schema");
    }

    const fnWritePuzzleDoorsBackToFile = (/** @type {{ [tsDataPuzzleDoorKey: string]: ExistingPuzzleDoorDataType }} */ mergedPuzzleDoorTSData) => {
        const dataObjAsJsCode = looseJsonStringify(
            filterDataObjBeforeExport(PATH_TO_PUZZLE_DOORS_DATA_FILE, mergedPuzzleDoorTSData),
            "    ",
            {
                ..._jsonStringifyTransformerFns,
                shouldSortKeys: (key, depth, keys, obj) => {
                    if(depth === 0) {
                        let _origSortFn = _jsonStringifyTransformerFns.shouldSortKeys(key, depth, keys, obj);
                        let applyOrigSortFn = (a,b) => {
                            if(typeof _origSortFn === "function") return _origSortFn(a,b);
                            // if(typeof _origSortFn === "undefined") return undefined;
                            return sortStringsWithNumbers(a,b);
                        };
                        return (a, b) => {
                            // console.log(key,depth,keys,obj,'|',a,b); return undefined;
                            // prefer to sort by related puzzle door, otherwise use any previously defined sort function
                            const aObj = obj[a];
                            const bObj = obj[b];
                            const aInternalId = obj[a].internalId;
                            const bInternalId = obj[b].internalId;
                            
                            // put locked door entries without associated door ids after those with.
                            if(!aInternalId && !bInternalId) return applyOrigSortFn(a, b);
                            if(!aInternalId) return 1;
                            if(!bInternalId) return -1;

                            const aIsDoor = /^puzzlelock[0-9]/.test(aInternalId);
                            const bIsDoor = /^puzzlelock[0-9]/.test(bInternalId);
                            const aDoorId = aIsDoor ? aInternalId : aObj.doorId;
                            const bDoorId = bIsDoor ? bInternalId : bObj.doorId;

                            // if they're not part of the same door grouping, sort the locked door entries by their (different) door ids.
                            if(aDoorId !== bDoorId) return sortStringsWithNumbers(aDoorId, bDoorId);
                            
                            if(aIsDoor && bIsDoor) throw new Error(`How was there two entries that were both doors and were the same door? (a = ${JSON.stringify(a)} , b = (${JSON.stringify(b)})`);
                            // put the door entry before its receptacle entries
                            if(aIsDoor) return -1;
                            if(bIsDoor) return 1;
                            // sort receptacles by their object keys as usual.
                            return applyOrigSortFn(a, b);
                        };
                    }
                    return _jsonStringifyTransformerFns.shouldSortKeys(key, depth, keys, obj);
                }
            }
        );
        
        const newFileText = fileTextPrefix + dataObjAsJsCode + fileTextPostfix;

        writeFileSync(PATH_TO_PUZZLE_DOORS_DATA_FILE, newFileText);
    };

    return {
        fnWritePuzzleDoorsBackToFile,
        /** @type {{ [tsDataPuzzleDoorKey: string]: ExistingPuzzleDoorDataType }} */
        existingPuzzleDoorTSDataByDoorKey: parsedObj
    }
}

/** @typedef {{ internalId?: string, internalName?: string, name: string, food: string, image: string, drops: string[], unlocks: string[], description: string, pos: { x: number, y: number }, dimension: MapType, [other]?: any }} ExistingGordoDataType */

function readExistingGordoTSData(/** @type {CacheOpts} */ cacheOpts) {
    
    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    const fileText = readFileSync(PATH_TO_GORDOS_DATA_FILE, { encoding: "utf-8" });

    const [ , fileTextPrefix, dataObjInJsCode, fileTextPostfix ] = /^(.*const\s+gordos.*?=\s*)({\s*(?:"?[a-zA-Z0-9_]+"?\s*:\s*(?:.*)\s*,?\s*)*})(;?.*)$/s.exec(fileText);

    const parsedObj = looseJsonParseWithEval(dataObjInJsCode);

    const _objMatchesExpectedSchema = (
        typeof parsedObj === "object"
        && Object.keys(parsedObj).every(k => (
            typeof parsedObj[k] === "object"
            && setContains(new Set(Object.keys(parsedObj[k])), ["name", "food", "pos", "image", "drops", "description", "unlocks", "dimension"])
        ))
    );

    if(!_objMatchesExpectedSchema) {
        console.log("dataObjAsInitText = ", dataObjInJsCode);
        console.log("_obj = ", parsedObj);
        for(const k of Object.keys(parsedObj)) {
            if(!(
                typeof parsedObj[k] === "object"
                && setContains(new Set(Object.keys(parsedObj[k])), ["name", "food", "pos", "image", "drops", "description", "unlocks", "dimension"])
            )) {
                console.log(k)
            }
        }
        throw new Error("unexpected loose json parse result, did not match expected schema");
    }

    const fnWriteGordosBackToFile = (/** @type {{ [tsDataGordoKey: string]: ExistingGordoDataType }} */ mergedGordoTSData) => {
        const dataObjAsJsCode = looseJsonStringify(
            filterDataObjBeforeExport(PATH_TO_GORDOS_DATA_FILE, mergedGordoTSData),
            "    ",
            {..._jsonStringifyTransformerFns,
                shouldSortKeys: (key, depth, keysChain, obj) => {
                    if(depth === 0) return (a, b) => {
                        const areaA = /^[a-z]+(?:gordo)?_([a-z]+)_/.exec(a)?.[1] || "";
                        const areaB = /^[a-z]+(?:gordo)?_([a-z]+)_/.exec(b)?.[1] || "";
                        if(areaA !== areaB) return areaA < areaB ? -1 : 1;
                        return sortStringsWithNumbers(a, b);
                    };
                }
            }
            // _jsonStringifyTransformerFns
        );
        
        const newFileText = fileTextPrefix + dataObjAsJsCode + fileTextPostfix;

        writeFileSync(PATH_TO_GORDOS_DATA_FILE, newFileText);
    };

    return {
        fnWriteGordosBackToFile,
        /** @type {{ [tsDataGordoKey: string]: ExistingGordoDataType }} */
        existingGordoTSDataByDroneKey: parsedObj
    }
}

/** @typedef {{ internalId?: string, internalName?: string, description: string, pos: { x: number, y: number }, dimension: MapType, [other]?: any }} ExistingDroneDataType */

function readExistingResearchDroneTSData(/** @type {CacheOpts} */ cacheOpts) {
    
    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    const fileText = readFileSync(PATH_TO_RESEARCH_DRONES_DATA_FILE, { encoding: "utf-8" });

    const [ , fileTextPrefix, dataObjInJsCode, fileTextPostfix ] = /^(.*research_drones.*?=\s*)({\s*(?:"?[a-zA-Z0-9_]+"?\s*:\s*(?:.*)\s*,?\s*)*})(;?.*)$/s.exec(fileText);

    const parsedObj = looseJsonParseWithEval(dataObjInJsCode);

    const _objMatchesExpectedSchema = (
        typeof parsedObj === "object"
        && Object.keys(parsedObj).every(k => (
            typeof parsedObj[k] === "object"
            && setContains(new Set(Object.keys(parsedObj[k])), ["name", "pos", "log", "description", "dimension"])
        ))
    );

    if(!_objMatchesExpectedSchema) {
        console.log("dataObjAsInitText = ", dataObjInJsCode);
        console.log("_obj = ", parsedObj);
        for(const k of Object.keys(parsedObj)) {
            if(!(
                typeof parsedObj[k] === "object"
                && setContains(new Set(Object.keys(parsedObj[k])), ["name", "pos", "log", "archive", "description", "dimension"])
            )) {
                console.log(k)
            }
        }
        throw new Error("unexpected loose json parse result, did not match expected schema");
    }

    // const _jsonStringifyTransformerFns = {
    //     transformer: (obj, key, keys) => {
    //         if(obj === MapType.overworld) return { raw: true, val: "MapType.overworld" };
    //         if(obj === MapType.labyrinth) return { raw: true, val: "MapType.labyrinth" };
    //         if(obj === MapType.sr1) return { raw: true, val: "MapType.sr1" };
    //     },
    //     shouldQuoteKey: (key, depth, keysChain) => depth === 0 ? true : null,
    //     shouldInlineObj: (key, depth, keysChain, obj) => {
    //         // if(depth === 1) return true;// return (Array.isArray(obj) && obj.length <= 1) || key === "pos";
    //         // if(key === "pos" || (Array.isArray(obj) && obj.length <= 1)) return false;
    //         // return null;
    //         return (
    //             (typeof obj === "object" && arraysEqual(Object.keys(obj).sort(), ["x", "y"]))
    //             || (Array.isArray(obj) && obj.length <= 1)
    //         ) ? false : null;
    //     },
    //     shouldSortKeys: (key, depth, keysChain, obj) => {
    //         if(depth === 0) return sortStringsWithNumbers;
    //         if(depth === 1) {
    //             const _lookup = Object.fromEntries(["internalId", "name", "log", "archive", "pos", "position", "description", "dimension"].map((v, i) => [v, i]));
    //             const _default = Object.keys(_lookup).length;
    //             return (a, b) => ((_lookup[a] ?? _default) - (_lookup[b] ?? _default));
    //         }
    //         if(keysChain.length >= 2 && (keysChain[keysChain.length - 2] === "log" || keysChain[keysChain.length - 2] === "archive")) {
    //             // put "en" lang as first item, order all other lang keys lexographically
    //             return (a, b) => {
    //                 a = a.toLowerCase(); b = b.toLowerCase();
    //                 return a === b ? 0 : a === "en" ? -1 : b === "en" ? 1 : a < b ? -1 : a > b ? 1 : 0;
    //             };
    //         }
    //     }
    // };

    const fnWriteDronesBackToFile = (/** @type {{ [tsDataDroneKey: string]: ExistingDroneDataType }} */ mergedDroneTSData) => {
        const dataObjAsJsCode = looseJsonStringify(
            filterDataObjBeforeExport(PATH_TO_RESEARCH_DRONES_DATA_FILE, mergedDroneTSData),
            "    ",
            _jsonStringifyTransformerFns
        );
        
        const newFileText = fileTextPrefix + dataObjAsJsCode + fileTextPostfix;

        writeFileSync(PATH_TO_RESEARCH_DRONES_DATA_FILE, newFileText);
    };

    return {
        fnWriteDronesBackToFile,
        /** @type {{ [tsDataDroneKey: string]: ExistingDroneDataType }} */
        existingDroneTSDataByDroneKey: parsedObj
    }
}

/** @typedef {{ unlocks: string[], internalId?: string, internalName?: string, description: string, position: { x: number, y: number }, amount_required: number, _otherLines?: string[] }} ExistingShDepoDataType */

function readExistingShadowPlortDepoTSData(/** @type {CacheOpts} */ cacheOpts) {
    
    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    /** @type {{ [tsDataDepoKey: string]: ExistingShDepoDataType }} */
    const existingShDepoTSDataByDepoKey = { };

    // const groupCommentLineRegex = /^ *\/\/ *(the conservatory|rainbow fields|ember valley|starlight strand|powderfall bluffs) *$/i;
    const endFileDataLineRegex = /^};? *$/;

    const dataStartLineRegex = /^ *([a-zA-Z0-9_]+|".+") *: *{ *$/;
    // const dataParamLineRegex = /^ *([a-zA-Z_][a-zA-Z_0-9]*) *: *(?:(\[ *(?:"(?:[^\\"]|\\.)*",? *)+\])|("(?:[^\\"]|\\.)*")|({ *(?:(?:x|y) *: *(?:[\-+]?(?:\.?[0-9]+|[0-9]+\.[0-9]*)),? *)+})|([\-+]?(?:\.?[0-9]+|[0-9]+\.[0-9]*))|(undefined)),? *$/;
    const dataParamLineRegex = /^ *([a-zA-Z_][a-zA-Z_0-9]*) *: *(?:(\[ *(?:"(?:[^\\"]|\\.)*",? *)+\])|("(?:[^\\"]|\\.)*")|({ *(?:(?:x|y) *: *(?:[\-+]?(?:\.?[0-9]+|[0-9]+\.[0-9]*)),? *)+})|([\-+]?(?:\.?[0-9]+|[0-9]+\.[0-9]*))|(undefined)|(MapType.[a-zA-Z_][a-zA-Z_0-9]*)),? *$/;
    // const dataParamLineRegex = /^ *([a-zA-Z_][a-zA-Z_0-9]*) *: *(?:(\[ *(?:(?:"(?:[^\\"]|\\.)*"|`(?:[^\\`]|\\.)*`),? *)+\])|("(?:[^\\"]|\\.)*")|({ *(?:(?:x|y) *: *(?:[\-+]?(?:\.?[0-9]+|[0-9]+\.[0-9]*)),? *)+})|([\-+]?(?:\.?[0-9]+|[0-9]+\.[0-9]*))|(undefined)|(MapType.[a-zA-Z_][a-zA-Z_0-9]*)),? *$/;
    const dataEndLineRegex = /^ +},? *$/;

    const linesForReconstruction = [];

    const fileLines = readFileSync(PATH_TO_SHADOW_DEPOS_DATA_FILE, { encoding: "utf-8" }).split(/[\r\n]+/);

    // console.log(fileLines);

    // let curGroup = null;

    let dataObj, dataObjDepoKey;

    for(const line of fileLines) {
        
        let dataStartExecRes = dataStartLineRegex.exec(line);

        // don't push lines inside a denoted group; these lines will be regenerated upon reconstruction
        // instead, parse them
        let dataParamExecRes = dataParamLineRegex.exec(line);

        if(dataStartExecRes) {
            let key = dataStartExecRes[1];
            dataObjDepoKey = JSON.parse(key);
            dataObj = { };
        }
        else if(dataEndLineRegex.test(line)) {
            existingShDepoTSDataByDepoKey[dataObjDepoKey] = dataObj;
        }
        else if(dataParamExecRes) {
            const [ , key, list, str, xyobj, num, undef, mapTypeEnumVal ] = dataParamExecRes;
            if(key === "description" || key === "internalName" || key === "internalId") {
                dataObj[key] = undef ? undefined : JSON.parse(str);
            }
            else if(key === "unlocks") {
                dataObj[key] = JSON.parse(list);
            }
            else if(key === "position") {
                dataObj[key] = JSON.parse(xyobj.replace("x", "\"x\"").replace("y", "\"y\""));
            }
            else if(key === "amount_required") {
                dataObj[key] = parseFloat(num);
                // console.log('debug: dataObj:', dataObj);
            }
            else if(undef) {
                dataObj[key] = undefined;
            }
            else {
                // console.warn(`WARNING: DISCARDING parameter line ${JSON.stringify(line)}; unexpected data key (${JSON.stringify(key)}) and/or value.`);
                dataObj._otherLines ||= [];
                dataObj._otherLines.push(line);
            }
        }
        else {
            linesForReconstruction.push(line);
        }

    }
    
    // console.log(linesForReconstruction);

    const fnWriteShDeposBackToFile = (/** @type {{ [tsDataDepoKey: string]: { internalName: string, internalId: string, unlocks: string[], description: string, position: { x: number, y: number }, amount_required: number, _otherLines?: string[] } }} */ mergedShDepoTSData) => {
        const reconstructedLines = [];

        // console.log(mergedShDepoTSData);

        // shallow copy for mutation purposes
        mergedShDepoTSData = { ...mergedShDepoTSData };

        const _processDepoDataObj = (
            /** @type {string} */ tsDataDepoKey,
            /** @type {mergedShDepoTSData[keyof mergedShDepoTSData]} */ tsDepoData
        ) => {
            // remove entry from depo data to insert now that it's processed
            delete mergedShDepoTSData[tsDataDepoKey];

            // console.log("processing shadow depo data");
            // console.log(tsDataDepoKey);
            // console.log(tsDepoData);
            const { internalId, internalName, unlocks, description, position, amount_required, _otherLines } = tsDepoData;
            reconstructedLines.push(
                `    "${tsDataDepoKey}": {`
            + `\n        internalId: ${JSON.stringify(internalId)},`
            + (!internalName ? "" : `\n        internalName: ${JSON.stringify(internalName)},`)
            + `\n        position: { x: ${position.x.toFixed(4)/*.replace(/0+$/,"")*/}, y: ${position.y.toFixed(4)/*.replace(/0+$/,"")*/} },`
            + `\n        description: ${JSON.stringify(description)},`
            + `\n        unlocks: [${unlocks.map(JSON.stringify).join(", ")}],`
            + `\n        amount_required: ${amount_required},`
            + (typeof _otherLines === "undefined"
                ? ""
                : _otherLines.map(l => "\n        " + l.trimStart()).join(""))
            + "\n    },"
            );
        }
        
        let reconstructionIndex = 0;

        while(reconstructionIndex < linesForReconstruction.length) {            
            const line = linesForReconstruction[reconstructionIndex];
            if(endFileDataLineRegex.test(line))
                // we will resume inserting the remaining lines after processing any remaining data objects
                break;
            reconstructionIndex++;
            reconstructedLines.push(line);
        }

        // process shadow depo data objects
        for (const tsDataDepoKey of Object.keys(mergedShDepoTSData).sort(sortStringsWithNumbers)) {
            const tsPodData = mergedShDepoTSData[tsDataDepoKey];
            _processDepoDataObj(tsDataDepoKey, tsPodData);
        }

        // finish any remaining lines in the file
        while(reconstructionIndex < linesForReconstruction.length) {
            const line = linesForReconstruction[reconstructionIndex];
            reconstructionIndex++;
            reconstructedLines.push(line);
        }

        writeFileSync(PATH_TO_SHADOW_DEPOS_DATA_FILE, reconstructedLines.join("\n"));
    }

    return {
        fnWriteShDeposBackToFile,
        existingShDepoTSDataByDepoKey
    }
}

/** @typedef {import("../../../src/types.js").TreasurePod} ExistingTreasurePodDataType */

/** @type {ReturnType<typeof makeTSDataFileParserFn<ExistingTreasurePodDataType>>} */
const readExistingTreasurePodTSData = makeTSDataFileParserFn(
    PATH_TO_TREASURE_PODS_DATA_FILE,
    "treasure_pods",
    schemautils.objectAnyKey({
        schematype: "object",
        subschema: {
            "internalId": "string",
            "contents": schemautils.array("string"),
            "description": "string",
            "pos": _schema_Vec2,
            "dimension": _schema_MapType
        }
    })
);


/** old (ours) to internal @type {{ [oldId: string]: string }} */
let _mapNodeIdMap = null;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mapNodeIdInternalToOld(/** @type {string} */ internalId) {
    if(_mapNodeIdMap === null) {
        _mapNodeIdMap = JSON.parse(readFileSync("./id_mappings/mapNodeIdMap.json"));
    }
    return Object.entries(_mapNodeIdMap).find(([, v]) => v === internalId)?.[0];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mapNodeIdOldToInternal(/** @type {string} */ oldId) {
    if(_mapNodeIdMap === null) {
        _mapNodeIdMap = JSON.parse(readFileSync("./id_mappings/mapNodeIdMap.json"));
    }
    return _mapNodeIdMap[oldId];
}


/** old (ours) to internal @type {{ [oldId: string]: string }} */
let _stabilizingGateIdMap = null;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function stabilizingGateIdInternalToOld(/** @type {string} */ internalId) {
    if(_stabilizingGateIdMap === null) {
        _stabilizingGateIdMap = JSON.parse(readFileSync("./id_mappings/stabilizingGateIdMap.json"));
    }
    return Object.entries(_stabilizingGateIdMap).find(([, v]) => v === internalId)?.[0];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function stabilizingGateIdOldToInternal(/** @type {string} */ oldId) {
    if(_stabilizingGateIdMap === null) {
        _stabilizingGateIdMap = JSON.parse(readFileSync("./id_mappings/stabilizingGateIdMap.json"));
    }
    return _stabilizingGateIdMap[oldId];
}


/** old (ours) to internal @type {{ [oldId: string]: string }} */
let _puzzleDoorIdMap = null;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function puzzleDoorIdInternalToOld(/** @type {string} */ internalId) {
    if(_puzzleDoorIdMap === null) {
        _puzzleDoorIdMap = JSON.parse(readFileSync("./id_mappings/puzzleDoorIdMap.json"));
    }
    return Object.entries(_puzzleDoorIdMap).find(([, v]) => v === internalId)?.[0];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function puzzleDoorIdOldToInternal(/** @type {string} */ oldId) {
    if(_puzzleDoorIdMap === null) {
        _puzzleDoorIdMap = JSON.parse(readFileSync("./id_mappings/puzzleDoorIdMap.json"));
    }
    return _puzzleDoorIdMap[oldId];
}


/** old (ours) to internal @type {{ [oldId: string]: string }} */
let _gordoIdMap = null;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function gordoIdInternalToOld(/** @type {string} */ internalId) {
    if(_gordoIdMap === null) {
        _gordoIdMap = JSON.parse(readFileSync("./id_mappings/gordoIdMap.json"));
    }
    return Object.entries(_gordoIdMap).find(([, v]) => v === internalId)?.[0];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function gordoIdOldToInternal(/** @type {string} */ oldId) {
    if(_gordoIdMap === null) {
        _gordoIdMap = JSON.parse(readFileSync("./id_mappings/gordoIdMap.json"));
    }
    return _gordoIdMap[oldId];
}


/** old (ours) to internal @type {{ [oldId: string]: string }} */
let _droneIdMap = null;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function droneIdInternalToOld(/** @type {string} */ internalId) {
    if(_droneIdMap === null) {
        _droneIdMap = JSON.parse(readFileSync("./id_mappings/researchDroneIdMap.json"));
    }
    return Object.entries(_droneIdMap).find(([, v]) => v === internalId)?.[0];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function droneIdOldToInternal(/** @type {string} */ oldId) {
    if(_droneIdMap === null) {
        _droneIdMap = JSON.parse(readFileSync("./id_mappings/researchDroneIdMap.json"));
    }
    return _droneIdMap[oldId];
}


/** old (ours) to internal @type {{ [oldId: string]: string }} */
let _podIdMap = null;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function podIdInternalToOld(/** @type {string} */ internalId) {
    if(_podIdMap === null) {
        _podIdMap = JSON.parse(readFileSync("./id_mappings/podIdMap.json"));
    }
    return Object.entries(_podIdMap).find(([, v]) => v === internalId)?.[0];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function podIdOldToInternal(/** @type {string} */ oldId) {
    if(_podIdMap === null) {
        _podIdMap = JSON.parse(readFileSync("./id_mappings/podIdMap.json"));
    }
    return _podIdMap[oldId];
}


/** internal to old (ours) @type {{ [internalId: string]: string }} */
let _shadowDepoIdMap = null;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function shadowDepoIdInternalToOld(/** @type {string} */ internalId) {
    if(_shadowDepoIdMap === null) {
        _shadowDepoIdMap = JSON.parse(readFileSync("./id_mappings/shadowDepoIdMap.json"));
    }
    return _shadowDepoIdMap[internalId];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function shadowDepoIdOldToInternal(/** @type {string} */ oldId) {
    if(_shadowDepoIdMap === null) {
        _shadowDepoIdMap = JSON.parse(readFileSync("./id_mappings/shadowDepoIdMap.json"));
    }
    return Object.entries(_shadowDepoIdMap).find(([, v]) => v === internalId)?.[0];
}


let _podIdGroups = null;

function podGroupOfPodId(/** @type {string} */ podId, /** @type {CacheOpts} */ cacheOpts) {
    
    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    if(!_podIdGroups && cacheOpts.useCache) {
        try {
            console.log("Reading cached treasure pod groups...");
            _podIdGroups = JSON.parse(readFileSync("./data_cache/podIdGroups.json"));
        } catch(e) {
            console.log("Failed to read cached treasure pod groups. Extracting anew.");
        }
    }
    if (!_podIdGroups) {
        _podIdGroups = extractPodIdGroupsToCache(cacheOpts);
    }

    return Object.entries(_podIdGroups).find(([/*group*/, podIds]) => podIds.includes(podId))?.[0];
}

let _l10nTables = { };
/**
 * Retrieves translations for a given drone page translation key across different languages.
 * @overload
 * @param {string} translationKeyId - The key ID to look up translations for
 * @param {CacheOpts} cacheOpts - Options for caching behavior
 * @returns {{ [lang: string]: string[] }} Object mapping language codes to processed drone page translations
 */
function dronePageTranslationsFor(translationKeyId, cacheOpts) {
    return l10nTranslationsFor("ResearchDrone", translationKeyId, cacheOpts, translation => translation.split(/\n{2,}/));
}

/**
 * Retrieves translations of a string for a given translation key across different languages.
 * @overload
 * @param {keyof L10N_TABLES_GLOBS} l10nCacheId - The localization file(s) key to retrieve file globs by
 * @param {string} translationKeyId - The key ID to look up translations for
 * @param {CacheOpts} cacheOpts - Options for caching behavior
 * @returns {{ [lang: string]: string }} Object mapping language codes to raw translations
 *//**
 * Retrieves translations for a given translation key across different languages. Transforms the translated string using the passed _processTrFn parameter.
 * @template T The return type of the translation processing function
 * @overload
 * @param {keyof L10N_TABLES_GLOBS} l10nCacheId - The localization file(s) key to retrieve file globs by
 * @param {string} translationKeyId - The key ID to look up translations for
 * @param {CacheOpts} cacheOpts - Options for caching behavior
 * @param {(translation: string) => T} processTrFn - Optional function to process each translation string
 * @returns {{ [lang: string]: T }} Object mapping language codes to processed translations
 */
/*
 * Retrieves translations for a given translation key across different languages.
 * @template T The return type of the translation processing function
 * @overload
 * @param {keyof L10N_TABLES_GLOBS} l10nCacheId - The localization file(s) key to retrieve file globs by
 * @param {string} translationKeyId - The key ID to look up translations for
 * @param {CacheOpts} cacheOpts - Options for caching behavior
 * @param {(translation: string) => T} [processTrFn] - Optional function to process each translation string
 * @returns {{ [lang: string]: string | T }} Object mapping language codes to either raw translations or processed translations
 */
function l10nTranslationsFor(l10nCacheId, translationKeyId, cacheOpts, processTrFn) {
    cacheOpts = { ...defaultCacheSettings, ...cacheOpts };
    if(!_l10nTables[l10nCacheId] && cacheOpts.useCache) {
    // if(false) { // for debugging testing
        try {
            console.log(`Reading cached ${l10nCacheId} localization tables...`);
            _l10nTables[l10nCacheId] = JSON.parse(readFileSync(`./data_cache/${l10nCacheId}L10nData.json`));
        } catch(e) {
            console.log(`Failed to read cached ${l10nCacheId} localization tables. Extracting anew.`);
        }
    }
    if (!_l10nTables[l10nCacheId]) {
        _l10nTables[l10nCacheId] = extractL10nTablesToCache(cacheOpts, l10nCacheId);
    }

    /** @type {{ [lang: string]: string | T }} */
    let result = { };
    for (const lang of Object.keys(_l10nTables[l10nCacheId])) {
        const tbl = _l10nTables[l10nCacheId][lang];
        const translation = tbl[translationKeyId];
        if(!translation) continue;
        result[lang] = (processTrFn ? processTrFn(translation) : translation);
    }
    
    return result;
}

export async function extractScenesToAssetsJSON(/** @type {CacheOpts} */ cacheOpts) {
    
    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    /** @type {AssetsMappingType} */
    const assetsMapping = { };

    const globParam = GLOBS_TO_INTERESTING_SCENES;

    console.log("Extracting scenes to Cache JSON...");
    console.log(`  extracting from glob(s) ${globParam}`)

    console.group("[Scenes->Cache]:");

    // for await (const sceneFile of fs.glob(glob)) {

    const g = new Glob(globParam, {  });

    // for await (const sceneFile of g) {
    await Promise.all(Array.from(g).map(async sceneFile => {

        console.log(`Processing scene ${sceneFile}`);

        parseUnityFileYamlIntoAssetsMapping(sceneFile, assetsMapping, n => /^(MonoBehaviou?r|GameObject|(?:Rect)?Transform)$/i.test(n));

    // }
    }));

    if(cacheOpts.exportToCache) {
        const _export = () => {
            // fs.writeFile('./data_cache/assetsFileIdMapping.json', JSON.stringify(assetsMapping));
            dumpMassiveHeckinBigObjectToJSON("./data_cache/assetsFileIdMapping.json", assetsMapping, 50_000_000);
            console.log("Exported assets JSON to cache.");
        };
        if(cacheOpts.exportToCache === "sync") {
            console.log("Exporting assets JSON to cache...")
            _export();
        }
        else (async () => { _export(); })();
    }

    console.groupEnd();

    console.log(`Finished extracting scenes to cache JSON. Found ${Object.keys(assetsMapping).length} assets.`);

    return assetsMapping;

}

function extractPodIdGroupsToCache(/** @type {CacheOpts} */ cacheOpts) {
    
    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    /** @type {{ [areaGroupName: string]: string[] }} */
    let podIdGroups = { };

    const globParam = GLOBS_TO_POD_COUNTER_LIST_ASSETS;

    const g = new Glob(globParam, {  });

    for(const podCounterFile of g) {
        /** @type {AssetsMappingType} */
        const assetsMapping = { };
        parseUnityFileYamlIntoAssetsMapping(podCounterFile, assetsMapping);

        assert(Object.keys(assetsMapping).length === 1);

        const assetJSON = Object.values(assetsMapping)[0];

        const podIdsList = assetJSON.props["_treasurePodIDs"];

        const groupName = /^(.*)MapPodCounter.asset$/.exec(basename(podCounterFile))[1];

        assert(groupName);

        podIdGroups[groupName] = podIdsList;
    }

    if(cacheOpts.exportToCache) {
        const _export = () => {
            writeFileSync("./data_cache/podIdGroups.json", JSON.stringify(podIdGroups));
            console.log("Exported pod groups to cache.");
        };
        if(cacheOpts.exportToCache === "sync") {
            console.log("Exporting pod groups to cache...");
            _export();
        }
        else (async () => { _export(); })();
    }

    return podIdGroups;
}

// function extractDroneL10nTablesToCache(/** @type {CacheOpts} */ cacheOpts) {
//     return extractL10nTablesToCache(cacheOpts, "ResearchDrone");
//     // /** @type {{ [lang: string]: { [translationKeyId: string | number]: string }}} */
//     // let droneL10nData = { };

//     // const files = globSync(GLOBS_TO_DRONE_LOCALIZATION_TABLES);

//     // for(const l10nFile of files) {
//     //     /** @type {AssetsMappingType} */
//     //     const assetsMapping = { };
//     //     parseUnityFileYamlIntoAssetsMapping(l10nFile, assetsMapping, undefined, (/** @type {string} */ fileData) => {
//     //         // Because yaml library tries to parse the key id as number and loses precision. Surround it in quotes.
//     //         return fileData.replaceAll(/(-\s+m_Id:\s+)(\d+)(\s)/g, "$1\"$2\"$3");
//     //     });

//     //     if(Object.keys(assetsMapping).length !== 1) {
//     //         throw new Error("Expected only one asset to be in the drone asset file");
//     //     }

//     //     assert(Object.keys(assetsMapping).length === 1);

//     //     const assetJSON = Object.values(assetsMapping)[0];

//     //     // const podIdsList = assetJSON.props["_treasurePodIDs"];

//     //     const mapping = Object.fromEntries(assetJSON.props["m_TableData"].map(({ m_Id, m_Localized, m_Metadata }) => {
//     //         if(m_Metadata["m_Items"]["Array"] && m_Metadata["m_Items"]["Array"].length > 0) {
//     //             console.warn(`Was not expecting any m_Metadata["m_Items"]["Array"]! Found ${JSON.stringify(m_Metadata["m_Items"]["Array"])}`);
//     //         }
//     //         return [m_Id, m_Localized];
//     //     }));

//     //     const lang = /^ResearchDrone_(en|es|de|fr|ja|ko|pt|ru|zh).asset$/.exec(basename(l10nFile))[1];

//     //     if(!lang) throw new Error(`Unexpected lang value ${lang}`);

//     //     droneL10nData[lang] = mapping;
//     // }

//     // if(cacheOpts.exportToCache) {
//     //     const _export = () => {
//     //         writeFileSync("./data_cache/droneL10nData.json", JSON.stringify(droneL10nData));
//     //         console.log("Exported drone localization tables to cache.");
//     //     };
//     //     if(cacheOpts.exportToCache === "sync") {
//     //         console.log("Exporting drone localization tables to cache...");
//     //         _export();
//     //     }
//     //     else (async () => { _export(); })();
//     // }

//     // return droneL10nData;
// }

// function extractCommL10nTablesToCache(/** @type {CacheOpts} */ cacheOpts) {
//     return extractL10nTablesToCache(cacheOpts, "CommStation");
// }

/**
 * @template {Record<string, Record<string, any>>} T
 * @param {string} targetFilePath
 * @param {T} dataObj
 * @returns {T}
*/
function filterDataObjBeforeExport(targetFilePath, dataObj) {
    dataObj = {...dataObj};
    for(const key of Object.keys(dataObj)) {
        const filtered = entryExportFilter(targetFilePath, key, dataObj[key]);
        
        if(filtered === true) {
            continue;
        }
        else if(filtered === false) {
            delete dataObj[key];
            continue;
        }
        else {
            dataObj[key] = filtered;
            continue;
        }
    }
    return dataObj;
}

function manufactureNullifierDoorIdFromAssets(/** @type {AssetJSONType} */ assetJSON, /** @type {AssetJSONType} */ doorGameObjJSON, /** @type {{ x: number, y: number, z: number }} */ ingamePos) {
    // return assetJSON.props["_id"];
    // return assetJSON.fileKey + '&' + assetJSON.fileId;
    // prefer using position, probably the most likely attribute(s) to persist across updates. file names and fileIds are probably volatile.
    return `x${-Math.floor(ingamePos.z)}_y${Math.floor(ingamePos.x)}`;
}
function manufactureGigiHologramIdFromAssets(/** @type {AssetJSONType} */ assetJSON, /** @type {AssetJSONType} */ gigiGameObjJSON, /** @type {{ x: number, y: number, z: number }} */ ingamePos) {
    // prefer using position, probably the most likely attribute(s) to persist across updates. file names and fileIds are probably volatile.
    return `x${-Math.floor(ingamePos.z)}_y${Math.floor(ingamePos.x)}`;
}
function manufactureMapNodeIdFromAssets(/** @type {AssetJSONType} */ assetJSON, /** @type {AssetJSONType} */ mapnodeGameObjJSON, /** @type {{ x: number, y: number, z: number }} */ ingamePos) {
    // prefer using position, probably the most likely attribute(s) to persist across updates. file names and fileIds are probably volatile.
    return `x${-Math.floor(ingamePos.z)}_y${Math.floor(ingamePos.x)}`;
}
function manufactureProjectorPuzzleIdFromAssets(/** @type {AssetJSONType} */ assetJSON, /** @type {AssetJSONType} */ puzzleGameObjJSON, /** @type {{ x: number, y: number, z: number }} */ ingamePos, /** @type {"start" | "end"} */ beamPointType) {
    // prefer using position, probably the most likely attribute(s) to persist across updates. file names and fileIds are probably volatile.
    return `${beamPointType}Point_x${-Math.floor(ingamePos.z)}_y${Math.floor(ingamePos.x)}_h${Math.floor(ingamePos.y)}`;
}
function manufactureTeleporterPadIdFromAssets(/** @type {AssetJSONType} */ assetJSON, /** @type {{ x: number, y: number, z: number }} */ ingamePos) {
    // prefer using position, probably the most likely attribute(s) to persist across updates. file names and fileIds are probably volatile.
    return `x${-Math.floor(ingamePos.z)}_y${Math.floor(ingamePos.x)}`;
}

function processManualGigiConversations(/** @type {CacheOpts} */ cacheOpts) {
    cacheOpts = { ...defaultCacheSettings, ...cacheOpts };

    /** @type {{ [hologramId: string]: import("../../../src/types.js").GigiHologram["dialogue"] }} */
    const processedDialogues = {};

    const keysToProcessQueue = Object.keys(gigi_manually_noted_conversations);
    let prevKeysToProcessCt = -1;

    // while still processing keys from the queue
    keyProcessingLoop:
    while (prevKeysToProcessCt !== keysToProcessQueue.length) {
        prevKeysToProcessCt = keysToProcessQueue.length;
        if(keysToProcessQueue.length <= 0) break;

        /** @type {string} */
        const originalHologramId = keysToProcessQueue.pop();
        /** @type {string} */
        let hologramId = originalHologramId;
        
        let hologramConvo = gigi_manually_noted_conversations[hologramId];
        
        if("convoReference" in hologramConvo) {
            // try to resolve convoReference chain if possible

            while("convoReference" in hologramConvo) {
                hologramId = hologramConvo.convoReference;
                hologramConvo = gigi_manually_noted_conversations[hologramId];
                // console.debug(hologramId, hologramConvo);
            }

            // encountered the end of the convo reference chain. time to process it, unless it has already been processed.
            if(processedDialogues[hologramId]) {
                // it was already processed
                processedDialogues[originalHologramId] = processedDialogues[hologramId];
                continue keyProcessingLoop;
            }
        }

        // hologramId and hologramConvo both point to an un-processed manually noted conversation.

        processedDialogues[originalHologramId] = {
            firstVisitStartEntryId: hologramConvo.firstVisitStartEntryId,
            entries: Object.fromEntries(Object.entries(hologramConvo.entries).filter(e => e[0] !== "")
                .map(([translationId, info]) => {
                    const _translationIdExtraction = /^[a-zA-Z_\-]*([0-9]{18})[a-zA-Z_\-]*$/.exec(translationId);
                    const translationIdCleaned = _translationIdExtraction ? _translationIdExtraction[1] : translationId;

                    /** @type {NonNullable<import("../../../src/types.js").GigiHologram["dialogue"]>["entries"][string]} */
                    const dialogueEntry = {
                        internalTranslationId: translationIdCleaned,
                        text: l10nTranslationsFor("CommStation", translationIdCleaned, cacheOpts),
                    };

                    if(info.changeExpression) {
                        dialogueEntry.expression = info.changeExpression;
                    }

                    if(info.italics) {
                        dialogueEntry.italics = info.italics;
                    }

                    if(info.nextOptions) {
                        dialogueEntry.nextOptionsById = info.nextOptions;
                    }
                    else if(info.next) {
                        dialogueEntry.nextTextById = info.next;
                    }

                    return [translationId, dialogueEntry];
                })
            )
        };

        // check to add in the optional alternate entrypoints property
        if(typeof hologramConvo.labeledAltEntrypoints !== "undefined") {
            processedDialogues[originalHologramId].labeledAltEntrypoints = hologramConvo.labeledAltEntrypoints;
        }
    }

    return processedDialogues;
}

export function justExtractL10nTables(/** @type {CacheOpts} */ cacheOpts) {
    for(const l10nGlobsKey of Object.keys(L10N_TABLES_GLOBS)) {
        extractL10nTablesToCache(cacheOpts, l10nGlobsKey);
    }
}

// extractScenesToCacheJSON();
// exportNodeCoordsFromScenesJSON(undefined, true);
// extractPodIdGroupsToCache();
// console.log(readExistingTreasurePodTSData().existingPodTSDataByPodKey);

// const { fnWriteShDeposBackToFile, existingShDepoTSDataByDepoKey } = readExistingShadowPlortDepoTSData();
// console.log(Object.values(existingShDepoTSDataByDepoKey).map(e => `(${e.position.x}, ${e.position.y})`).join(', '));
// exportShadowPlortDeposFromAssetsMapping();
// exportResearchDronesFromAssetsMapping(undefined, { useCache: false, exportToCache: false });
// exportResearchDronesFromAssetsMapping(undefined, { useCache: false });
// exportResearchDronesFromAssetsMapping();
// exportGordosFromAssetsMapping();
// exportPuzzleDoorsFromAssetsMapping();
// exportStabilizingGatesFromAssetsMapping();
// exportNullifierDoorsFromAssetsMapping();
// exportGigiHologramsFromAssetsMapping();
// console.log(l10nTranslationsFor("CommStation", null));
// exportMapNodesFromAssetsMapping();
// exportProjectorPuzzlesFromAssetsMapping();
// exportTeleportersFromAssetsMapping();
// console.log(globSync(GLOBS_TO_ANCIENT_TELEPORTER_ASSETS));
// console.log(globSync(GLOBS_TO_ANCIENT_TELEPORTER_ASSETS).length);
// exportTeleportersFromAssetsMapping(await getOrExtractScenesAssetsMapping(defaultCacheSettings), { useCache: false });

// console.log(globSync(GLOBS_TO_INTERESTING_SCENES));
// console.log(globSync(GLOBS_TO_INTERESTING_SCENES).length);
// for(const asset of Object.values(await getOrExtractScenesAssetsMapping(defaultCacheSettings))) {
//     if(!asset.fileKey.toLowerCase().includes("gorge")) {
//         continue;
//     }
//     // if(asset.typeName !== "GameObject") {
//     //     continue;
//     // }
//     if(typeof asset.props["m_Name"] === "undefined") {
//         continue;
//     }
//     if(!/(portal|teleport)/i.test(asset.props["m_Name"])) {
//         continue;
//     }
//     console.log(`${asset.typeName} - ..../${basename(asset.fileKey)}&${asset.fileId} - ${asset.props["m_Name"]}`);
// }

// const strmult = (str, i) => i <= 0 ? "" : Array.from({length:i}).map(_ => str).join("");
// function printObj(/** @type {AssetJSONType} */ asset, indentNum=0, indentPart='- ') {
//     let indent = strmult(indentPart, indentNum);
//     console.log(`${indent}&${asset.fileId} - ${asset.typeName} - ${asset.props["m_Name"]}`);
//     indent = strmult(indentPart, indentNum+1);
//     for(const compObj of iterGameObjectComponentObjs(assetsMapping, asset, true)) {
//         // if(compObj.typeName === "Transform") continue;
//         console.log(`${indent}&${compObj.fileId} - ${compObj.typeName} - ${typeof compObj.props["m_Name"] === "undefined" ? "." : compObj.props["m_Name"]}`);
//     }
//     for(const childGameObj of iterChildGameObjects_DFS(assetsMapping, asset, { includeTransforms: false, recurse: false, includeThisGameObj: false })) {
//         printObj(childGameObj, indentNum+1, indentPart);
//     }
// }

// let assetsMapping = await getOrExtractScenesAssetsMapping(defaultCacheSettings);
// const teleporterAssets = Object.values(assetsMapping).filter(asset => asset.props["m_Name"] === "objLabyrinthPortal_staticDown" && asset.fileKey.toLowerCase().includes("gorge"));
// console.log(teleporterAssets.length);
// for(const asset of teleporterAssets) {
//     console.log(`${basename(asset.fileKey)}&${asset.fileId}`);
//     printObj(asset,0,'- ');
// }

// const assetsMapping = await getOrExtractScenesAssetsMapping(defaultCacheSettings);
// const core = Object.values(assetsMapping).find(asset => asset.props["m_Name"] === "objPrismaCoreMesh");
// const { gameObj, position, transformChainChildToParent } = followMonoBehaviourGameObjectTransformChain(assetsMapping, core);
// console.log(position);

// const assetsMapping = await getOrExtractScenesAssetsMapping(defaultCacheSettings);
// const filteredAssets = Object.values(assetsMapping).filter(asset => asset.fileKey.includes("zoneRainbowCore") && asset.props["m_Name"] === "objLabyShadowPlortCollector");
// for(const asset of filteredAssets) {
//     const { gameObj, position, transformChainChildToParent } = followMonoBehaviourGameObjectTransformChain(assetsMapping, asset);
//     console.log(position);
//     console.log(printObj(asset,0,'- '));
// }

// exportPlotPlannersFromAssetsMapping(await getOrExtractScenesAssetsMapping(defaultCacheSettings), { useCache: false });
// exportPlotPlannersFromAssetsMapping();
