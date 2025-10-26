import { GLOBS_TO_INTERESTING_SCENES, GLOBS_TO_POD_COUNTER_LIST_ASSETS, PATH_TO_TREASURE_PODS_DATA_FILE } from "../../asset_paths.js";

import { Glob } from "glob";
import yaml from "js-yaml";
import assert from "node:assert";
import {
    createWriteStream, createReadStream, readFileSync, writeFileSync,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- because WriteStream is used in a @type jsdoc
    WriteStream,
    readdirSync,
    mkdirSync,
    existsSync,
    rmSync,
    unlinkSync,
    statSync
} from "node:fs";
import { basename, join, resolve } from "node:path";
import { Quaternion } from "quaternion";
import _pkg_streamjson from "stream-json";
const { parser } = _pkg_streamjson;
import _pkg2_streamjson_StreamObject from "stream-json/streamers/StreamObject.js";
const { streamObject } = _pkg2_streamjson_StreamObject;


/** @typedef {{ fileKey: string, fileId: number, typeId: number, typeName: string, props: { [objProp: string]: unknown } }} AssetJSONType */
/** @typedef {{ [fileKeyFileId: string]: AssetJSONType }} AssetsMappingType */
/** @typedef {{ useCache?: boolean, exportToCache?: "sync" | "async" | boolean }} CacheOpts */

export const defaultCacheSettings = { useCache: true, exportToCache: "async" };


export function followMonoBehaviourGameObjectTransformChain(
    /** @type {AssetsMappingType} */ assetsMapping,
    /** @type {AssetJSONType} */ assetJSON,
    transformTypeName = "Transform"
) {
    
    const gameObj = assetsMapping[assetJSON.fileKey + "&" + assetJSON.props["m_GameObject"]["fileID"]];
    if(!gameObj || gameObj.typeName !== "GameObject") throw new Error(`m_GameObject = ${JSON.stringify(assetJSON.props["m_GameObject"])}, podGameObj = ${JSON.stringify(gameObj)}`);

    let curTransform = null;

    for(const componentRef of gameObj.props["m_Component"]) {
        
        const componentObj = assetsMapping[gameObj.fileKey + "&" + componentRef["component"]["fileID"]];
        if(!componentObj) throw new Error(`componentRef = ${JSON.stringify(componentRef)},\npodGameObj = ${JSON.stringify(gameObj, undefined, 4)}`);

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

    // for (let i = transformChainChildToParent.length - 1; i >= 0; i--) {
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

        // q = new Quaternion();

        // let intermproduct = {
        //     x: position.x,
        //     y: position.y,
        //     z: position.z,
        // };
        let intermproduct = {
            x: position.x * s.x,
            y: position.y * s.y,
            z: position.z * s.z
        };
        intermproduct = q.rotateVector(intermproduct);

        // console.log('q.norm:', q.norm());
        if(Math.abs(q.norm() - 1) > 0.00001)
            throw Error("Quaternion magnitude was not approx. 1? " + q.norm().toString() + " , q:" + q.toString());

        position.x = intermproduct.x + p.x;
        position.y = intermproduct.y + p.y;
        position.z = intermproduct.z + p.z;

    }

    return { gameObj, transformChainChildToParent, position };
}

