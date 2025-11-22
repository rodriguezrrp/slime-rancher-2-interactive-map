import { Marker, Popup } from "react-leaflet";
import { PopupSwitchButtonsWrapper, useMapMarkersContextSetMarkerRef } from "./popupUtils";
import { useRef } from "react";

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
        console.debug('hoverOn ', e.type);
        const style = localMarkerRef.current?.getElement()?.style;
        if(typeof style !== "undefined" && nonHoveredZIndexRef.current === null) {
            nonHoveredZIndexRef.current = `${style.zIndex}`;
            // boost it arbitrarily way above the others
            style.zIndex = "99999";// + nonHoveredZIndex.current;
        }
    };
    const hoverOff = (e: HandlerFnEvtParamType) => {
        console.debug('hoverOff ', e.type);
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

    return (
        <Marker
            ref={(instance) => { localMarkerRef.current = instance; setMarkerRef(markerRefKey, instance); }}
            key={markerRefKey} position={position} icon={icon}
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
        </Marker>
    );
}