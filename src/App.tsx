import { CurrentMapContext, MapType } from "./CurrentMapContext";
import { GigiHologramIcons, gigiExpressionImageUrls } from "./components/GigiHologramIcon";
import L, { LatLngBoundsExpression, LatLngExpression, LatLngTuple, MapOptions } from "leaflet";
import { LayerGroup, LayersControl, MapContainer, useMap, useMapEvents } from "react-leaflet";

import { useContext, useEffect, useRef, useState } from "react";
import { FaCode } from "react-icons/fa6";
import { GordoIcons } from "./components/GordoIcon";
import { LockedDoorIcons } from "./components/LockedDoorIcon";
import { MapMarkersContextProvider } from "./components/popupUtils";
import { MapNodeIcons } from "./components/MapNodeIcon";
import { MapUserPins } from "./components/UserPins";
import { NullifierDoorIcons } from "./components/NullifierDoorIcon";
import { PlotPlanners } from "./components/planner/PlotPlanner";
import { ProjectorPuzzleIcons } from "./components/ProjectorPuzzleIcon";
import { ResearchDroneIcons } from "./components/ResearchDroneIcon";
import { ShadowDoorIcons } from "./components/ShadowDoorIcon";
import Sidebar from "./components/Sidebar";
import { StabilizingGateIcons } from "./components/StabilizingGateIcon";
import { TeleportLineIcons } from "./components/TeleportLineIcon";
import { TeleportPadIcons } from "./components/TeleportPadIcon";
import { TreasurePodIcons } from "./components/TreasurePodIcon";
import { UserPinsList } from "./components/UserPinsContext";
import { mapCRSsettings } from "./data/map_crs_settings";

// TODO: Ideally, we'd have this centered 0,0 and have the tilemap centered as well.
const map_center: { [key in MapType]: LatLngTuple } = {
    [MapType.overworld]: [-320, 525],
    [MapType.labyrinth]: [1154, 1350],
    [MapType.sr1]: [70, -80]
};

// TODO: This ties in with the `center` property.
const map_bounds: { [key in MapType]: L.LatLngBoundsExpression } = {
    [MapType.overworld]: [
        // [-70, -230],
        // [85, 50]
        // [-3200,-3200],
        // [3200,3200]
        // The y bounds needed to be shoved up by a texture-height (1024 units) due to y being flipped from game coordinates to stitching.
        // Then I added 400 units of margin all around for extra convenience.
        [ -1282 - 400, -819 - 1024 - 400 ].reverse() as [number, number],
        [ 947 + 400, 2048 - 1024 + 400 ].reverse() as [number, number],
    ],
    [MapType.labyrinth]: [
        // [200, -200],
        // [-70, 60]
        // [-3200,-3200],
        // [3200,3200]
        [-6400,-6400],
        [6400,6400]
    ],
    [MapType.sr1]: [
        [100, -150],
        [20, 60]
    ]
};

const map_maxNativeZoom: { [key in MapType]: number } = {
    [MapType.overworld]: 7,
    [MapType.labyrinth]: 6,
    [MapType.sr1]: 6
};

function CursorCoordinates() {
    const { current_map } = useContext(CurrentMapContext);
    const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
    const [zoomLevel, setZoomLevel] = useState<number>(0);
    const [centerCoordinates, setCenterCoordinates] = useState<[number, number] | null>(null);

    const map = useMap();

    useMapEvents({
        mousemove(e) {
            setCoordinates([e.latlng.lat, e.latlng.lng]);
        },
        zoomend(e) {
            setZoomLevel(e.target.getZoom());
        },
        moveend() {
            const center = map.getCenter();
            setCenterCoordinates([center.lat, center.lng]);
        }
    });

    useEffect(() => {
        const center = map.getCenter();
        setCenterCoordinates([center.lat, center.lng]);
    }, [map]);

    return (
        <div
            style={{
                position: "absolute",
                bottom: "20px",
                right: "20px",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                color: "white",
                padding: "5px",
                borderRadius: "5px",
                zIndex: 1000
            }}
        >
            {coordinates ? (
                <div>{`Lat: ${coordinates[0].toFixed(4)}, Lng: ${coordinates[1].toFixed(4)}`}</div>
            ) : (
                <div>Lat: ?, Lng: ?</div>
            )}
            <div>{`Zoom Level: ${zoomLevel}`}</div>
            {centerCoordinates && (
                <div>{`Center: Lat ${centerCoordinates[0].toFixed(4)}, Lng ${centerCoordinates[1].toFixed(4)}`}</div>
            )}
            <div>{`Map center: ${map_center[current_map]}, Map boundaries: ${map_bounds[current_map]}`}</div>
            <div>{`Tileset maxNativeZoom: ${map_maxNativeZoom[current_map]}`}</div>
        </div>
    );
}

// it's here to help controlling the granularity of scroll wheel zooming (chatGPT suggestion tbh :D)
function ConfigureMapOptions() {
    const map = useMap();

    useEffect(() => {
        map.options.wheelPxPerZoomLevel = 240;
    }, [map]);

    return null;
}