export function parseUnityFileYamlIntoAssetsMapping(sceneFilePath, assetsMappingToModify, objTypeNameFilter, extraFileTextPreproccessor) {
    
    // const fileKey = path.basename(sceneFilePath);
    const fileKey = sceneFilePath;

    let fileData = readFileSync(sceneFilePath, "utf-8");
    // .then((fileData) => {
    //     // try {
    //     //     return yaml.load(fileData);
    //     // } catch (e) {
    //     //     console.log(e.message);
    //     //     // console.log(e.reason);
    //     //     if(!e.message.includes("unknown tag !<tag:unity3d.com,")) {
    //     //         throw e;
    //     //     }
    //     // }
    //     // return yaml.load(fileData.replace(/!<tag:unity3d.com,[\.:0-9]*>/g, ''));
    // })
    // .then((/** @type string */ doc) => {
    //     console.log(doc.substring(0, 200));
    // })
    // fileData = fileData.replace(/!<tag:unity3d.com,[\.:0-9]*>/, '');
    fileData = fileData.replace(/^%YAML 1.1[\r\n]+%TAG !u! tag:unity3d\.com,[0-9]{4}:/, "");

    if(extraFileTextPreproccessor) fileData = extraFileTextPreproccessor(fileData);

    /** @type { {type: number, fileId: number, content: string}[] } */
    const assetsYaml = fileData.split("\n--- !u")
        .filter(assetData => assetData.length > 0)
        .map(assetData => {
            const _out = /^!([0-9]+) &([0-9]+) *[\r\n]+(.*)$/sg.exec(assetData);
            // console.log(_out);
            if(_out === null) {
                throw new Error("Failed to parse assetYaml:\n", assetData);
            // console.log(assetYaml.substring(0, 50));
            // const enc = new TextEncoder().encode(assetYaml.substring(0, 50));
            // console.log(enc);
            // console.log(enc.map(b => b.toString(16)).join(' '));
            // console.log(enc.map(b => (b >= 32 && b <= 126) ? String.fromCharCode(b) : '.').join(''));
            }
            // else
            //     console.log('ok');
            return _out;
        })
        .map(([, type, fileId, content]) => ({ type: Number(type), fileId: Number(fileId), content: content }));

    // const assetsJSONmappingEntries = await Promise.all(
    // await Promise.all(
    // assetsYaml.map(async ({ type, fileId: fileId, content: assetYaml }) => {
    assetsYaml.map(({ type, fileId: fileId, content: assetYaml }) => {

        /** @type { {[objTypeName: string]: {[objProp: string]: unknown}} } */
        const assetJSON = yaml.load(assetYaml);

        // console.log(assetJSON);
        // return { type, fileId, assetJSON };

        const objKeys = Object.keys(assetJSON);
        assert(objKeys.length === 1, `Did not find exactly one key in root object of assetJSON as expected. assetJSON: ${JSON.stringify(assetJSON, undefined, 4)}`);
        const typeName = objKeys[0];
        // return [fileId, { type: typeName, props: assetJSON[typeName] }];
        assert(typeName, JSON.stringify(objKeys));

        if(objTypeNameFilter && !objTypeNameFilter(typeName)) {
        // skip this asset
            return;
        }

        const fileKeyFileId = fileKey + "&" + fileId;
        assert(!Object.hasOwn(assetsMappingToModify, fileKeyFileId), `There was already a fileKeyFileId ${fileKeyFileId} in mapping.\nTried to insert asset:\n${JSON.stringify(assetJSON, undefined, 4)}\nFound existing entry:\n${JSON.stringify(assetsMappingToModify[fileKeyFileId], undefined, 4)}`);
        assetsMappingToModify[fileKeyFileId] = {
            fileKey,
            fileId,
            typeId: type,
            typeName: typeName,
            props: assetJSON[typeName]
        }

    })
    // )

    assert(!Object.hasOwn(assetsMappingToModify, fileKey + "&0"), `Why was there a mapping for fileId 0 from scene ${sceneFilePath}? Found ${JSON.stringify(assetsMappingToModify[fileKey + "&0"], undefined, 4)}`);

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
    /** @type { WriteStream } */ _stream
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
        // for(const file of files) {
        let processedCt = 0;
        await Promise.all(files.map(async file => {
            const fp = join(filePath, file);
            let contents;
            try {
                contents = JSON.parse(readFileSync(fp));
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
        // }
        }));
        console.log(`Read ${Object.keys(obj).length} entries from ${files.length} split JSON files.`);
        return obj;
    }
    else {
        //
        const fileStream = createReadStream(filePath, { encoding: "utf-8" });

        let pipeline = fileStream.pipe(parser());
        pipeline = pipeline.pipe(streamObject());

        // https://github.com/uhop/stream-json/wiki#streamers

        /** @type {{ [k: string]: unknown }} */
        const obj = { };
        for await (const { key, value } of pipeline) {
            obj[key] = value;
        }
        // await Promise.all(pipeline.map(async ({ key, value }) => {
        //     obj[key] = value;
        // }))
        return obj;
    }
}


// get MapType in here for the eval.?() resolution
// import { MapType } from "../../../src/CurrentMapContext.js";
// import { MapType } from "../../../src/CurrentMapContext.tsx";
const MapType = {
    overworld: "map_overworld",
    labyrinth: "map_labyrinth",
    sr1: "map_sr1"
};
global.MapType = MapType;  // for indirect eval, global scoped

export function looseJsonParseWithEval(/** @type {string} */ str) {
    return eval?.(`"use strict";(${str})`);
}
/**
 * @template T
 * @param {T} obj 
 * @param {number | string | null} indent 
 * @param {{
 *  transformer?: (obj: any, key: string | number, keys: (string | number)[]) => ({ raw: true, val: string } | { raw?: false, val: any } | undefined),
 *  shouldQuoteKey?: (key: string | number, depth: number, keys: (string | number)[], obj: any) => (boolean | null | undefined),
 *  shouldInlineObj?: (key: string | number, depth: number, keys: (string | number)[], obj: any) => (boolean | null | undefined),
 *  shouldSortKeys?: (key: string | number, depth: number, keys: (string | number)[], obj: any) => (boolean | ((a: string, b: string) => number) | undefined)
 * }} transformingFns 
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
    
    if(typeof retypedObj === "string" || typeof retypedObj === "number") {
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
                || !/[a-z_][a-z0-9_]*/i.test(k)
            )
        ) ? `"${k}": ` : `${k}: `;
        str += newlineIndent + _keyStr + looseJsonStringify(retypedObj[k], indent, transformingFns, _curIndent, _curIndent + indent, updatedKeysChain) + comma;
    })
    str += (shouldNewline ? "\n" + _prevIndent : " ") + "}";

    return str;
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