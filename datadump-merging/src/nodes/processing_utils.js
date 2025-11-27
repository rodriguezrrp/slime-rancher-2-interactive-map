import { basename, join } from "node:path";
import {
    createReadStream,
    createWriteStream,
    existsSync,
    mkdirSync,
    readFileSync,
    readdirSync,
    rmSync,
    statSync,
    unlinkSync,
    writeFileSync
} from "node:fs";
import { L10N_TABLES_GLOBS } from "../../asset_paths.js";
import { Quaternion } from "quaternion";
import assert from "node:assert";
import { globSync } from "glob";
import { readFile } from "node:fs/promises";
import yaml from "js-yaml";

// eslint-disable-next-line sort-imports
import _pkg_streamjson from "stream-json";
const { parser } = _pkg_streamjson;
// eslint-disable-next-line sort-imports
import _pkg2_streamjson_StreamObject from "stream-json/streamers/StreamObject.js";
const { streamObject } = _pkg2_streamjson_StreamObject;


/** @typedef {{ fileKey: string, fileId: number, typeId: number, typeName: string, props: { [objProp: string]: unknown } }} AssetJSONType */
/** @typedef {{ [fileKeyFileId: string]: AssetJSONType }} AssetsMappingType */
/** @typedef {{ useCache?: boolean, exportToCache?: "sync" | "async" | boolean }} CacheOpts */

export const defaultCacheSettings = { useCache: true, exportToCache: "async" };


/**
 * @param {{ x: number, y: number, z: number }} ingamePos
 * @returns {{ x: number, y: number }}
*/
export function transformIngameToMapPosition(ingamePos) {
    // In-game coordinate system is at 90 degrees to our map; swap x and y axes.
    // Also, in-game coordinates use y axis as height, so use in-game z for our y.
    return { x: -ingamePos.z, y: ingamePos.x };
}


export function* iterChildGameObjects_DFS(
    /** @type {AssetsMappingType} */ assetsMapping,
    /** @type {AssetJSONType} */ gameObj,
    /** @type {{
        includeTransforms?: boolean,
        recurse?: boolean,
        includeThisGameObj?: boolean,
        transformTypeName?: string,
    }} */ options = { }
) {
    options = {
        includeTransforms: false,
        recurse: true,
        includeThisGameObj: true,
        transformTypeName: "Transform",
        ...options
    };

    if(options.includeThisGameObj)
        yield gameObj;

    let gameObjTransform = null;

    for(const componentRef of gameObj.props["m_Component"]) {
        
        const componentObj = assetsMapping[gameObj.fileKey + "&" + componentRef["component"]["fileID"]];
        if(!componentObj) throw new Error(`componentRef = ${JSON.stringify(componentRef)},\npodGameObj = ${JSON.stringify(gameObj, undefined, 4)}`);

        if(componentObj.typeName === options.transformTypeName) {
            gameObjTransform = componentObj;
            break;
        }

    }

    // queue "unvisited" transforms' fileIDs in stack; Depth First Search (DFS)

    /** @type {number[]} */
    const transformFileIDsStack = gameObjTransform.props["m_Children"].map(({ fileID }) => fileID);

    let nextFileID;
    while(typeof (nextFileID = transformFileIDsStack.pop()) !== "undefined") {

        const transformFileKeyFileId = gameObjTransform.fileKey + "&" + nextFileID;
        const transform = assetsMapping[transformFileKeyFileId];

        if(options.includeTransforms)
            yield transform;

        const gameObjFileKeyFileId = transform.fileKey + "&" + transform.props["m_GameObject"]["fileID"];
        const gameObj = assetsMapping[gameObjFileKeyFileId];

        if(!gameObj) {
            throw new Error(`Could not find GameObject with fileKeyFileId ${gameObjFileKeyFileId} referenced by Transform ${transformFileKeyFileId} ${JSON.stringify(transform, undefined, 4)}`);
        }

        yield gameObj;

        // recurse

        if(options.recurse) {
            transformFileIDsStack.push(...transform.props["m_Children"].map(({ fileID }) => fileID));
        }

    }

}

