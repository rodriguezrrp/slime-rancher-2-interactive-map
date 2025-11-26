import { LocalStoragePlotPlan, LocalStorageSitePlan, Vec2 } from "./types";
import L from "leaflet";

// export function compressedWebpIconUrl(iconUrl: string) {
//     const size = 96;
//     const iconUrlMatch = /^(\/?public)\/(.*)\.(png)$/gi.exec(iconUrl);
//     if(iconUrlMatch === null) return iconUrl;
//     const [, rootPath, pathAndFileNameBeforeExt] = iconUrlMatch;
//     return `${rootPath}/compressed/${pathAndFileNameBeforeExt}_${size}.webp`;
// }

export function handleChecked(
    local_storage_key: string,
    key: string,
    checked: boolean,
    setChecked: React.Dispatch<React.SetStateAction<boolean>>,
    /// This is required due to us changing how localStorage keys are saved.
    /// Keys used to be constructed using the icon coords but are no longer.
    /// This should only be used to remove the deprecated key, never set.
    deprecatedKey: string | null = null,
) {
    const items: string[] = JSON.parse(localStorage.getItem(local_storage_key) ?? "[]") ?? [];

    if (!checked) {
        if (items.length > 0) {
            items.push(key);
            localStorage.setItem(local_storage_key, JSON.stringify(items));
        } else {
            localStorage.setItem(local_storage_key, JSON.stringify([key]));
        }
    } else {
        localStorage.setItem(
            local_storage_key,
            JSON.stringify(items.filter(item => item !== key && item !== deprecatedKey))
        );
    }

    setChecked(!checked);
}

export function handlePlotPlanned(
    site: string,
    plot: number,
    plotPlan: LocalStoragePlotPlan
) {
    const items: LocalStorageSitePlan[] = JSON.parse(localStorage.getItem("planned_plots") ?? "[]") ?? [];

    const sitePlans = items.filter(item => item.site === site);
    if (sitePlans.length === 1) {
        sitePlans[0].plotPlans[plot] = plotPlan;
    } else {
        const plotPlans = [];
        plotPlans[plot] = plotPlan;
        items.push({ site: site, plotPlans: plotPlans });
    }

    localStorage.setItem(
        "planned_plots",
        JSON.stringify(items)
    );
}

export function getStoredPlotPlans(): LocalStorageSitePlan[] {
    return JSON.parse(localStorage.getItem("planned_plots") ?? "[]") ?? [];
}

export function vecToLatLng(coord: Vec2): L.LatLngExpression {
    return [coord.x, coord.y];
}


/**
 * Linearly maps a value x from one range [min1, max1] to another [min2, max2].
 *
 * @param x - The value to be scaled.
 * @param min1 - The lower bound of the input range.
 * @param max1 - The upper bound of the input range.
 * @param min2 - The lower bound of the output range.
 * @param max2 - The upper bound of the output range.
 * @returns The scaled value.
 */
export function scaleLinear(x: number, min1: number, max1: number, min2: number, max2: number): number {
    if (max1 === min1) {
        throw new Error("Input range cannot have zero length (min1 must not equal max1).");
    }

    return ((x - min1) / (max1 - min1)) * (max2 - min2) + min2;
}



/**
 * The value 85.051129° is the latitude at which the full projected map becomes a square.
 * (See https://en.wikipedia.org/wiki/Web_Mercator_projection#Formulas)
*/
export const MAX_LAT = 85.051129;

/** Negative of {@link MAX_LAT} */
export const MIN_LAT = -85.051129;

/**
 * Adapted from https://stackoverflow.com/questions/1591902/converting-long-lat-to-pixel-x-y-given-a-zoom-level
 * 
 * Intakes degrees longitude in [-180, 180], and outputs map pixel x in [0, `tileSizePx << zoom`] (see {@link mapSizePxForMercatorZoom})
 * @param lon degrees longitude number within [-180, 180]
*/
export function lonToX(lon: number, zoom: number, tileSizePx: number = 256): number {
    const offset = tileSizePx << (zoom - 1);  // this can be rewritten if desired to allow for non-integer zoom values
    return /*Math.floor*/(offset + (offset * lon / 180));
}

