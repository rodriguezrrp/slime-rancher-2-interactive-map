import L from "leaflet";


const expectedIconSizes = [96];

function smallestAboveOrEqual(size: number, candidates: number[]): number | null {
    const filtered = candidates.filter(c => c >= size);
    if(filtered.length === 0) return null;
    return Math.min(...filtered);
}


type PropsIconOptions = { src?: string, iconOptions: L.IconOptions } & React.ImgHTMLAttributes<HTMLImageElement>;
type PropsSrcExpectedSize = { src: string, expectedSize: number | [number, number] } & React.ImgHTMLAttributes<HTMLImageElement>;


type UnionToIntersection<U> =
  (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void
    ? I
    : never;

type Optionalize<T> = {
  [K in keyof T]?: T[K] | undefined;
};

type OverloadImpl<T> = Optionalize<UnionToIntersection<T>>;

type Props = OverloadImpl<(PropsIconOptions | PropsSrcExpectedSize)>;


function calcCssWidthHeightFromExpected(expectedSizeToUse: number | [number, number] | undefined): { csswidth: string | undefined, cssheight: string | undefined } {
    const csswidth = Array.isArray(expectedSizeToUse) ? `${expectedSizeToUse[0]}px` : expectedSizeToUse ? `${expectedSizeToUse}px` : undefined;
    const cssheight = Array.isArray(expectedSizeToUse) ? `${expectedSizeToUse[1]}px` : expectedSizeToUse ? `${expectedSizeToUse}px` : undefined;
    return { csswidth, cssheight };
}

export default function IconWithFallbacks({ src, expectedSize, style, ...props }: PropsSrcExpectedSize): JSX.Element;
export default function IconWithFallbacks({ iconOptions, src, style, ...props }: PropsIconOptions): JSX.Element;
export default function IconWithFallbacks({ iconOptions, src, expectedSize, style, ...props }: Props): JSX.Element {

    let srcToUse = src;
    let expectedSizeToUse = expectedSize;

    if(iconOptions) {
        if(src) {
            console.warn("Parameters iconOptions and src were specified. Preferring src.");
            srcToUse = src;
        }
        else {
            // extract src
            if(!iconOptions.iconUrl) {
                if(!src) {
                    console.error("Parameter iconOptions had no iconUrl or src. Returning normal img element with falsy src.");
                    const { csswidth, cssheight } = calcCssWidthHeightFromExpected(expectedSizeToUse);
                    return <img src={src} style={{ width: csswidth, height: cssheight, ...style }} {...props} />;
                }
                srcToUse = src;
            }
            else
                srcToUse = iconOptions.iconUrl;
        }

        if(expectedSize) {
            console.warn("Parameters iconOptions and expectedSize were specified. Preferring expectedSize.");
            expectedSizeToUse = expectedSize as number | [number, number];
        }
        else {
            if(!iconOptions.iconSize) {
                console.error("Neither parameters expectedSize nor iconOptions.iconSize were specified. Returning normal img element.");
                const { csswidth, cssheight } = calcCssWidthHeightFromExpected(expectedSizeToUse);
                return <img src={srcToUse} style={{ width: csswidth, height: cssheight, ...style }} {...props} />;
            }
            // extract expectedSize
            const iconSize: number[] = (
                iconOptions && Array.isArray(iconOptions.iconSize) ? iconOptions.iconSize
                : iconOptions && iconOptions.iconSize instanceof L.Point ? [iconOptions.iconSize.x, iconOptions.iconSize.y]
                : [32, 32]
            );
            const iconWidth = iconSize[0] ?? 32;
            const iconHeight = iconSize[1] ?? 32;
            expectedSizeToUse = [iconWidth, iconHeight];
        }
    }
    else {  // !iconOptions
        if(!src) {
            console.error("Neither parameters src nor iconOptions were specified. Returning normal img element with falsy src.");
            const { csswidth, cssheight } = calcCssWidthHeightFromExpected(expectedSizeToUse);
            return <img src={src} style={{ width: csswidth, height: cssheight, ...style }} {...props} />;
        }
        srcToUse = src;

        if(!expectedSize) {
            console.error("Neither parameters expectedSize nor iconOptions were specified. Returning normal img element.");
            const { csswidth, cssheight } = calcCssWidthHeightFromExpected(expectedSizeToUse);
            return <img src={srcToUse} style={{ width: csswidth, height: cssheight, ...style }} {...props} />;    
        }
        expectedSizeToUse = expectedSize;
    }
    
    if(!/(?:^|\/)icons\/.+\.[a-z]+$/i.test(srcToUse)) {
        console.error(`Unexpected image src: ${JSON.stringify(srcToUse)}. Will not make assumptions on compressed version of path. Returning normal img element.`);
        const { csswidth, cssheight } = calcCssWidthHeightFromExpected(expectedSizeToUse);
        return <img src={srcToUse} style={{ width: csswidth, height: cssheight, ...style }} {...props} />;
    }

    const { csswidth, cssheight } = calcCssWidthHeightFromExpected(expectedSizeToUse);

    const strippedExt = srcToUse.split(".").slice(0, -1).join(".").replace("icons/", "compressed/icons/");
    
    const numericExpectedSize = Array.isArray(expectedSizeToUse) ? Math.max(...expectedSizeToUse) : expectedSizeToUse;
    const sizeToTry = smallestAboveOrEqual(
        numericExpectedSize * (devicePixelRatio || 1),
        expectedIconSizes
    );
    
    return (
        <picture>
            {sizeToTry && <source srcSet={`${strippedExt}_${sizeToTry}.webp`} type="image/webp" />}
            {sizeToTry && <source srcSet={`${strippedExt}_${sizeToTry}.png`} type="image/png" />}
            <img
                src={srcToUse}
                style={{ width: csswidth, height: cssheight, ...style }}
                {...props}
            />
        </picture>
    );
}