/** Listens for changes to the `maxBounds` and `center` properties on the
  * `MapContainer` and updates them dynamically as direct modification is not
  * allowed.
  */
function MapUpdater({
    center,
    maxBounds,
    maxZoom,
    tileLayerOpts,
    crs
}: {
    center: LatLngExpression;
    maxBounds: LatLngBoundsExpression,
    maxZoom: number,
    tileLayerOpts: L.TileLayerOptions & { url: string },
    crs: MapOptions["crs"]
}) {
    const map = useMap();

    useEffect(() => {
        // https://github.com/Leaflet/Leaflet/issues/2553#issuecomment-762271734
        const bounds = map.getBounds();
        map.options.crs = crs;
        // Ensure zoom is not affected by differing CRS scales
        const zoomSnap = map.options.zoomSnap;
        map.options.zoomSnap = 0;
        map.fitBounds(bounds);
        map.options.zoomSnap = zoomSnap;
    }, [crs, map]);

    const tileLayer = useRef<L.TileLayer>();

    useEffect(() => {
        if(tileLayer.current)
            map.removeLayer(tileLayer.current);

        tileLayer.current = L.tileLayer(tileLayerOpts.url, tileLayerOpts);

        if(tileLayer.current)
            map.addLayer(tileLayer.current);
    }, [tileLayerOpts, map]);

    useEffect(() => {
        map.setView(center, 5);
    }, [center, map]);

    useEffect(() => {
        map.setMaxBounds(maxBounds);
    }, [maxBounds, map]);

    useEffect(() => {
        map.setMaxZoom(maxZoom);
    }, [maxZoom, map]);

    return null;
}

/**
 * Tag body with .hasHover CSS class if mouse hovering is applicable (e.g. no touchscreen).
 * 
 * Adapted for React from https://stackoverflow.com/a/30303898
 * */
function useWatchForHoverCapability() {

    // lastTouchTime is used for ignoring emulated mousemove events
    let lastTouchTime = 0;

    function enableHover() {
        if ((new Date()).getTime() - lastTouchTime < 500) return;
        document.body.classList.add("hasHover");
    }

    function disableHover() {
        document.body.classList.remove("hasHover");
    }

    function updateLastTouchTime() {
        lastTouchTime = (new Date()).getTime();
    }

    
    useEffect(() => {
        console.debug("Added hover capability listeners.");
        document.addEventListener("touchstart", updateLastTouchTime, true);
        document.addEventListener("touchstart", disableHover, true);
        document.addEventListener("mousemove", enableHover, true);
        
        return () => {
            console.debug("Removed hover capability listeners.");
            document.removeEventListener("touchstart", updateLastTouchTime, true);
            document.removeEventListener("touchstart", disableHover, true);
            document.removeEventListener("mousemove", enableHover, true);
        };
    }, []);


    enableHover();
}

/** https://stackoverflow.com/a/69325090 */
function preloadImage(src: string) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function () {
            resolve(img);
        };
        img.onerror = img.onabort = function () {
            reject(src);
        };
        img.src = src;
    });
}

/** https://stackoverflow.com/a/69325090 */
function useImagePreloader(imageList: string[]) {
    const [imagesPreloaded, setImagesPreloaded] = useState<boolean>(false);

    useEffect(() => {
        let isCancelled = false;

        async function effect() {
            //   console.log('PRELOAD')

            if (isCancelled) {
                return;
            }

            const imagesPromiseList: Promise<unknown>[] = [];
            for (const i of imageList) {
                imagesPromiseList.push(preloadImage(i));
            }

            await Promise.all(imagesPromiseList);

            if (isCancelled) {
                return;
            }

            setImagesPreloaded(true);
        }

        effect();

        return () => {
            isCancelled = true;
        };
    }, [imageList]);

    return { imagesPreloaded };
}

