import { readFileSync, writeFileSync } from "fs";
import { globSync } from "glob";
import { looseJsonParseWithEval } from "./src/nodes/processing_utils.js";
import { basename } from "path";

// get the data ts files
const dataFiles = globSync("../src/data/*.ts");

// get the google sheet id map
/** @type {Record<string, string>} */
const googleSheetIdMap = looseJsonParseWithEval(/\sgoogleSheetIdMap\s+=\s+({.*?});/isg.exec(readFileSync("../src/components/MarkerAndPopupTemplate.tsx", { encoding: "utf-8" }))[1]);

const outCsvLines = ["File Name,Category,Marker #,Property Type,Data Key,Text needing improvement,Raw object path"];

function filenameToCategory(filename) {
    /** @type {string} */
    const lower = filename.toLowerCase().replace(/\.ts$/, "");
    return lower.split("_").map(word => word[0].toUpperCase() + word.substring(1)).join(" ");
}

function recursivelyProcessObj(filename, obj, parentKey = "") {
    for(const [key, value] of Object.entries(obj)) {
        const fullKey = parentKey ? `${parentKey}.${key}` : key;
        if(
            /research.*\.(archive|log)\.\d+\.[a-z]+\.\d+/i.test(fullKey)
            || /gigihologram.*\.dialogue\.entries\.\d+\.text\.[a-z]+/i.test(fullKey)
            || (filename === "map_nodes.ts" && /\.internalId$/i.test(fullKey) && value === "idk_todo")
        )
            continue;
        const propertyCategory = (
            /description$/i.test(fullKey) ? "Description"
            : /name$/i.test(fullKey) ? "Name"
            : /unlocks(\.\d+)?$/i.test(fullKey) ? "Unlocks"
            : /contents(\.\d+)?$/i.test(fullKey) ? "Contents"
            : /drops(\.\d+)?$/i.test(fullKey) ? "Drops"
            : ""
        );
        if(typeof value === "object" && value !== null) {
            recursivelyProcessObj(filename, value, fullKey);
        }
        if(typeof value === "string" && (value.toLowerCase().includes("todo") || value.toLowerCase().includes("ancient teleporter"))) {
            const baseKey = fullKey.substring(0,fullKey.indexOf("."));
            let markerNum = googleSheetIdMap[baseKey];
            let valueOut = value;
            // let beampointtypeExec = /(^.+this .* puzzle beam)( )(point )(start|end)(Point.*$)/i.exec(value);
            // let beampointtypeExec = /(^.+this .* puzzle beam)( )(point )(start|end)(Point.*$)/i.exec(value);
            // let beampointtype = beampointtypeExec ? beampointtypeExec[4] : null;
            // let beampointtypeExec = /(start|end)/i.exec(baseKey);
            let beampointtypeExec = / (start|end)/i.exec(value);
            // if(baseKey.startsWith("projector")) console.log(baseKey, valueOut, beampointtypeExec);
            let beampointtype = beampointtypeExec ? beampointtypeExec[1] : null;
            if(valueOut.toLowerCase().includes("ancient teleporter")) {
                // continue;
                valueOut = "Todo: better name for ancient teleporter " + valueOut;
            } else if(beampointtype) {
                // continue;
                // valueOut = `${beampointtypeExec[1]} ${beampointtype.charAt(0).toUpperCase() + beampointtype.substring(1).toLowerCase()} ${beampointtypeExec[3]}${beampointtypeExec[4]}${beampointtypeExec[5]}`;
                const valueExec = /(^.+this .* puzzle beam)( )(point )(start|end)(Point.*$)/i.exec(valueOut);
                if(valueExec)
                    valueOut = `${valueExec[1]} ${beampointtype.charAt(0).toUpperCase() + beampointtype.substring(1).toLowerCase()} ${valueExec[3]}${valueExec[4]}${valueExec[5]}`;
                markerNum = `${markerNum} ${beampointtype.charAt(0).toUpperCase()}`;
            }
            // else continue;

            valueOut = valueOut.replace(/"/g, "\"\"");  // escape quotes for csv
            outCsvLines.push(`"${filename}","${filenameToCategory(filename)}","${markerNum}","${propertyCategory}","${baseKey}","${valueOut}","${fullKey}"`);
            console.log(`Found text needing improvement in key: ${fullKey}`);
        }
    }
}

for(const file of dataFiles) {
    const filename = basename(file);
    if(/^(pins|map_crs_settings|islands)\.ts$/i.test(filename))
        continue;
    let content = readFileSync(file, { encoding: "utf-8" });
    content = content.substring(content.indexOf("= {") + 2, content.lastIndexOf("}") + 1);
    console.log(file);
    /** @type {Record<string, any>} */
    const dataObj = looseJsonParseWithEval(content);
    // console.log(dataObj);

    recursivelyProcessObj(filename, dataObj);
}

// write to csv
const outCsv = outCsvLines.join("\n");
writeFileSync("./gettodos_output.csv", outCsv, { encoding: "utf-8" });
