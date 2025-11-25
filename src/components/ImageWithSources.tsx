

interface Props {
    srcSets: (
        NonNullable<React.SourceHTMLAttributes<HTMLSourceElement>["srcSet"]>
        | React.SourceHTMLAttributes<HTMLSourceElement>
    )[];
    img: (
        NonNullable<React.ImgHTMLAttributes<HTMLImageElement>["src"]>
        | React.ImgHTMLAttributes<HTMLImageElement>
    );
    guessMimeTypeFromExtension?: boolean;
}

export default function ImageWithSources({ img, srcSets, guessMimeTypeFromExtension }: Props) {
    guessMimeTypeFromExtension ??= true;
    return (
        <picture>
            {srcSets.map((source, index) =>
                typeof source === "string"
                ? <source key={`${index}_${source}`} srcSet={source} type={guessMimeTypeFromExtension ? guessImgMimeTypeFromSrc(source) : undefined} />
                : <source key={`${index}_${source.src}`} {...source} />
            )}
            {
                typeof img === "string"
                ? <img src={img} alt="" />
                : <img {...img} />
            }
        </picture>
    );
}

function guessImgMimeTypeFromSrc(src: string): string | undefined {
    const extension = src.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'webp':
            return 'image/webp';
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'gif':
            return 'image/gif';
        case 'apng':
            return 'image/apng';
        case 'avif':
            return 'image/avif';
        case 'svg':
            return 'image/svg+xml';
        case 'bmp':
            return 'image/bmp';
        case 'ico':
        case 'cur':
            return 'image/x-icon';
        case 'tif':
        case 'tiff':
            return 'image/tiff';
        default:
            console.warn(`Could not automatically guess image mime type from src string: ${JSON.stringify(src)}`);
            return undefined;
    }
}