function App() {
    const [show_log, setShowLog] = useState(false);
    const [current_log, setCurrentLog] = useState(<></>);
    const [advanced_infos, setAdvancedInfos] = useState(false);

    console.debug("in App function");

    // const { selectedPin: selected_pin, setSelectedPin } = useUserSelectedPin();

    // useEffect(() => {
    //     if (selected_pin)
    //         document.body.classList.add("cursor-cell");
    //     else
    //         document.body.classList.remove("cursor-cell");
    // }, []);

    // Todo: are any of these "global" react hooks causing <App> to re-render unnecessarily?
    useImagePreloader(Object.values(gigiExpressionImageUrls));
    useWatchForHoverCapability();
    
    const { current_map } = useContext(CurrentMapContext);

    /// TODO(24-12-24): I dislike having to inject the background image but I'm
    // unsure how to work around this.
    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = `
.leaflet-container {
    ${current_map === MapType.overworld || current_map === MapType.sr1 ? "background-image: url('/map_bg.png') !important; background-color: #005f84 !important;" : ""}
    ${current_map === MapType.labyrinth ? "background-color: #f8d0e3 !important;" : ""}
}
            `;
        document.head.appendChild(styleSheet);

        return () => {
            document.head.removeChild(styleSheet);
        };
    }, [current_map]);

    return (
        <div className="relative">
            <div
                className="log-container bg-slate-400/50"
                style={{ display: show_log ? "flex" : "none" }}
            >
                {current_log}
            </div>

            <FaCode
                size={25}
                onClick={() => setAdvancedInfos(!advanced_infos)}
                className={`absolute bottom-1 left-1 z-10 cursor-pointer transition-opacity duration-300 ${advanced_infos ? "opacity-100" : "opacity-50"}`}
                title="Toggle developer infos"
            />

            <Sidebar />

            <MapContainer
                center={map_center[current_map]}
                zoom={3.5}
                maxZoom={map_maxNativeZoom[current_map] + 1}
                // minZoom={3}
                zoomSnap={0.5}
                zoomDelta={0.5}
                scrollWheelZoom={true}
                maxBounds={map_bounds[current_map]}
                style={{ height: "100vh", width: "100%", zIndex: 1 }}
                crs={mapCRSsettings[current_map].CRS ?? L.CRS.EPSG3857}
            >
                <ConfigureMapOptions />
                {advanced_infos && <CursorCoordinates />}
                <MapUpdater
                    center={map_center[current_map]}
                    maxBounds={map_bounds[current_map]}
                    maxZoom={map_maxNativeZoom[current_map] + 1}
                    tileLayerOpts={{
                        url: `${current_map}/{z}/{x}/{y}.png`,
                        noWrap: true,
                        maxZoom: map_maxNativeZoom[current_map] + 1,
                        maxNativeZoom: map_maxNativeZoom[current_map]
                    }}
                    crs={mapCRSsettings[current_map].CRS ?? L.CRS.EPSG3857}
                />

                <MapMarkersContextProvider>
                    <MapUserPins />

                    <LayersControl position="topright" collapsed={false}>
                        <LayersControl.Overlay checked name="Slime Gordos">
                            <LayerGroup>{GordoIcons(current_map)}</LayerGroup>
                        </LayersControl.Overlay>
                        <LayersControl.Overlay checked name="Map Nodes">
                            <LayerGroup>{MapNodeIcons(current_map)}</LayerGroup>
                        </LayersControl.Overlay>
                        <LayersControl.Overlay checked name="Locked Doors">
                            <LayerGroup>{LockedDoorIcons(current_map)}</LayerGroup>
                        </LayersControl.Overlay>
                        <LayersControl.Overlay checked name="7-Zee Reward Pods">
                            <LayerGroup>{TreasurePodIcons(current_map)}</LayerGroup>
                        </LayersControl.Overlay>
                        <LayersControl.Overlay checked name="Research Drones">
                            <LayerGroup>{ResearchDroneIcons(setShowLog, setCurrentLog, current_map)}</LayerGroup>
                        </LayersControl.Overlay>
                        <LayersControl.Overlay checked name="Teleport Lines">
                            <LayerGroup>{TeleportLineIcons(current_map)}</LayerGroup>
                        </LayersControl.Overlay>
                        <LayersControl.Overlay checked name="Ancient Teleporters">
                            <LayerGroup>{TeleportPadIcons(current_map)}</LayerGroup>
                        </LayersControl.Overlay>
                        <LayersControl.Overlay checked name="Plot Planner">
                            {current_map === MapType.overworld && <LayerGroup>{PlotPlanners}</LayerGroup>}
                        </LayersControl.Overlay>
                        <LayersControl.Overlay checked name="Stabilizing Gates">
                            {current_map === MapType.labyrinth && <LayerGroup>{StabilizingGateIcons}</LayerGroup>}
                        </LayersControl.Overlay>
                        <LayersControl.Overlay checked name="Shadow Doors">
                            {current_map === MapType.labyrinth && <LayerGroup>{ShadowDoorIcons}</LayerGroup>}
                        </LayersControl.Overlay>
                        <LayersControl.Overlay checked name="Nullifier Doors">
                            {current_map === MapType.labyrinth && <LayerGroup>{NullifierDoorIcons}</LayerGroup>}
                        </LayersControl.Overlay>
                        <LayersControl.Overlay checked name="Radiant Projector Puzzles">
                            {current_map === MapType.labyrinth && <LayerGroup>{ProjectorPuzzleIcons}</LayerGroup>}
                        </LayersControl.Overlay>
                        <LayersControl.Overlay checked name="Gigi Holograms">
                            {current_map === MapType.labyrinth && <LayerGroup>{GigiHologramIcons(setShowLog, setCurrentLog)}</LayerGroup>}
                        </LayersControl.Overlay>
                        <LayersControl.Overlay checked name="User Pins">
                            <LayerGroup><UserPinsList /></LayerGroup>
                        </LayersControl.Overlay>
                    </LayersControl>
                </MapMarkersContextProvider>
            </MapContainer>
        </div >
    );
}

export default App;
