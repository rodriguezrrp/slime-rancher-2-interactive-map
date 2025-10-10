import { GLOBS_TO_INTERESTING_SCENES, GLOBS_TO_POD_COUNTER_LIST_ASSETS, PATH_TO_PODS_DATA_FILE, PATH_TO_SHADOW_DEPOS_DATA_FILE } from "../../asset_paths.js";

import { Glob } from "glob";
import assert from "node:assert";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";
import { defaultCacheSettings, dumpMassiveHeckinBigObjectToJSON, readMassiveHeckinBigObjectFromJSON, sortStringsWithNumbers, parseUnityFileYamlIntoAssetsMapping, followMonoBehaviourGameObjectTransformChain } from "./processing_utils.js";


/** @typedef {{ fileKey: string, fileId: number, typeId: number, typeName: string, props: { [objProp: string]: unknown } }} AssetJSONType */
/** @typedef {{ [fileKeyFileId: string]: AssetJSONType }} AssetsMappingType */
/** @typedef {{ useCache?: boolean, exportToCache?: "sync" | "async" | boolean }} CacheOpts */


export async function exportNodeCoordsFromScenesJSON(
    /** @type {undefined | AssetsMappingType} */
    assetsMapping,
    /** @type {CacheOpts} */
    cacheOpts
) {
    
    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    // if(!assetsMapping && cacheOpts.useCache) {
    //     try {
    //         console.log("Reading cached asset JSON...");
    //         assetsMapping = await readMassiveHeckinBigObjectFromJSON("./data_cache/assetsFileIdMapping.json");
    //     } catch(e) {
    //         console.log(`Failed to read cached asset JSON -- ${e}`);
    //         console.log("Extracting anew instead.");
    //     }
    // }

    // if(!assetsMapping) {
    //     assetsMapping = await extractScenesToAssetsJSON(cacheOpts);
    // }

    // assetsMapping = Object.freeze(assetsMapping);

    //===============
    // Treasure Pods

    await exportPodCoordinatesFromAssetsMapping(assetsMapping, cacheOpts);

    //===============
    // Shadow Plort Depos

    await exportShadowPlortDepoCoordinatesFromAssetsMapping(assetsMapping, cacheOpts);

    //===============
    // Research Drones

    //...

}

/** @type {AssetsMappingType} */
let assetsMapping = null;

async function getOrExtractScenesAssetsMapping(/** @type {CacheOpts} */ cacheOpts) {
    if(!assetsMapping) {
        if(cacheOpts.useCache) {
            try {
                console.log("Reading cached asset JSON...");
                assetsMapping = await readMassiveHeckinBigObjectFromJSON("./data_cache/assetsFileIdMapping.json");
            } catch(e) {
                console.log(`Failed to read cached asset JSON -- ${e}`);
                console.log("Extracting anew instead.");
            }
        }
    
        if(!assetsMapping) {
            assetsMapping = await extractScenesToAssetsJSON(cacheOpts);
        }

        assetsMapping = Object.freeze(assetsMapping);
    }

    return assetsMapping;
}

async function exportPodCoordinatesFromAssetsMapping(/** @type {AssetsMappingType | undefined} */ assetsMapping, /** @type {CacheOpts} */ cacheOpts) {
    
    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    assetsMapping ??= await getOrExtractScenesAssetsMapping(cacheOpts);

    console.log("Extracting pod coordinates from assets JSON...");

    // assert(typeof assetsMapping[0] === "undefined" || assetsMapping[0] === null, `Why was there a value for fileId 0? ${assetsMapping[0]}`);

    const podIdMonoBehavioursEntries = Object.entries(assetsMapping)
        .filter(([, assetJSON]) => {
        
            const podId = assetJSON.props["_id"];
        
            if(!podId) return false;

            if(!/^pod[0-9]+$/.test(podId)) return false;

            assert(assetJSON.typeName === "MonoBehaviour", "found asset with a pod id in \"_id\" prop, but it was not a MonoBehaviour?");

            return true;

        });

    console.log(`Retrieved ${podIdMonoBehavioursEntries.length} Treasure Pod id MonoBehaviour entries.`);

    const ingamePodPositions = await Promise.all(podIdMonoBehavioursEntries.map(mapFnDeterminePodPosition(assetsMapping)));

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

    const { fnWritePodsBackToFile, existingPodTSDataByPodKey } = readExistingTreasurePodTSData(cacheOpts);

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
            pos: /*existingData?.pos ??*/ { x: -position.z, y: position.x },
            dimension: existingData?.dimension ?? "MapType.overworld",
            _otherLines: existingData?._otherLines,
        };

        if(existingData)
            console.log(`Merged extracted treasure pod ${internalPodId} data with existing ${tsDataKey} data`);
        else
            console.log(`Inserted extracted treasure pod ${internalPodId} data to ${tsDataKey} data`)
    }

    console.log("Writing treasure pod data back to map data file");

    fnWritePodsBackToFile(mergedPodTSData);

}

