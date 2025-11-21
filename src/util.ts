import { GigiDialogueToTextEntry, GigiExpression, LocalStoragePlotPlan, LocalStorageSitePlan, Vec2 } from "./types";
import L from "leaflet";

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
    return (x - offset) * 180 / offset
}

/*
 * solving for the inverse equation of latToY:
 * y == (offset - offset / Math.PI * Math.log((1 + Math.sin(lat * Math.PI / 180)) / (1 - Math.sin(lat * Math.PI / 180))) / 2)
 * offset - y == offset / Math.PI * Math.log((1 + Math.sin(lat * Math.PI / 180)) / (1 - Math.sin(lat * Math.PI / 180))) / 2
 * (offset - y) * Math.PI / offset * 2 == Math.log((1 + Math.sin(lat * Math.PI / 180)) / (1 - Math.sin(lat * Math.PI / 180)))
 * Math.exp((offset - y) * Math.PI / offset * 2) == (1 + Math.sin(lat * Math.PI / 180)) / (1 - Math.sin(lat * Math.PI / 180))
 * let n = Math.exp((offset - y) * Math.PI / offset * 2)
 * n == (1 + Math.sin(lat * Math.PI / 180)) / (1 - Math.sin(lat * Math.PI / 180))
 * n * (1 - Math.sin(lat * Math.PI / 180)) == (1 + Math.sin(lat * Math.PI / 180))
 * n - n * Math.sin(lat * Math.PI / 180) == 1 + Math.sin(lat * Math.PI / 180)
 * n - 1 == Math.sin(lat * Math.PI / 180) + n * Math.sin(lat * Math.PI / 180)
 * n - 1 == (n + 1) * Math.sin(lat * Math.PI / 180)
 * (n - 1) / (n + 1) == Math.sin(lat * Math.PI / 180)
 * lat * Math.PI / 180 == Math.asin((n - 1) / (n + 1))
 * lat == 180 / Math.PI * Math.asin((n - 1) / (n + 1))
*/
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


import happy1 from "/gigi/happy1.png";
import thinking1 from "/gigi/thinking1.png";
import pointing1 from "/gigi/pointing1.png";
import surprised1 from "/gigi/surprised1.png";
import cheery1 from "/gigi/cheery1.png";
import sad1 from "/gigi/sad1.png";

export const gigiExpressionImageUrls: { [expression in GigiExpression]: string } = {
    happy1: happy1,
    surprised1: surprised1,
    thinking1: thinking1,
    pointing1: pointing1,
    cheery1: cheery1,
    sad1: sad1,
}