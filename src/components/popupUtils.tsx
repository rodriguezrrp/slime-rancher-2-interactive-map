import { AiFillCaretLeft, AiFillCaretRight } from "react-icons/ai";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import L from "leaflet";
import { icon_template } from "../globals";
import { useMapEvents } from "react-leaflet";

/*
 * TODO: Known issues remaining: 
 * - 1) Checking/unchecking the popup edits the z-index of the marker (undoing the forced bring-to-front behavior). 
 * - 2) Given a current marker A, a target B (close to A), and an extra C, may not be able to navigate
 *        from marker A to B if extra marker C is 'closer' to A but too far away from B;
 *        B would go to A, but A would go back to C.
 *      (My solution idea is to process markers into clumps upon map zoomend, and buttons would get the next or previous marker in its clump)
 */

export type MapMarkerSwitchingProps = {
    setMarkerRef: (markerRefKey: string, instance: L.Marker | null) => void;
    hasNearbyMarker: (markerRefKey: string, previous: boolean) => boolean;
    changeToNearbyPopup: (markerRefKey: string, previous: boolean) => L.Marker | null;
};

const maxNgbrScreenDistancePx = Math.min(...(
    Array.isArray(icon_template.iconSize) ? icon_template.iconSize
    : icon_template.iconSize instanceof L.Point ? [icon_template.iconSize.x, icon_template.iconSize.y]
    : [32]
)) * 2/3;

console.debug("maxNgbrScreenDistancePx: ", maxNgbrScreenDistancePx);

const MapMarkersContext = createContext<MapMarkerSwitchingProps>(null as unknown as MapMarkerSwitchingProps);

function useSelectedContextValue<C, T>(contextToUse: React.Context<C>, selector: (ctxValue: C) => T) {
    const context = useContext(contextToUse);
    const selectedValue = selector(context);
    return selectedValue;
}

// export const useMapMarkersContext = () => useContext(MapMarkersContext);
export const useMapMarkersContextSetMarkerRef = () => useContext(MapMarkersContext).setMarkerRef;
export const useMarkerHasSibling = (markerRefKey: string, previous: boolean) => {
    return useSelectedContextValue(MapMarkersContext, value => value.hasNearbyMarker(markerRefKey, previous));
};

function _makeMapMarkerSwitchingProps(map: L.Map, markerRefsMappingRef: React.MutableRefObject<{ [markerRefKey: string]: L.Marker | null }>): MapMarkerSwitchingProps {
    
    const getNearbyMarkers = (markerRefKeyOrMarkerPos: string | L.LatLngExpression) => {
        // console.debug(`getNearbyMarkers - markerRefsMappingRef.current ${JSON.stringify(markerRefsMappingRef.current)}`)
        // console.debug(`getNearbyMarkers - markerRefsMappingRef.current keys ${JSON.stringify(Object.keys(markerRefsMappingRef.current))}`)
        if(!markerRefsMappingRef.current)
            return [];
        let thisLatLng;
        if(typeof markerRefKeyOrMarkerPos === "string") {
            const marker = markerRefsMappingRef.current[markerRefKeyOrMarkerPos];
            // console.debug(`getNearbyMarkers - marker ${marker}`)
            if(marker === null)
                return [];
            thisLatLng = marker.getLatLng();
        } else {
            thisLatLng = markerRefKeyOrMarkerPos;
        }
        const thisScreenPos = map.latLngToContainerPoint(thisLatLng);
        const neighbors = Object.entries(markerRefsMappingRef.current)
            .filter((entry): entry is [string, L.Marker] => {
                const [, otherMarker] = entry;
                if(otherMarker === null) return false;
                if(!otherMarker.getElement()?.checkVisibility()) {
                    // if the marker html element is not visible (e.g., if the marker is hidden by layer toggle)
                    return false;
                }
                const otherLatLng = otherMarker.getLatLng();
                const otherScreenPos = map.latLngToContainerPoint(otherLatLng);
                return otherScreenPos.distanceTo(thisScreenPos) <= maxNgbrScreenDistancePx;
            })
            .sort((e1, e2) => {
                const m1 = e1[1];
                const m2 = e2[1];
                // sort by their longitude value, from left to right, then by latitude
                const lngDiff = m1!.getLatLng().lng - m2!.getLatLng().lng;
                return lngDiff !== 0 ? lngDiff : m1!.getLatLng().lat - m2!.getLatLng().lat;
            });
        return neighbors;
    };

    const getNearestMarkerInDirection = (markerRefKey: string, previous: boolean): [string, L.Marker] | null => {
        const neighbors = getNearbyMarkers(markerRefKey);
        const selfInd = neighbors.findIndex(entry => entry[0] === markerRefKey);
        if(selfInd < 0) return null;
        if(previous) {
            if(selfInd <= 0) return null;
            return neighbors[selfInd - 1];
        }
        else {
            if(selfInd >= neighbors.length - 1) return null;
            return neighbors[selfInd + 1];
        }
    };

    const setMarkerRef = (markerRefKey: string, instance: L.Marker | null) => {
        markerRefsMappingRef.current = {
            ...markerRefsMappingRef.current,
            [markerRefKey]: instance
        };
    };

    const changeToNearbyPopup = (markerRefKey: string, previous: boolean): L.Marker | null => {
        const neighborResult = getNearestMarkerInDirection(markerRefKey, previous);
        if(neighborResult === null) return null;
        markerRefsMappingRef.current?.[markerRefKey]?.closePopup();
        neighborResult[1].openPopup();
        return neighborResult[1];
    };

    const hasNearbyMarker = (markerRefKey: string, previous: boolean): boolean => {
        const neighborResult = getNearestMarkerInDirection(markerRefKey, previous);
        return neighborResult === null ? false : !!neighborResult[1];
    };

    return {
        setMarkerRef,
        changeToNearbyPopup,
        hasNearbyMarker
    };

}