async function exportShadowPlortDepoCoordinatesFromAssetsMapping(/** @type {AssetsMappingType | undefined} */ assetsMapping, /** @type {CacheOpts} */ cacheOpts) {
    
    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    /** @type {{ fileId: string, assetJSON: AssetJSONType, depoGameObj: AssetJSONType, position: { x: number, y: number, z: number } }[]} */
    let ingameShDepoPositions;

    // if(cacheOpts.useCache && existsSync("./data_cache/shdepoPositions.json")) {
    if(false) {  // for debugging
        
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

        ingameShDepoPositions = await Promise.all(depoIdMonoBehavioursEntries.map(mapFnDetermineShDepoPosition(assetsMapping)));

        console.log(`Determined ${ingameShDepoPositions.length} shadow plort depo positions.`);
        // console.log('shdepoPositions:', shdepoPositions);

        // for debugging, cache the whole transform chain as well (and each transform's gameObject for good measure)
        for(const d of ingameShDepoPositions) {
            const {podGameObj:depoGameObj,position,transformChainChildToParent} = followMonoBehaviourGameObjectTransformChain(assetsMapping, d.assetJSON);
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

    // assetsMapping ??= await getOrExtractScenesAssetsMapping(cacheOpts);
    // for(const d of ingameShDepoPositions) {
    //     let _debugExtraDesc = "\n" + basename(d.assetJSON.fileKey);
    //     const {podGameObj,position,transformChainChildToParent} = followMonoBehaviourGameObjectTransformChain(assetsMapping, d.assetJSON);
    //     for(const c of transformChainChildToParent) {
    //         _debugExtraDesc += " \n ---- &" + c.fileId + " - " + assetsMapping[c.fileKey + "&" + c.props["m_GameObject"]["fileID"]]?.props["m_Name"];
    //         _debugExtraDesc += " \n - S: " + JSON.stringify(c.props["m_LocalScale"]);
    //         _debugExtraDesc += " \n - R: " + JSON.stringify(c.props["m_LocalRotation"]);
    //         _debugExtraDesc += " \n - P: " + JSON.stringify(c.props["m_LocalPosition"]);
    //     }
    //     d._debugExtraDesc = _debugExtraDesc;
    // }

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
        for(const [k, v] of Object.entries(existingShDepoTSDataByDepoKey)) {
            if(v === existingData) {
                delete existingShDepoTSDataByDepoKey[k];
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
            // position: { x: position.x, y: position.z },
            position: { x: -position.x, y: -position.z },
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

/** @typedef {{ unlocks: string[], internalId?: string, internalName?: string, description: string, position: { x: number, y: number }, amount_required: number, _otherLines?: string[] }} ExistingShDepoDataType */

function readExistingShadowPlortDepoTSData(/** @type {CacheOpts} */ cacheOpts) {
    
    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    /** @type {{ [tsDataDepoKey: string]: ExistingShDepoDataType }} */
    const existingShDepoTSDataByDepoKey = { };

    // const groupCommentLineRegex = /^ *\/\/ *(the conservatory|rainbow fields|ember valley|starlight strand|powderfall bluffs) *$/i;
    const endFileDataLineRegex = /^};? *$/;

    const dataStartLineRegex = /^ *([a-zA-Z0-9_]+|".+") *: *{ *$/;
    const dataParamLineRegex = /^ *([a-zA-Z_][a-zA-Z_0-9]*) *: *(?:(\[ *(?:"(?:[^\\"]|\\.)*",? *)+\])|("(?:[^\\"]|\\.)*")|({ *(?:(?:x|y) *: *(?:[\-+]?(?:\.?[0-9]+|[0-9]+\.[0-9]*)),? *)+})|([\-+]?(?:\.?[0-9]+|[0-9]+\.[0-9]*))|(undefined)),? *$/;
    const dataEndLineRegex = /^ +},? *$/;

    const linesForReconstruction = [];

    const fileLines = readFileSync(PATH_TO_SHADOW_DEPOS_DATA_FILE, { encoding: "utf-8" }).split(/[\r\n]+/);

    // console.log(fileLines);

    // let curGroup = null;

    let dataObj, dataObjDepoKey;

    for(const line of fileLines) {
        
        let dataStartExecRes = dataStartLineRegex.exec(line);

        // if(groupCommentLineRegex.test(line)) {
        //     curGroup = line;
        //     // denote for reconstruction that a new group has started
        //     linesForReconstruction.push(line);  // push the comment that started the group
        // }
        // else if(dataStartExecRes) {
        //     let dataObjKeyWithAreaName = /^"?treasure_+([a-z](?:[a-z_]*[a-z])?)_+[a-z0-9]+"?$/i
        //         .exec(dataStartExecRes[1]);
        //     if(dataObjKeyWithAreaName) {
        //         // denote for reconstruction that this data object just encountered is part of a specific group
        //         curGroup = dataObjKeyWithAreaName[1];
        //     } else {
        //         throw Error(`Was not in a denoted area group for reconstruction, but encountered a data object whose key did not specify its area. Throwing error to prevent unexpected data loss. Line with the unexpected start of data object: ${JSON.stringify(line)}`);
        //     }
        // }
        // else if(endFileDataLineRegex.test(line)) {
        //     // reached end of important data in file
        //     curGroup = null;
        //     // line will be pushed in the next if(!inGroup) statement.
        // }

        // if(!curGroup) {
        //     // push all lines that aren't in a denoted group
        //     linesForReconstruction.push(line);
        // }
        // else {
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
                const [ , key, list, str, xyobj, num, undef ] = dataParamExecRes;
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
        // }

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
            // const line = linesForReconstruction[reconstructionIndex];
            // if(endFileDataLineRegex.test(line))
            //     // we will resume inserting the remaining lines after processing any remaining data objects
            //     break;
            // reconstructionIndex++;
            // // console.log(line);

            // const commentGroupLbl = groupCommentLineRegex.exec(line)?.[1];
            
            // if(!commentGroupLbl) {
            //     reconstructedLines.push(line);
            // }
            // else {
            //     // landed in a denoted group. fill in data
            //     reconstructedLines.push(line);  // push the comment that started the group

            //     const podDataInGroup = Object.entries(mergedShDepoTSData)
            //         .filter(([, podData]) => {
            //             // do a bit of processing to loosen comparison
            //             const internalGroup = podGroupOfPodId(podData.internalId, cacheOpts)?.toLowerCase().replaceAll(/(^the | the | )/, "")
            //             const commentedGroup = commentGroupLbl.toLowerCase().replaceAll(/(^the | the | )/, "");
            //             return (
            //                 internalGroup === commentedGroup
            //                 || (internalGroup === "conservatory" && commentedGroup === "conservatory")
            //                 || (internalGroup === "rainbowfields" && commentedGroup === "rainbowfields")
            //                 || (internalGroup === "luminousstrand" && commentedGroup === "starlightstrand")
            //                 || (internalGroup === "rumblinggorge" && commentedGroup === "embervalley")
            //                 || (internalGroup === "powderfallbluffs" && commentedGroup === "powderfallbluffs")
            //             );
            //         })
            //         // .sort((a, b) => a[0].localeCompare(b[0], { numeric: true }));
            //         .sort((a, b) => sortStringsWithNumbers(a[0], b[0]));

            //     console.log(podDataInGroup);

            //     for (const entry of podDataInGroup) {
            //         const [ tsDataDepoKey, tsPodData ] = entry;
            //         _processDepoDataObj(tsDataDepoKey, tsPodData);
            //     }

            //     reconstructedLines.push("");  // push an empty line for spacing
            // }
            
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

// outer function with (assetsMapping) param is just for providing assetsMapping to the returned async function,
// leaving the returned async function still structured to be passable to .map().
const mapFnDetermineShDepoPosition = (/** @type {AssetsMappingType} */ assetsMapping) => (

    async (/** @type {[ fileId: string, assetJSON: AssetJSONType ]} */ [fileId, assetJSON]) => {

        console.log(`[Shadow Plort Depo ${assetJSON.props["_id"]}]: Determining position of shadow depo`);

        const { podGameObj: depoGameObj, transformChainChildToParent, position } = followMonoBehaviourGameObjectTransformChain(assetsMapping, assetJSON);

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

    }
);

function readExistingTreasurePodTSData(/** @type {CacheOpts} */ cacheOpts) {
    
    cacheOpts = {...defaultCacheSettings, ...cacheOpts};

    /** @type {{ [tsDataPodKey: string]: { contents: string[], internalId: string | undefined, internalName: string | undefined, description: string, pos: { x: number, y: number }, dimension: MapType, _otherLines: string[] } }} */
    const existingPodTSDataByPodKey = { };

    const groupCommentLineRegex = /^ *\/\/ *(the conservatory|rainbow fields|ember valley|starlight strand|powderfall bluffs) *$/i;
    const endFileDataLineRegex = /^};? *$/;

    const dataStartLineRegex = /^ *([a-zA-Z0-9_]+|".+") *: *{ *$/;
    // const dataParamLineRegex = /^ *(internalId|internalName|contents|description|pos|dimension) *: *(?:(\[ *(?:"(?:[^\\"]|\\.)*",? *)+\])|("(?:[^\\"]|\\.)*")|({ *(?:(?:x|y) *: *(?:[-+]?(?:\.?[0-9]+|[0-9]+\.[0-9]*)),? *)+})),? *$/;
    const dataParamLineRegex = /^ *([a-zA-Z_][a-zA-Z_0-9]*) *: *(?:(\[ *(?:"(?:[^\\"]|\\.)*",? *)+\])|("(?:[^\\"]|\\.)*")|({ *(?:(?:x|y) *: *(?:[\-+]?(?:\.?[0-9]+|[0-9]+\.[0-9]*)),? *)+})|(MapType.[a-zA-Z_][a-zA-Z_0-9]*)),? *$/;
    const dataEndLineRegex = /^ +},? *$/;

    const linesForReconstruction = [];

    const fileLines = readFileSync(PATH_TO_PODS_DATA_FILE, { encoding: "utf-8" }).split(/[\r\n]+/);

    // console.log(fileLines);

    let curGroup = null;

    let dataObj, dataObjPodKey;

    for(const line of fileLines) {
        
        let dataStartExecRes = dataStartLineRegex.exec(line);

        if(groupCommentLineRegex.test(line)) {
            curGroup = line;
            // denote for reconstruction that a new group has started
            linesForReconstruction.push(line);  // push the comment that started the group
        }
        else if(dataStartExecRes) {
            let dataObjKeyWithAreaName = /^"?treasure_+([a-z](?:[a-z_]*[a-z])?)_+[a-z0-9]+"?$/i
                .exec(dataStartExecRes[1]);
            if(dataObjKeyWithAreaName) {
                // denote for reconstruction that this data object just encountered is part of a specific group
                curGroup = dataObjKeyWithAreaName[1];
            } else {
                throw Error(`Was not in a denoted area group for reconstruction, but encountered a data object whose key did not specify its area. Throwing error to prevent unexpected data loss. Line with the unexpected start of data object: ${JSON.stringify(line)}`);
            }
        }
        else if(endFileDataLineRegex.test(line)) {
            // reached end of important data in file
            curGroup = null;
            // line will be pushed in the next if(!inGroup) statement.
        }

        if(!curGroup) {
            // push all lines that aren't in a denoted group
            linesForReconstruction.push(line);
        }
        else {
            // don't push lines inside a denoted group; these lines will be regenerated upon reconstruction
            // instead, parse them
            let dataParamExecRes = dataParamLineRegex.exec(line);

            if(dataStartExecRes) {
                let key = dataStartExecRes[1];
                dataObjPodKey = JSON.parse(key);
                dataObj = { };
            }
            else if(dataEndLineRegex.test(line)) {
                existingPodTSDataByPodKey[dataObjPodKey] = dataObj;
            }
            else if(dataParamExecRes) {
                const [, key, list, str, xyobj, mapTypeEnumVal] = dataParamExecRes;
                if(key === "description" || key === "internalName" || key === "internalId") {
                    dataObj[key] = JSON.parse(str);
                }
                else if(key === "contents") {
                    dataObj[key] = JSON.parse(list);
                }
                else if(key === "pos") {
                    dataObj[key] = JSON.parse(xyobj.replace("x", "\"x\"").replace("y", "\"y\""));
                }
                else if(key === "dimension") {
                    dataObj[key] = mapTypeEnumVal;
                }
                else {
                    // console.warn(`WARNING: DISCARDING parameter line ${JSON.stringify(line)}; unexpected data key (${JSON.stringify(key)}) and/or value.`);
                    dataObj._otherLines ||= [];
                    dataObj._otherLines.push(line);
                }
            }
        }

    }
    
    // console.log(linesForReconstruction);

    const fnWritePodsBackToFile = (/** @type {{ [tsDataPodKey: string]: { internalName: string, internalId: string, contents: string[], description: string, pos: { x: number, y: number }, dimension: MapType, _otherLines?: string[] } }} */ mergedPodTSData) => {
        const reconstructedLines = [];

        // console.log(mergedPodTSData);

        // shallow copy for mutation purposes
        mergedPodTSData = { ...mergedPodTSData };

        const _processPodDataObj = (
            /** @type {string} */ tsDataPodKey,
            /** @type {mergedPodTSData[keyof mergedPodTSData]} */ tsPodData
        ) => {
            // remove entry from pod data to insert now that it's processed
            delete mergedPodTSData[tsDataPodKey];

            // console.log("processing pod data");
            // console.log(tsDataPodKey);
            // console.log(tsPodData);
            const { internalId, internalName, contents, description, pos, dimension, _otherLines } = tsPodData;
            reconstructedLines.push(
                `    "${tsDataPodKey}": {`
            + `\n        internalId: ${JSON.stringify(internalId)},`
            + `\n        internalName: ${JSON.stringify(internalName)},`
            + `\n        contents: [${contents.map(JSON.stringify).join(", ")}],`
            + `\n        description: ${JSON.stringify(description)},`
            + `\n        pos: { x: ${pos.x.toFixed(4)/*.replace(/0+$/,"")*/}, y: ${pos.y.toFixed(4)/*.replace(/0+$/,"")*/} },`
            + `\n        dimension: ${dimension},`
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
            // console.log(line);

            const commentGroupLbl = groupCommentLineRegex.exec(line)?.[1];
            
            if(!commentGroupLbl) {
                reconstructedLines.push(line);
            }
            else {
                // landed in a denoted group. fill in data
                reconstructedLines.push(line);  // push the comment that started the group

                const podDataInGroup = Object.entries(mergedPodTSData)
                    .filter(([, podData]) => {
                        // do a bit of processing to loosen comparison
                        const internalGroup = podGroupOfPodId(podData.internalId, cacheOpts)?.toLowerCase().replaceAll(/(^the | the | )/, "")
                        const commentedGroup = commentGroupLbl.toLowerCase().replaceAll(/(^the | the | )/, "");
                        return (
                            internalGroup === commentedGroup
                            || (internalGroup === "conservatory" && commentedGroup === "conservatory")
                            || (internalGroup === "rainbowfields" && commentedGroup === "rainbowfields")
                            || (internalGroup === "luminousstrand" && commentedGroup === "starlightstrand")
                            || (internalGroup === "rumblinggorge" && commentedGroup === "embervalley")
                            || (internalGroup === "powderfallbluffs" && commentedGroup === "powderfallbluffs")
                        );
                    })
                    // .sort((a, b) => a[0].localeCompare(b[0], { numeric: true }));
                    .sort((a, b) => sortStringsWithNumbers(a[0], b[0]));

                console.log(podDataInGroup);

                for (const entry of podDataInGroup) {
                    const [ tsDataPodKey, tsPodData ] = entry;
                    _processPodDataObj(tsDataPodKey, tsPodData);
                }

                reconstructedLines.push("");  // push an empty line for spacing
            }
        }

        // process any remaining (unprocessed) pod data objects
        // for (const tsDataPodKey of Object.keys(mergedPodTSData).sort((a, b) => a.localeCompare(b, { numeric: true }))) {
        for (const tsDataPodKey of Object.keys(mergedPodTSData).sort(sortStringsWithNumbers)) {
            const tsPodData = mergedPodTSData[tsDataPodKey];
            _processPodDataObj(tsDataPodKey, tsPodData);
        }

        // finish any remaining lines in the file
        while(reconstructionIndex < linesForReconstruction.length) {
            const line = linesForReconstruction[reconstructionIndex];
            reconstructionIndex++;
            reconstructedLines.push(line);
        }

        writeFileSync(PATH_TO_PODS_DATA_FILE, reconstructedLines.join("\n"));
    }

    return {
        fnWritePodsBackToFile,
        existingPodTSDataByPodKey
    }
}

// outer function with (assetsMapping) param is just for providing assetsMapping to the returned async function,
// leaving the returned async function still structured to be passable to .map().
const mapFnDeterminePodPosition = (/** @type {AssetsMappingType} */ assetsMapping) => (

    async (/** @type {[ fileId: string, assetJSON: AssetJSONType ]} */ [fileId, assetJSON]) => {

        console.log(`[Treasure Pod ${assetJSON.props["_id"]}]: Determining position of pod`);
        
        /*
        const podGameObj = assetsMapping[assetJSON.fileKey + "&" + assetJSON.props["m_GameObject"]["fileID"]];
        if(!podGameObj || podGameObj.typeName !== "GameObject") throw new Error(`m_GameObject = ${JSON.stringify(assetJSON.props["m_GameObject"])}, podGameObj = ${JSON.stringify(podGameObj)}`);

        let curTransform = null;

        for(const componentRef of podGameObj.props["m_Component"]) {
            
            const componentObj = assetsMapping[podGameObj.fileKey + "&" + componentRef["component"]["fileID"]];
            if(!componentObj) throw new Error(`componentRef = ${JSON.stringify(componentRef)}, podGameObj = ${JSON.stringify(podGameObj)}`);

            if(componentObj.typeName === "Transform") {
                curTransform = componentObj;
                break;
            }

        }
        
        let transformChainChildToParent = [];
        
        while(curTransform) {
            
            if(!curTransform || curTransform.typeName !== "Transform") throw new Error(`curTransform = ${JSON.stringify(curTransform)}`);
            
            transformChainChildToParent.push(curTransform);

            const fatherTransformFileId = curTransform.props["m_Father"]["fileID"];
            
            if(fatherTransformFileId.toString() !== "0") {
                curTransform = assetsMapping[curTransform.fileKey + "&" + fatherTransformFileId];
            }
            else {
                curTransform = null;
            }

        }

        const position = {x: 0, y: 0, z: 0};

        for (let i = transformChainChildToParent.length - 1; i >= 0; i--) {

            const transformObj = transformChainChildToParent[i];
            
            // example properties of interest:
            //   m_LocalRotation: {x: -0.032494184, y: -0.3587241, z: 0.047845565, w: 0.9316501}
            //   m_LocalPosition: {x: 25.309, y: 23.31, z: 0.379}
            //   m_LocalScale: {x: 0.667, y: 0.667, z: 0.667}

            const p = transformObj.props["m_LocalPosition"];

            if(!p) throw new Error(`transform.props = ${JSON.stringify(transformObj.props)}`);

            position.x += p.x;
            position.y += p.y;
            position.z += p.z;

        }
        */

        const { podGameObj, transformChainChildToParent, position } = followMonoBehaviourGameObjectTransformChain(assetsMapping, assetJSON);

        console.log(`[Treasure Pod ${assetJSON.props["_id"]}]: Through a chain of ${transformChainChildToParent.length} transform(s), found position to be ${JSON.stringify(position)}`);

        return {fileId, assetJSON, podGameObj, position};

    }
);

/** old to internal @type {{ [oldId: string]: string }} */
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

/** old to internal @type {{ [oldId: string]: string }} */
let _shadowDepoIdMap = null;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function shadowDepoIdInternalToOld(/** @type {string} */ internalId) {
    if(_shadowDepoIdMap === null) {
        _shadowDepoIdMap = JSON.parse(readFileSync("./id_mappings/shadowDepoIdMap.json"));
    }
    return _shadowDepoIdMap[oldId];
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

    for await (const sceneFile of g) {

        console.log(`Processing scene ${sceneFile}`);

        parseUnityFileYamlIntoAssetsMapping(sceneFile, assetsMapping, n => /^(MonoBehaviou?r|GameObject|Transform)$/i.test(n));

    }

    if(cacheOpts.exportToCache) {
        const _export = () => {
            // fs.writeFile('./data_cache/assetsFileIdMapping.json', JSON.stringify(assetsMapping));
            dumpMassiveHeckinBigObjectToJSON("./data_cache/assetsFileIdMapping.json", assetsMapping);
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

    // for await (const podCounterTile of g) {
        
    // }

    // await Promise.all([].map)

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


// extractScenesToCacheJSON();
// exportNodeCoordsFromScenesJSON(undefined, true);
// extractPodIdGroupsToCache();
// console.log(readExistingTreasurePodTSData().existingPodTSDataByPodKey);

// const { fnWriteShDeposBackToFile, existingShDepoTSDataByDepoKey } = readExistingShadowPlortDepoTSData();
// console.log(Object.values(existingShDepoTSDataByDepoKey).map(e => `(${e.position.x}, ${e.position.y})`).join(', '));
exportShadowPlortDepoCoordinatesFromAssetsMapping();
