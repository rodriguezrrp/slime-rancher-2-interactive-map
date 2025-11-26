import { PopupSwitchButtonsWrapper, useMapMarkersContextSetMarkerRef } from "./popupUtils";
import { Marker as ComponentMarker } from "@adamscybot/react-leaflet-component-marker";
import IconWithFallbacks from "./IconWithFallbacks";
import L from "leaflet";
import { Popup } from "react-leaflet";
import { useRef } from "react";

export default function MarkerAndPopupTemplate({
    children,
    markerRefKey,
    position,
    iconOptions,
    popupCheckedState,
    onPopupCheckChange,
    headerRowChildren,
}: {
    children: React.ReactNode;
    markerRefKey: string;
    position: L.LatLngExpression;
    iconOptions: L.IconOptions;
    popupCheckedState: boolean;
    onPopupCheckChange: React.ChangeEventHandler<HTMLInputElement>;
    headerRowChildren: React.ReactNode;
}) {
    const setMarkerRef = useMapMarkersContextSetMarkerRef();

    // bring marker to front (like riseOnHover) when popup is opened as well
    const localMarkerRef = useRef<L.Marker | null>(null);
    const nonHoveredZIndexRef = useRef<string | null>(null);
    const hoverOn = () => {
        // console.debug('hoverOn ', e.type);
        const style = localMarkerRef.current?.getElement()?.style;
        if(typeof style !== "undefined" && nonHoveredZIndexRef.current === null) {
            nonHoveredZIndexRef.current = `${style.zIndex}`;
            // boost it arbitrarily way above the others
            style.zIndex = "99999";// + nonHoveredZIndex.current;
        }
    };
    const hoverOff = () => {
        // console.debug('hoverOff ', e.type);
        const style = localMarkerRef.current?.getElement()?.style;
        if(typeof style !== "undefined" && nonHoveredZIndexRef.current !== null) {
            style.zIndex = nonHoveredZIndexRef.current;
            nonHoveredZIndexRef.current = null;
        }
    };
    const popupEventHandlers: L.LeafletEventHandlerFnMap = {
        "popupopen": hoverOn,
        "mouseover": hoverOn,
        "add": hoverOn,
        "popupclose": hoverOff,
        "mouseout": hoverOff, 
        "remove": hoverOff
    };

    let componentCapableIcon: Parameters<typeof ComponentMarker>[0]["icon"];
    let madeDefaultIcon: boolean;    

    if(iconOptions && iconOptions.iconUrl && /\/icons\/.+\.[a-z]+$/i.test(iconOptions.iconUrl)) {
        const iconSize: number[] = (
            iconOptions && Array.isArray(iconOptions.iconSize) ? iconOptions.iconSize
            : iconOptions && iconOptions.iconSize instanceof L.Point ? [iconOptions.iconSize.x, iconOptions.iconSize.y]
            : [32, 32]
        );
        const iconWidth = iconSize[0] ?? 32;
        const iconHeight = iconSize[1] ?? 32;

        componentCapableIcon = <IconWithFallbacks src={iconOptions.iconUrl} expectedSize={[iconWidth, iconHeight]} />;
        madeDefaultIcon = false;
    }
    else {
        componentCapableIcon = L.icon(iconOptions);
        madeDefaultIcon = true;
    }

    return (
        <ComponentMarker
            ref={(instance) => { localMarkerRef.current = instance; setMarkerRef(markerRefKey, instance); }}
            key={markerRefKey} position={position}
            icon={componentCapableIcon}
            riseOnHover={true}
            componentIconOpts={(!madeDefaultIcon && iconOptions.iconSize) ? {
                layoutMode: "fit-parent",
                rootDivOpts: iconOptions as Required<Pick<typeof iconOptions, "iconSize">> & Omit<typeof iconOptions, "iconSize">,
            } : undefined}
        >
            <Popup eventHandlers={popupEventHandlers}>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center gap-3">
                        <PopupSwitchButtonsWrapper
                            markerRefKey={markerRefKey}
                            popupSwitchButtonConditionalStyling={(previous, enabled) => (
                                // for the popup-switching buttons:
                                // add w-0 if disabled to give header a little more horizontal room,
                                // while still keeping it horizontally justified to the center
                                // due to there still being an element present inside the encompassing flex row
                                { className: `${previous ? "right-2" : "left-2"} ${!enabled && "w-0"}` }
                            )}
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