export function MapMarkersContextProvider({ children }: { children: React.ReactNode }) {

    const [mapZoom, setMapZoom] = useState<number | null>(null);

    // Similar to the mapZoom state, I am tracking an array of the map's active layers
    //   just to re-trigger the useEffect that recreates the MapMarkersContext value.
    // (Conceptually, the neighbors of a marker could change when a layer gets added or removed (shown / hidden)!)
    const [mapLayers, setMapLayers] = useState<L.Layer[] | null>(null);

    const reconstructLayersArr = () => {
        const arr: L.Layer[] = [];
        map.eachLayer(layer => arr.push(layer));
        setMapLayers(arr);
    };

    const map = useMapEvents({
        "zoomend": () => {
            if(map.getZoom() !== mapZoom) {
                setMapZoom(map.getZoom());
            }
        },
        "layeradd": reconstructLayersArr,
        "layerremove": reconstructLayersArr,
    });
    
    const markerRefsMapping = useRef<{ [markerRefKey: string]: L.Marker | null }>({ });

    const [propsCtxValue, setPropsCtxValue] = useState<MapMarkerSwitchingProps>(() => _makeMapMarkerSwitchingProps(map, markerRefsMapping));

    // console.debug('in MapMarkersContextProvider');

    useEffect(() => {
        // console.debug('in MapMarkersContextProvider useEffect');
        setPropsCtxValue(_makeMapMarkerSwitchingProps(map, markerRefsMapping));
    }, [mapZoom, mapLayers, map, markerRefsMapping, setPropsCtxValue]);

    return (
        <MapMarkersContext.Provider value={propsCtxValue}>
            {children}
        </MapMarkersContext.Provider>
    );
    
}

export function PopupSwitchButton({ previous, onButtonClick, enabled: enabled, popupSwitchButtonConditionalStyling, popupButtonProps }: { previous: boolean, onButtonClick: (previous: boolean) => void, enabled: boolean, popupSwitchButtonConditionalStyling?: (previous: boolean, enabled: boolean) => { className?: string, style?: React.HTMLAttributes<HTMLButtonElement>["style"] }; popupButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement> }) {
    const condStyling = popupSwitchButtonConditionalStyling?.(previous, enabled);

    return <button
        disabled={!enabled}
        onClick={() => onButtonClick(previous)}
        aria-label={`Open popup for ${previous ? "previous" : "next"} nearby marker on map`}
        title={`Open popup of ${previous ? "previous" : "next"} nearby marker`}
        {...popupButtonProps}
        style={{ visibility: enabled ? "visible" : "hidden", ...popupButtonProps?.style, ...condStyling?.style }}
        className={`p-1 relative self-center bg-transparent border-[1px] border-transparent hover:border-white focus:border-white text-white ${popupButtonProps?.className || ""} ${condStyling?.className || ""}`}
    >
        {
            previous
                ? <AiFillCaretLeft aria-hidden="true"/>
                : <AiFillCaretRight aria-hidden="true"/>
        }
    </button>;
}

export function PopupSwitchButtonsWrapper({
    children,
    markerRefKey,
    popupSwitchButtonConditionalStyling,
    popupButtonProps
}: {
    children: React.ReactNode;
    markerRefKey: string;
    popupSwitchButtonConditionalStyling?: (previous: boolean, enabled: boolean) => { className?: string | undefined; style?: React.CSSProperties | undefined };
    popupButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
}) {

    const hasPrev = useMarkerHasSibling(markerRefKey, true);
    const hasNext = useMarkerHasSibling(markerRefKey, false);
    const changeToNearbyPopup = useSelectedContextValue(MapMarkersContext, value => value.changeToNearbyPopup);

    const onPopupSwitchButtonClick = (previous: boolean) => {
        changeToNearbyPopup(markerRefKey, previous);
    };

    return (<>
        {<PopupSwitchButton previous={true} enabled={hasPrev} onButtonClick={onPopupSwitchButtonClick} popupSwitchButtonConditionalStyling={popupSwitchButtonConditionalStyling} popupButtonProps={popupButtonProps} />}
        {children}
        {<PopupSwitchButton previous={false} enabled={hasNext} onButtonClick={onPopupSwitchButtonClick} popupSwitchButtonConditionalStyling={popupSwitchButtonConditionalStyling} popupButtonProps={popupButtonProps} />}
    </>);

}