/**
 * Adapted from https://stackoverflow.com/questions/1591902/converting-long-lat-to-pixel-x-y-given-a-zoom-level

 * Intakes degrees latitude in [-85.051129°, 85.051129°], and outputs map pixel y in [0, `tileSizePx << zoom`] (see {@link mapSizePxForMercatorZoom})

 * Note: effectively inverses axis direction around (lat 0) <=> (y `tileSizePx << zoom` / 2). E.g., latitudes above 0 become pixel y values below `tileSizePx << zoom` / 2.
 * @param lat degrees latitude number within [{@link MIN_LAT}, {@link MAX_LAT}] ([-85.051129°, 85.051129°])
*/
export function latToY(lat: number, zoom: number, tileSizePx: number = 256): number {
    const offset = tileSizePx << (zoom - 1);  // this can be rewritten if desired to allow for non-integer zoom values
    return /*Math.floor*/(offset - offset / Math.PI * Math.log((1 + Math.sin(lat * Math.PI / 180)) / (1 - Math.sin(lat * Math.PI / 180))) / 2);
}

/**
 * The size of the entire map in pixels when viewed at a zoom level of `zoom`.
 * 
 * Where the "entire map" is the region defined by:
 * - bottom left corner: latitude {@link MIN_LAT}, longitude -180°; and
 * - top right corner: latitude {@link MAX_LAT}, longitude 180°
 */
export function mapSizePxForMercatorZoom(zoom: number, tileSizePx: number = 256): [width: number, height: number] {
    // this can be rewritten if desired to allow for non-integer zoom values
    return [ tileSizePx << zoom, tileSizePx << zoom ];
}

/**
 * Intakes map pixel x in [0, `tileSizePx << zoom`], and outputs degrees longitude in [-180, 180]
 * 
 * the inverse of {@link lonToX}
 * 
 * @see {@link mapSizePxForMercatorZoom}
*/
export function xToLon(x: number, zoom: number, tileSizePx: number = 256): number {
    const offset = tileSizePx << (zoom - 1);  // this can be rewritten if desired to allow for non-integer zoom values
    return (x - offset) * 180 / offset;
}

/**
 * Intakes map pixel y in [0, `tileSizePx << zoom`], and outputs degrees latitude in [-85.051129°, 85.051129°].
 * 
 * the inverse of {@link latToY}
 * 
 * @see {@link mapSizePxForMercatorZoom}
*/
export function yToLat(y: number, zoom: number, tileSizePx: number = 256): number {
    const offset = tileSizePx << (zoom - 1);  // this can be rewritten if desired to allow for non-integer zoom values
    const n = Math.exp((offset - y) * Math.PI / offset * 2);
    return 180 / Math.PI * Math.asin((n - 1) / (n + 1));
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
function compareArraysOneLevelDeep<T>(a: T[], b: T[]) {
    if (a === b) return true;
    if (a == null || b == null || a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }

    return true;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function insertIntoSortedList<T>(arr: T[], element: T, cmp: ((a: T, b: T) => number) | (T extends number | bigint | string ? undefined : never)): T[] {
    if(!cmp) {
        if(typeof element === "number" || typeof element === "bigint")
            cmp = (<V extends typeof element>(a: V, b: V) => a - b) as NonNullable<typeof cmp>;
        else if(typeof element === "string")
            cmp = ((a: string, b: string) => a === b ? 0 : a < b ? -1 : 1) as NonNullable<typeof cmp>;
        else throw new Error("Must specify a custom comparison function in parameter `cmp`");
    }

    // Find the index where the element should be inserted
    // If no element is found that is greater than or equal,
    // it means the element should be appended to the end.
    const insertIndex = arr.findIndex(item => cmp(item, element) >= 0);

    if (insertIndex === -1) {
        // If element is larger than all existing elements, append it
        arr.push(element);
    } else {
        // Insert the element at the found index
        arr.splice(insertIndex, 0, element);
    }
    return arr;
}


