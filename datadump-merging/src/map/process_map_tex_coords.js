import { globSync } from "glob";
import { GLOBS_TO_MAP_SPRITE_ASSETS, PATH_TO_RAINBOW_ISLAND_MAP_PREFAB } from "../../asset_paths.js";
import { readFile } from "node:fs/promises";
import { followMonoBehaviourGameObjectTransformChain, parseUnityFileYamlIntoAssetsMapping } from "../nodes/process_node_locs.js";
import { basename } from "node:path";

/** @typedef {{ fileKey: string, fileId: number, typeId: number, typeName: string, props: { [objProp: string]: unknown } }} AssetJSONType */
/** @typedef {{ [fileKeyFileId: string]: AssetJSONType }} AssetsMappingType */

export async function extractCoordsOfMapTextures() {

    const spriteAssetFilePaths = globSync(GLOBS_TO_MAP_SPRITE_ASSETS);

    const metaFileGuidRegex = /^guid: *([0-9a-f]{32})$/im;
    
    const mapSpriteShortNameToGUIDs = { };
    const mapSpriteGUIDtoAssetJSONs = { };

    await Promise.all(spriteAssetFilePaths.map(
        async (assetpath) => {
            const filenameNoExt = basename(assetpath).split(".")[0];

            const metadata = await readFile(assetpath + ".meta", { encoding: "utf-8" });
            const guid = metaFileGuidRegex.exec(metadata)[1];
            
            /** @type {AssetsMappingType} */
            const spriteAssetsMapping = { }
            parseUnityFileYamlIntoAssetsMapping(assetpath, spriteAssetsMapping);
            if(Object.keys(spriteAssetsMapping).length !== 1) {
                throw new Error("Expected only one asset to be in the sprite asset file")
            }
            const spriteAssetJSON = Object.values(spriteAssetsMapping)[0];

            // return [ guid, { filenameNoExt, spriteAssetJSON } ];
            mapSpriteShortNameToGUIDs[filenameNoExt] = guid;
            mapSpriteGUIDtoAssetJSONs[guid] = spriteAssetJSON;
        }
    ))

    console.log(mapSpriteShortNameToGUIDs);

    const guids = Object.values(mapSpriteShortNameToGUIDs);

    /** @type {AssetsMappingType} */
    const ingameRIMapAssetsMapping = { };
    parseUnityFileYamlIntoAssetsMapping(PATH_TO_RAINBOW_ISLAND_MAP_PREFAB, ingameRIMapAssetsMapping, n => /^(MonoBehaviou?r|GameObject|(?:Rect)?Transform)$/i.test(n));

    const partPositionsRI = { };
    const partPositionsLabyrinth = { };

    for(const assetJSON of Object.values(ingameRIMapAssetsMapping)) {

        const guid = assetJSON.props["m_Sprite"]?.["guid"];
        if(!guid || !guids.includes(guid))
            continue;

        // This asset has one of the map sprites as its associated sprite.

        if(Object.hasOwn(partPositionsRI, guid))
            throw new Error(`Mapping already existed for guid ${guid}:\n${JSON.stringify(partPositionsRI[guid], undefined, 4)}`);

        // and it's a map sprite for which we haven't yet processed a position.

        if(assetJSON.typeName !== "MonoBehaviour")
            throw new Error(`Why was the assetJSON with a m_Sprite ref guid of ${guid} not a MonoBehaviour?`);

        console.log(assetJSON.typeName, assetJSON.fileKey + '&' + assetJSON.fileId);

        const shortName = Object.entries(mapSpriteShortNameToGUIDs).find(e => e[1] === guid)[0];

        console.log(shortName);
    
        // const { podGameObj, transformChainChildToParent, position } = followMonoBehaviourGameObjectTransformChain(ingameRIMapAssetsMapping, assetJSON, "RectTransform");
        // partPositionsRI[guid] = position;
        
        // transformChainChildToParent.forEach(t => {
        //     console.log(t.fileId);
        //     console.log("m_AnchorMin:        ", t.props["m_AnchorMin"]);
        //     console.log("m_AnchorMax:        ", t.props["m_AnchorMax"]);
        //     console.log("m_AnchoredPosition: ", t.props["m_AnchoredPosition"]);
        //     console.log("m_SizeDelta:        ", t.props["m_SizeDelta"]);
        //     console.log("m_Pivot:            ", t.props["m_Pivot"]);
        // });    

        const podGameObj = ingameRIMapAssetsMapping[assetJSON.fileKey + "&" + assetJSON.props["m_GameObject"]["fileID"]];        
        if(!podGameObj || podGameObj.typeName !== "GameObject") throw new Error(`m_GameObject = ${JSON.stringify(assetJSON.props["m_GameObject"])}, podGameObj = ${JSON.stringify(podGameObj)}`);

        let curTransform = null;

        for(const componentRef of podGameObj.props["m_Component"]) {
            
            const componentObj = ingameRIMapAssetsMapping[podGameObj.fileKey + "&" + componentRef["component"]["fileID"]];
            if(!componentObj) throw new Error(`componentRef = ${JSON.stringify(componentRef)},\npodGameObj = ${JSON.stringify(podGameObj, undefined, 4)}`);

            if(componentObj.typeName === "RectTransform") {
                curTransform = componentObj;
                break;
            }

        }

        if(!curTransform) {
            throw new Error(`Why was there no RectTransform for this game object?  map texture short name ${shortName}`)
        }

        const anchoredPos = curTransform.props["m_AnchoredPosition"];
        const size = curTransform.props["m_SizeDelta"];

        const offsetMin = {
            x: anchoredPos.x - (size.x / 2),
            y: anchoredPos.y - (size.y / 2)
        };
        const offsetMax = {
            x: anchoredPos.x + (size.x / 2),
            y: anchoredPos.y + (size.y / 2)
        };

        const spriteAssetJSON = mapSpriteGUIDtoAssetJSONs[guid];
        // console.log(spriteAssetJSON);
        // console.log(shortName, guid, position);
        console.log(shortName, guid, offsetMin, offsetMax);

        partPositionsRI[shortName] = { offsetMin, offsetMax };

    }

    return { mapSpriteShortNameToGUIDs, mapSpriteGUIDtoAssetJSONs, partPositionsRI, partPositionsLabyrinth };

}

await extractCoordsOfMapTextures();