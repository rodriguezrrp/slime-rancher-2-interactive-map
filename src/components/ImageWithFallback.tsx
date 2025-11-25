import { ImgHTMLAttributes, useState } from 'react'

/* Adapted from https://stackoverflow.com/a/66180668 */

interface Props extends ImgHTMLAttributes<any> {
    fallback: string | null
}

export default function ImageWithFallback({ fallback, src, ...props }: Omit<Props, "fallback"> & { fallback: string }): JSX.Element;
/** specify null fallback to return a null ReactNode upon src failure instead of an img element */
export default function ImageWithFallback({ fallback, src, ...props }: Props) {
    const [imgSrc, setImgSrc] = useState<string | undefined>(src)
    const onError = () => setImgSrc(fallback ?? undefined)

    if (!imgSrc && !fallback) {
        return null
    }
    return <img src={imgSrc ? imgSrc : fallback ?? undefined} onError={onError} {...props} />
}

