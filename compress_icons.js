/*
 * Run file like `node compress_icons.js`
 */

import { basename, dirname, join, relative } from "node:path";
import { mkdirSync, statSync } from "node:fs";
import { globSync } from "glob";
import sharp from "sharp";

/** @type {number[]} */
const targetPxSizes = [ 96 ];

// which images to target for compression
const paths = globSync("public/icons/**/*.png");

const rootpath = "public";
// put the compressed images into public/compressed/
const compressedpath = join(rootpath, "compressed");

const _abbrevs1024 = [["B", 1024 ** 0], ["KiB", 1024 ** 1], ["MiB", 1024 ** 2], ["GiB", 1024 ** 3], ["TiB", 1024 ** 4]];
function formatByteSize(size) {
    let [abbrev, divisor] = _abbrevs1024[0];
    let i = 1;
    while(i < _abbrevs1024.length && _abbrevs1024[i][1] <= size) {
        [abbrev, divisor] = _abbrevs1024[i];
        i++;
    }
    let amt = (size / divisor);
    return `${amt.toFixed(3)} ${abbrev}`;
}

// for prettiness in logs
const longestPathLength = Math.max(...paths.map(path => path.length));

await Promise.all(targetPxSizes.flatMap(targetPxSize =>
    paths.map(async (inpath) => {
        const outpath = join(compressedpath, relative(rootpath, dirname(inpath)), basename(inpath).replace(/.[a-z]+$/i,"") + `_${targetPxSize}.webp`);
        mkdirSync(dirname(outpath), { recursive: true });

        let pipeline = sharp(inpath, { failOn: "error" });

        const inMetadata = await pipeline.metadata();

        const inShorterSide = Math.min(inMetadata.width, inMetadata.height);
        const newWidth = Math.round(inMetadata.width / inShorterSide * targetPxSize);
        const newHeight = Math.round(inMetadata.height / inShorterSide * targetPxSize);

        pipeline = pipeline.resize({
            fit: sharp.fit.inside,
            width: newWidth,
            height: newHeight
        }).webp({
            effort: 6,
            lossless: true
        });

        await pipeline.toFile(outpath);

        const insize = statSync(inpath).size;
        const outsize = statSync(outpath).size;

        console.log(`Compressed ${inpath.padEnd(longestPathLength, " ")} from ${inMetadata.width}x${inMetadata.height} to ${newWidth}x${newHeight}  (${formatByteSize(insize)} -> ${formatByteSize(outsize)}; ${((1 - outsize/insize) *100).toFixed(1)}% reduction)`);
        
    })
));
