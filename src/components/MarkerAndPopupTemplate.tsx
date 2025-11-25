import { Popup } from "react-leaflet";
import { PopupSwitchButtonsWrapper, useMapMarkersContextSetMarkerRef } from "./popupUtils";
import { useRef } from "react";
import { Marker as ComponentMarker } from "@adamscybot/react-leaflet-component-marker";
import L from "leaflet";

export default function MarkerAndPopupTemplate({
    children,
    markerRefKey,
    position,
    icon,
    popupCheckedState,
    onPopupCheckChange,
    headerRowChildren,
}: {
    children: React.ReactNode;
    markerRefKey: string;
    position: L.LatLngExpression;
    icon: L.MarkerOptions["icon"];
    popupCheckedState: boolean;
    onPopupCheckChange: React.ChangeEventHandler<HTMLInputElement>;
    headerRowChildren: React.ReactNode;
}) {
    const setMarkerRef = useMapMarkersContextSetMarkerRef();

    // bring marker to front (like riseOnHover) when popup is opened as well
    const localMarkerRef = useRef<L.Marker | null>(null);
    const nonHoveredZIndexRef = useRef<string | null>(null);
    type HandlerFnType = NonNullable<L.LeafletEventHandlerFnMap[keyof L.LeafletEventHandlerFnMap]>;
    type HandlerFnEvtParamType = Parameters<HandlerFnType>[0];
    const hoverOn = (e: HandlerFnEvtParamType) => {
        // console.debug('hoverOn ', e.type);
        const style = localMarkerRef.current?.getElement()?.style;
        if(typeof style !== "undefined" && nonHoveredZIndexRef.current === null) {
            nonHoveredZIndexRef.current = `${style.zIndex}`;
            // boost it arbitrarily way above the others
            style.zIndex = "99999";// + nonHoveredZIndex.current;
        }
    };
    const hoverOff = (e: HandlerFnEvtParamType) => {
        // console.debug('hoverOff ', e.type);
        const style = localMarkerRef.current?.getElement()?.style;
        if(typeof style !== "undefined" && nonHoveredZIndexRef.current !== null) {
            style.zIndex = nonHoveredZIndexRef.current;
            nonHoveredZIndexRef.current = null;
        }
    };
    const popupEventHandlers: L.LeafletEventHandlerFnMap = {
        'popupopen': hoverOn,
        'mouseover': hoverOn,
        'add': hoverOn,
        'popupclose': hoverOff,
        'mouseout': hoverOff, 
        'remove': hoverOff
    }

    let componentCapableIcon: Parameters<typeof ComponentMarker>[0]["icon"] = icon;

    const iconSize: number[] = (
        icon && Array.isArray(icon.options.iconSize) ? icon.options.iconSize
        : icon && icon.options.iconSize instanceof L.Point ? [icon.options.iconSize.x, icon.options.iconSize.y]
        : [32, 32]
    );
    console.debug(iconSize);
    const iconWidth = iconSize[0] ?? 32;
    const iconHeight = iconSize[1] ?? 32;

    if(icon instanceof L.Icon && icon.options.iconUrl && /\/icons\/.+\.[a-z]+$/i.test(icon.options.iconUrl)) {
        componentCapableIcon = <MarkerIconWithPictureSourceFallbacks src={icon.options.iconUrl} width={`${iconWidth}px`} height={`${iconHeight}px`} />;
    }

    return (
        <ComponentMarker
            ref={(instance) => { localMarkerRef.current = instance; setMarkerRef(markerRefKey, instance); }}
            key={markerRefKey} position={position}
            icon={componentCapableIcon}
            riseOnHover={true}
        >
            <Popup eventHandlers={popupEventHandlers}>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center gap-3">
                        <PopupSwitchButtonsWrapper
                            markerRefKey={markerRefKey}
                            // add w-0 if disabled to give header a little more horizontal room,
                            // while still keeping it horizontally justified to the center
                            // due to there still being an element present inside the encompassing flex row
                            popupSwitchButtonConditionalStyling={(previous, enabled) => ({ className: `${previous ? "right-2" : "left-2"} ${!enabled && "w-0"}` })}
                        >
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={popupCheckedState}
                                    onChange={onPopupCheckChange}
                                    className="w-4 h-4"
                                />
                                {headerRowChildren}
                            </div>
                        </PopupSwitchButtonsWrapper>
                    </div>

                    <hr />

                    {children}
                </div>
            </Popup>
        </ComponentMarker>
    );
}

export function MarkerIconWithPictureSourceFallbacks({ src, width, height, style, ...props }: { src: string, width?: string, height?: string } & React.ImgHTMLAttributes<HTMLImageElement>) {
    const strippedExt = src.split('.').slice(0, -1).join('.').replace("/icons/", "/compressed/icons/");
    return (
        <picture>
            <source srcSet={`${strippedExt}_96.webp`} type="image/webp" />
            <source srcSet={`${strippedExt}_96.png`} type="image/png" />
            <img src={src} style={{ ...style, width: width, height: height }} {...props} />
        </picture>
    );
}