export function* iterGameObjectComponentObjs(
    /** @type {AssetsMappingType} */ assetsMapping,
    /** @type {AssetJSONType} */ gameObj,
    ignoreFalsyComponentObjs = false
) {
    for(const componentRef of gameObj.props["m_Component"]) {
        
        const componentObj = assetsMapping[gameObj.fileKey + "&" + componentRef["component"]["fileID"]];
        if(!componentObj) {
            if(ignoreFalsyComponentObjs) continue;
            throw new Error(`falsy componentObj.\n componentRef = ${JSON.stringify(componentRef)},\n gameObj = ${JSON.stringify(gameObj, undefined, 4)}`);
        }

        yield componentObj;

    }
}

export function followMonoBehaviourGameObjectTransformChain(
    /** @type {AssetsMappingType} */ assetsMapping,
    /** @type {AssetJSONType} */ assetJSON,
    transformTypeName = "Transform"
) {

    const gameObj = assetJSON.typeName === "GameObject" ? assetJSON : assetsMapping[assetJSON.fileKey + "&" + assetJSON.props["m_GameObject"]["fileID"]];
    if(!gameObj || gameObj.typeName !== "GameObject") throw new Error(`m_GameObject = ${JSON.stringify(assetJSON.props["m_GameObject"])}, gameObj = ${JSON.stringify(gameObj)}`);

    let curTransform = null;

    for(const componentObj of iterGameObjectComponentObjs(assetsMapping, gameObj)) {
        if(componentObj.typeName === transformTypeName) {
            curTransform = componentObj;
            break;
        }
    }
    
    let transformChainChildToParent = [];
    
    while(curTransform) {
        
        if(!curTransform || curTransform.typeName !== transformTypeName) throw new Error(`curTransform = ${JSON.stringify(curTransform)}`);
        
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

    for (let i = 0; i <= transformChainChildToParent.length - 1; i++) {

        const transformObj = transformChainChildToParent[i];
        
        // example properties of interest:
        //   m_LocalRotation: {x: -0.032494184, y: -0.3587241, z: 0.047845565, w: 0.9316501}
        //   m_LocalPosition: {x: 25.309, y: 23.31, z: 0.379}
        //   m_LocalScale: {x: 0.667, y: 0.667, z: 0.667}

        const p = transformObj.props["m_LocalPosition"];
        const r = transformObj.props["m_LocalRotation"];
        const s = transformObj.props["m_LocalScale"];

        if(!p) throw new Error(`transform.props = ${JSON.stringify(transformObj.props)}`);

        // local to global: scale, rotate, translate

        let q = new Quaternion(r);  // r is object of form { x: .., y: .., z: .., w: .. }

        if(Math.abs(q.norm() - 1) > 0.00001)
            throw Error("Quaternion magnitude was not approx. 1? q.norm(): " + q.norm().toString() + " , q: " + q.toString());

        let intermproduct = {
            x: position.x * s.x,
            y: position.y * s.y,
            z: position.z * s.z
        };

        intermproduct = q.rotateVector(intermproduct);

        position.x = intermproduct.x + p.x;
        position.y = intermproduct.y + p.y;
        position.z = intermproduct.z + p.z;

    }

    return { gameObj, transformChainChildToParent, position };
}

/**
 * 
 * @param {string} sceneFilePath 
 * @param {AssetsMappingType} assetsMappingToModify 
 * @param {(objTypeName: string) => boolean} [objTypeNameFilter] 
 * @param {(fileText: string) => string} [extraFileTextPreproccessor] 
 */
export function parseUnityFileYamlIntoAssetsMapping(sceneFilePath, assetsMappingToModify, objTypeNameFilter, extraFileTextPreproccessor) {
    
    const fileKey = sceneFilePath;

    let fileData = readFileSync(sceneFilePath, "utf-8");
    
    fileData = fileData.replace(/^%YAML 1.1[\r\n]+%TAG !u! tag:unity3d\.com,[0-9]{4}:/, "");

    if(extraFileTextPreproccessor) fileData = extraFileTextPreproccessor(fileData);

    /** @type { {type: number, fileId: number, content: string}[] } */
    const assetsYaml = fileData.split("\n--- !u")
        .filter(assetData => assetData.length > 0)
        .map(assetData => {
            const _out = /^!([0-9]+) &([0-9]+) *[\r\n]+(.*)$/sg.exec(assetData);
            if(_out === null) {
                throw new Error("Failed to parse assetYaml:\n", assetData);
            }
            return _out;
        })
        .map(([, type, fileId, content]) => ({ type: Number(type), fileId: Number(fileId), content: content }));

    assetsYaml.map(({ type, fileId: fileId, content: assetYaml }) => {

        /** @type { {[objTypeName: string]: {[objProp: string]: unknown}} } */
        const assetJSON = yaml.load(assetYaml);

        const objKeys = Object.keys(assetJSON);
        assert(objKeys.length === 1, `Did not find exactly one key in root object of assetJSON as expected. assetJSON: ${JSON.stringify(assetJSON, undefined, 4)}`);
        const typeName = objKeys[0];
        
        assert(typeName, JSON.stringify(objKeys));

        if(objTypeNameFilter && !objTypeNameFilter(typeName)) {
            // skip this asset
            return;
        }

        const fileKeyFileId = fileKey + "&" + fileId;
        if(Object.hasOwn(assetsMappingToModify, fileKeyFileId)) throw new Error(`There was already a fileKeyFileId ${fileKeyFileId} in mapping.\nTried to insert asset:\n${JSON.stringify(assetJSON, undefined, 4)}\nFound existing entry:\n${JSON.stringify(assetsMappingToModify[fileKeyFileId], undefined, 4)}`);
        assetsMappingToModify[fileKeyFileId] = {
            fileKey,
            fileId,
            typeId: type,
            typeName: typeName,
            props: assetJSON[typeName]
        };

    });

    if(Object.hasOwn(assetsMappingToModify, fileKey + "&0")) throw new Error(`Why was there a mapping for fileId 0 from scene ${sceneFilePath}? Found ${JSON.stringify(assetsMappingToModify[fileKey + "&0"], undefined, 4)}`);

}

// Recursive type with specific depth is adapted from https://stackoverflow.com/a/66616799
/**
 * @template {readonly unknown[]} T 
 * @typedef {(T extends [unknown, ...infer Rest] ? Rest : never)} Tail<T>
 */
/**
 * @template V
 * @template {number} N
 * @typedef {RecurseTail_<V, N, []>} RecurseTail<V, N>
 */
/**
 * @template V
 * @template {number} N
 * @template {unknown[]} Depth
 * @typedef {N extends Depth['length'] ? V : Tail<RecurseTail_<V, N, [N, ...Depth]>>} RecurseTail_<V, N, Depth>
 */

/**
 * @param {string | string[]} globs 
 * @param {RecurseTail<Parameters<typeof parseUnityFileYamlIntoAssetsMapping>, 2>} parsingFunctionOptionalParams 
 * @returns {Promise<{ [fileGUID: string]: AssetJSONType }>} 
 */
export async function fromGlobsMapAssetGUIDsToAssetJSONs(globs, ...parsingFunctionOptionalParams) {

    /** @type {{ [fileGUID: string]: AssetJSONType }} */
    const mapAssetGUIDsToAssetJSONs = { };

    const metaFileGuidRegex = /^guid: *([0-9a-f]{32})$/im;

    const filepaths = globSync(globs);

    await Promise.all(filepaths.map(
        async (assetpath) => {
            // const filenameNoExt = basename(assetpath).split(".")[0];

            const metadata = await readFile(assetpath + ".meta", { encoding: "utf-8" });
            const guid = metaFileGuidRegex.exec(metadata)[1];
            
            /** @type {AssetsMappingType} */
            const singleAssetsMapping = { };
            // parseUnityFileYamlIntoAssetsMapping(assetpath, singleAssetsMapping);
            parseUnityFileYamlIntoAssetsMapping.apply(null, [assetpath, singleAssetsMapping, ...parsingFunctionOptionalParams]);
            if(Object.keys(singleAssetsMapping).length !== 1) {
                throw new Error(`Expected only one asset to be in the asset file. File path ${assetpath}`);
            }
            const teleporterAssetJSON = Object.values(singleAssetsMapping)[0];

            mapAssetGUIDsToAssetJSONs[guid] = teleporterAssetJSON;
        }
    ));

    return mapAssetGUIDsToAssetJSONs;

}

/** adapted from https://stackoverflow.com/a/53888894 */
export function sortStringsWithNumbers (/**@type {string}*/ a, /**@type {string}*/ b) {
    a = a.toUpperCase().split(/(\d+)/g);
    b = b.toUpperCase().split(/(\d+)/g);

    const length = Math.min(a.length, b.length);

    for (let i = 0; i < length; i++) {
        const cmp = (i % 2)
            ? a[i] - b[i]
            : -(a[i] < b[i]) || +(a[i] > b[i]);

        if (cmp) return cmp;
    }

    return a.length - b.length;
}

export function dumpMassiveHeckinBigObjectToJSON(
    filePath,
    object,
    /** @type { number | undefined } */ splitFilesMaxSize,
    /** @type { boolean | undefined } */ recurse,
    /** @type { import("node:fs").WriteStream } */ _stream
) {
    assert(typeof object === "object" && !Array.isArray(object));

    if(splitFilesMaxSize && splitFilesMaxSize > -1) {
        const ks = Object.keys(object);
        console.log(`Dumping ${ks.length} entries to split JSON files (<= ${splitFilesMaxSize}).`);

        if(existsSync(filePath)) {
            console.log(`  deleting existing contents found in output filepath directory "${filePath}"`);
            // clear out anything there
            try {
                rmSync(filePath, { recursive: true });
                mkdirSync(filePath, { recursive: true });
            }
            catch(e) {
                if(!e.message.toLowerCase().includes("ebusy: resource busy or locked"))
                    throw e;
                // then hope it's only the encompassing folder, and try to individually remove the contents
                for(const file of readdirSync(filePath)) {
                    const fp = join(filePath, file);
                    const st = statSync(fp);
                    if(st.isDirectory()) {
                        rmSync(fp, { recursive: true });
                    } else {
                        unlinkSync(fp);
                    }
                }
            }
        } else {
            mkdirSync(filePath, { recursive: true });
        }

        let filestr = "{";
        let filestrContainsKVs = false;
        let fileCtr = 1;

        for(const k of ks) {
            const v = object[k];

            let nextKVstr = "";
            let introComma = filestrContainsKVs ? "," : "";
            nextKVstr += JSON.stringify(k) + ":" + JSON.stringify(v);

            const estimatedLength = introComma.length + filestr.length + nextKVstr.length + "}".length;
            if(estimatedLength <= splitFilesMaxSize) {
                // there's room to put this kv string into the file
                filestr += introComma + nextKVstr;
                filestrContainsKVs = true;
            } else {
                // adding this kv string would push the file size over the limit;
                // need to split if possible.

                let dumpedThisKVstr = false;

                if(!filestrContainsKVs) {
                    // dump this kv str anyway; need to make progress somehow!
                    console.warn(`Adding just one KV into this file is putting filesize ${estimatedLength - splitFilesMaxSize} characters (${Math.round((estimatedLength/splitFilesMaxSize - 1)*1e4)/1e2}%) over limit (${estimatedLength} > ${splitFilesMaxSize}). Doing so anyway.`);
                    filestr += introComma + nextKVstr;
                    filestrContainsKVs = true;
                    dumpedThisKVstr = true;
                }

                // split to the next file
                filestr += "}";
                writeFileSync(join(filePath, fileCtr.toString().padStart(3, "0") + ".json"), filestr);
                filestr = "{";
                filestrContainsKVs = false;
                fileCtr++;

                if(!dumpedThisKVstr) {
                    // file was split before dumping nextKVstr;
                    //   go ahead and dump nextKVstr into the next file's string
                    //  (note there's no intro comma for the start of the new file)
                    filestr += nextKVstr;
                    filestrContainsKVs = true;
                }
            }
        }
        // dump last filestr contents to last file
        filestr += "}";
        writeFileSync(join(filePath, fileCtr.toString().padStart(3, "0") + ".json"), filestr);
        filestr = null;
        fileCtr++;
        console.log(`Dumped ${ks.length} entries to ${fileCtr - 1} split JSON files (<= ${splitFilesMaxSize}).`);
    }
    else {
        
        const fileStream = _stream ?? createWriteStream(filePath, { encoding: "utf-8" });
        try {
            fileStream.write("{");
            let wasFirst = true;
            for(const [k, v] of Object.entries(object)) {
                if(!wasFirst) {
                    fileStream.write(",");
                }
                wasFirst = false;
                fileStream.write(JSON.stringify(k));
                fileStream.write(":");
                if(recurse && typeof v === "object" && !Array.isArray(v)) {
                    dumpMassiveHeckinBigObjectToJSON(filePath, v, splitFilesMaxSize, recurse, fileStream);
                }
                else {
                    fileStream.write(JSON.stringify(v));
                }
            }
            fileStream.write("}");
        }
        finally {
            if(!_stream)
                // no stream was passed into this function; stream was created inside this function
                //   and should therefore be fully handled by this function
                fileStream.close();
        }

    }
}

export async function readMassiveHeckinBigObjectFromJSON(filePath, /** @type { boolean | undefined } */ multiFile, /** @type { ((fraction: number) => void) | undefined } */ progressCallback) {
    if(multiFile) {
        /** @type {{ [k: string]: unknown }} */
        const obj = { };
        const files = readdirSync(filePath).filter(f => /^\d+\.json$/.test(f));
        let processedCt = 0;
        await Promise.all(files.map(async file => {
            const fp = join(filePath, file);
            let contents;
            try {
                contents = JSON.parse(await readFile(fp));
            }
            catch(e) {
                console.error(`Encountered error reading or parsing file path ${fp}`);
                throw e;
            }
            for(const k of Object.keys(contents)) {
                obj[k] = contents[k];
            }
            processedCt++;
            progressCallback?.(processedCt / files.length);
        }));
        console.log(`Read ${Object.keys(obj).length} entries from ${files.length} split JSON files.`);
        return obj;
    }
    else {
        const fileStream = createReadStream(filePath, { encoding: "utf-8" });

        let pipeline = fileStream.pipe(parser());
        pipeline = pipeline.pipe(streamObject());

        // https://github.com/uhop/stream-json/wiki#streamers

        /** @type {{ [k: string]: unknown }} */
        const obj = { };
        for await (const { key, value } of pipeline) {
            obj[key] = value;
        }
        console.log(`Read ${Object.keys(obj).length} entries from large JSON file.`);
        return obj;
    }
}


// get MapType in here for the eval.?() resolution
// import { MapType } from "../../../src/CurrentMapContext.js";
// import { MapType } from "../../../src/CurrentMapContext.tsx";
export const MapType = {
    overworld: "map_overworld",
    labyrinth: "map_labyrinth",
    sr1: "map_sr1"
};
// eslint-disable-next-line no-undef
global.MapType = MapType;  // for indirect eval, global scoped

/** @typedef {typeof MapType} _MapTypeType */

export function looseJsonParseWithEval(/** @type {string} */ str) {
    return eval?.(`"use strict";(${str})`);
}
/** @typedef {{
 *  transformer?: (obj: any, key: string | number, keys: (string | number)[]) => ({ raw: true, val: string } | { raw?: false, val: V } | undefined),
 *  shouldQuoteKey?: (key: string | number, depth: number, keys: (string | number)[], obj: any) => (boolean | null | undefined),
 *  shouldInlineObj?: (key: string | number, depth: number, keys: (string | number)[], obj: any) => (boolean | null | undefined),
 *  shouldSortKeys?: (key: string | number, depth: number, keys: (string | number)[], obj: any) => (boolean | ((a: string, b: string) => number) | undefined)
 * }} LooseStringifyTransformingFunctionsType<V>
 * @template V
 * */
/**
 * @template T, U
 * @param {T} obj 
 * @param {number | string | null} indent 
 * @param {LooseStringifyTransformingFunctionsType<U>} transformingFns 
 * @param {*} [_prevIndent] 
 * @param {*} [_curIndent] 
 * @param {(string | number)[]} [_prevKeysChain] 
 * @returns string
 */
export function looseJsonStringify(
    obj,
    indent = "    ",
    transformingFns = undefined,
    _prevIndent = "", _curIndent = "    ", _prevKeysChain = undefined
) {
    if(obj === null) {
        return "null";
    }
    else if(typeof obj === "undefined") {
        return "undefined";
    }
    
    const { transformer, shouldQuoteKey, shouldInlineObj, shouldSortKeys } = (transformingFns ?? {});
    
    // allow transformer fn to serialize or otherwise transform data

    _prevKeysChain ??= [];
    /** @type {T | U} */
    let retypedObj;
    const transformed = transformer?.(obj, _prevKeysChain[_prevKeysChain.length - 1], _prevKeysChain);
    if(typeof transformed !== "undefined") {
        // if transform result is raw, insert it directly into the stringified without further processing
        if(transformed.raw) return transformed.val;
        retypedObj = transformed.val;
    }
    else retypedObj = obj;
    if(retypedObj === null) {
        return "null";
    }

    // try to treat obj as a js type that is not a generic object
    
    if(typeof retypedObj === "string" || typeof retypedObj === "number" || typeof retypedObj === "boolean") {
        return JSON.stringify(retypedObj);
    }
    
    // resolve indentation parameters
    const _shouldInlineFnCallRes = shouldInlineObj?.(_prevKeysChain[_prevKeysChain.length - 1], _prevKeysChain.length - 1, _prevKeysChain, retypedObj);
    const shouldNewline = (
        _shouldInlineFnCallRes !== true
        && (
            _shouldInlineFnCallRes === false
            || (typeof indent === "string" || typeof indent === "number")
        )
    );
    if(typeof indent === "number") {
        let tmp = "";
        for(let i = 0; i < indent; i++)
            tmp += " ";
        indent = tmp;
    }
    const newlineIndent = shouldNewline ? "\n" + _curIndent : " ";
    

    // try to treat obj as an array object

    if(Array.isArray(retypedObj)) {
        // build serialized arr
        let str = "[";
        let prevIndexWasEmpty = false;
        for(let i = 0; i < retypedObj.length; i++) {
            const comma = i === retypedObj.length - 1 ? "" : ",";
            if(Object.hasOwn(retypedObj, i)) {
                //
                str += newlineIndent + looseJsonStringify(retypedObj[i], indent, transformingFns, _curIndent, _curIndent + indent, [..._prevKeysChain, i]) + comma;
                prevIndexWasEmpty = false;
            } else {
                if(!prevIndexWasEmpty)
                    str += newlineIndent;
                str += comma;
                prevIndexWasEmpty = true;
            }
        }
        str += (shouldNewline ? "\n" + _prevIndent : " ") + "]";
        return str;
    }

    // else, try to treat obj as a generic js object

    // build serialized obj
    let str = "{";
    const ks = Object.keys(retypedObj);
    let sortFn = shouldSortKeys?.(_prevKeysChain[_prevKeysChain.length - 1], _prevKeysChain.length, _prevKeysChain, retypedObj);
    if(typeof sortFn !== "undefined" && sortFn !== false) {
        if(sortFn === true) {
            // set a default argument value
            sortFn = sortStringsWithNumbers;
        }
        if(typeof sortFn !== "function") {
            console.warn(`The object key sorting function passed via shouldSortKeys was not a function type, instead a ${typeof sortFn}. Trying to pass it to .sort() anyway.`);
        }
        ks.sort(sortFn);
    }
    ks.forEach((k, i) => {
        const comma = i === ks.length - 1 ? "" : ",";
        const updatedKeysChain = [..._prevKeysChain, k];
        const _shouldQuote = shouldQuoteKey?.(k, updatedKeysChain.length - 1, updatedKeysChain, retypedObj);
        let _keyStr = (
            _shouldQuote !== false
            && (
                _shouldQuote === true
                || !/^[a-z_][a-z0-9_]*$/i.test(k)
            )
        ) ? `"${k}": ` : `${k}: `;
        str += newlineIndent + _keyStr + looseJsonStringify(retypedObj[k], indent, transformingFns, _curIndent, _curIndent + indent, updatedKeysChain) + comma;
    });
    str += (shouldNewline ? "\n" + _prevIndent : " ") + "}";

    return str;
}


/**
 * 
 * @param {CacheOpts} cacheOpts 
 * @param {keyof L10N_TABLES_GLOBS} globsKey 
 * @returns {{ [lang: string]: { [translationKeyId: string]: string }}}
 */
export function extractL10nTablesToCache(cacheOpts, globsKey) {
    /** @type {{ [lang: string]: { [translationKeyId: string]: string }}} */
    let l10nData = { };

    const files = globSync(L10N_TABLES_GLOBS[globsKey]);

    for(const l10nFile of files) {
        /** @type {AssetsMappingType} */
        const assetsMapping = { };
        parseUnityFileYamlIntoAssetsMapping(l10nFile, assetsMapping, undefined, (/** @type {string} */ fileData) => {
            // Because yaml library tries to parse the key id as number and loses precision. Surround it in quotes.
            return fileData.replaceAll(/(-\s+m_Id:\s+)(\d+)(\s)/g, "$1\"$2\"$3");
        });

        if(Object.keys(assetsMapping).length !== 1) {
            throw new Error("Expected only one asset to be in the drone asset file");
        }

        assert(Object.keys(assetsMapping).length === 1);

        const assetJSON = Object.values(assetsMapping)[0];

        // const podIdsList = assetJSON.props["_treasurePodIDs"];

        /** @type {{ [translationKeyId: string]: string }} */
        const mapping = Object.fromEntries(assetJSON.props["m_TableData"].map(({ m_Id, m_Localized, m_Metadata }) => {
            if(m_Metadata["m_Items"]["Array"] && m_Metadata["m_Items"]["Array"].length > 0) {
                console.warn(`Was not expecting any m_Metadata["m_Items"]["Array"]! Found ${JSON.stringify(m_Metadata["m_Items"]["Array"])}`);
            }
            return [m_Id, m_Localized];
        }));

        // expect camelcase text as the first part of filename (e.g. ResearchDrone, CommStation, ...)
        const lang = /^(?:[A-Z][a-z]*)+_(en|es|de|fr|ja|ko|pt|ru|zh).asset$/.exec(basename(l10nFile))[1];

        if(!lang) throw new Error(`Unexpected lang value in localization file name ${basename(l10nFile)} (${l10nFile})`);

        l10nData[lang] = mapping;
    }

    if(cacheOpts.exportToCache) {
        const _export = () => {
            writeFileSync(`./data_cache/${globsKey}L10nData.json`, JSON.stringify(l10nData, undefined, 4), { encoding: "utf-8" });
            console.log(`Exported ${globsKey} localization tables to cache.`);
        };
        if(cacheOpts.exportToCache === "sync") {
            console.log(`Exporting ${globsKey} localization tables to cache...`);
            _export();
        }
        else (async () => { _export(); })();
    }

    return l10nData;
}


export function joinedStringWithOxfordComma(/** @type {string[]} */ arr, andor = "or") {
    if(arr.length === 0) return "";
    if(arr.length === 1) return arr[0];
    if(arr.length === 2) return `${arr[0]} ${andor} ${arr[1]}`;
    if(arr.length >= 3) return arr.slice(0, -1).join(", ") + ", " + andor + " " + arr[arr.length - 1];
    return arr[0];
}


/**
 * Capitalizes the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} The string with first letter capitalized
 */
export function capitalizeFirst(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}


/**
 * Checks if a Set contains all specified items
 * @template T
 * @param {Set<T>} set - The Set to check
 * @param {Iterable<T>} itemsContained - The items to check for containment
 * @returns {boolean} True if the Set contains all specified items, false otherwise
 */
export function setContains(set, itemsContained) {
    for (const item of itemsContained) {
        if (!set.has(item)) return false;
    }
    return true;
}

/**
 * Checks if two arrays are equal by comparing elements
 * @template T
 * @param {T[]} a - First array to compare
 * @param {T[]} b - Second array to compare 
 * @returns {boolean} True if arrays are equal, false otherwise
 */
export function arraysEqual(a, b) {
    if (a === b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

/**
 * Checks if two Sets contain the same elements
 * @template T
 * @param {Set<T>} a - First Set to compare
 * @param {Set<T>} b - Second Set to compare
 * @returns {boolean} True if Sets contain the same elements, false otherwise
 */
export function setsEqual(a, b) {
    if (a === b) return true;
    if (!a || !b) return false;
    if (a.size !== b.size) return false;
    for (const item of a) {
        if (!b.has(item)) return false;
    }
    return true;
}

export function deepCopy(value, _seen = new WeakMap()) {
    if (value === null || typeof value !== "object") return value;

    // Handle circular references
    if (_seen.has(value)) return _seen.get(value);

    // Built-in types
    if (value instanceof Date) return new Date(value.getTime());
    if (value instanceof RegExp) return new RegExp(value.source, value.flags);
    if (value instanceof Map) {
        const m = new Map();
        _seen.set(value, m);
        for (const [k, v] of value) m.set(deepCopy(k, _seen), deepCopy(v, _seen));
        return m;
    }
    if (value instanceof Set) {
        const s = new Set();
        _seen.set(value, s);
        for (const v of value) s.add(deepCopy(v, _seen));
        return s;
    }
    if (ArrayBuffer.isView(value)) {
        // TypedArray or DataView
        const ctor = value.constructor;
        const copy = new ctor(value.buffer ? value.buffer.slice(0) : value);
        _seen.set(value, copy);
        return copy;
    }
    if (value instanceof ArrayBuffer) return value.slice(0);

    // Arrays
    if (Array.isArray(value)) {
        const arr = [];
        _seen.set(value, arr);
        for (let i = 0; i < value.length; i++) arr[i] = deepCopy(value[i], _seen);
        return arr;
    }

    // Generic objects (preserve prototype and property descriptors)
    const proto = Object.getPrototypeOf(value);
    const out = Object.create(proto);
    _seen.set(value, out);
    for (const key of Reflect.ownKeys(value)) {
        const desc = Object.getOwnPropertyDescriptor(value, key);
        if (!desc) continue;
        if (desc.get || desc.set) {
            Object.defineProperty(out, key, desc);
        } else {
            desc.value = deepCopy(desc.value, _seen);
            Object.defineProperty(out, key, desc);
        }
    }
    return out;
}


// export function latLngToYX(lat, lng, zoom) {
//     return { y: latToY(lat, zoom), x: lonToX(lng, zoom) };
// }

// /** Adapted from https://stackoverflow.com/questions/1591902/converting-long-lat-to-pixel-x-y-given-a-zoom-level */
// export function lonToX(lon, zoom) {
//     let offset = 256 << (zoom - 1);
//     return /*Math.floor*/(offset + (offset * lon / 180));
// }
// /** Adapted from https://stackoverflow.com/questions/1591902/converting-long-lat-to-pixel-x-y-given-a-zoom-level */
// export function latToY(lat, zoom) {
//     let offset = 256 << (zoom - 1);
//     return /*Math.floor*/(offset - offset / Math.PI * Math.log((1 + Math.sin(lat * Math.PI / 180)) / (1 - Math.sin(lat * Math.PI / 180))) / 2);
// }

// /**
//  * The value 85.051129° is the latitude at which the full projected map becomes a square.
//  * (See https://en.wikipedia.org/wiki/Web_Mercator_projection#Formulas)
// */
// export const MAX_LAT = 85.051129;

// function _testLatLng() {

//     let zoom = 1;
//     console.log(`Test zoom = ${zoom}`)
//     console.log('Test: Latitude sweeping from -80 to 80:')
//     let lat = -80;
//     let lng = -90;
//     while(lat < 85.0512) {
//         let { y, x } = latLngToYX(lat, lng, zoom);
//         console.log(`(lat ${lat.toFixed(2).padStart(7)}, lng ${lng.toFixed(2).padStart(7)}) -> (y ${y.toFixed(4).padStart(9)}, x ${x.toFixed(4).padStart(9)})`)
//         lat += 20;
//     }
//     console.log('Test: Min latitude, min longitude (e.g., bottom left):');
//     {
//         // code block is for scoping of let { y, x } destructuring
//         lat = -MAX_LAT;
//         lng = -180;
//         let { y, x } = latLngToYX(lat, lng, zoom);
//         console.log(`(lat ${lat.toFixed(6).padStart(11)}, lng ${lng.toFixed(4).padStart(9)}) -> (y ${y.toFixed(4).padStart(9)}, x ${x.toFixed(4).padStart(9)})`)
//     }
//     console.log('Test: Max latitude, max longitude (e.g., top right):');
//     {
//         // code block is for scoping of let { y, x } destructuring
//         lat = MAX_LAT;
//         lng = 180;
//         let { y, x } = latLngToYX(lat, lng, zoom);
//         console.log(`(lat ${lat.toFixed(6).padStart(11)}, lng ${lng.toFixed(4).padStart(9)}) -> (y ${y.toFixed(4).padStart(9)}, x ${x.toFixed(4).padStart(9)})`)
//     }

// }

// _testLatLng();
