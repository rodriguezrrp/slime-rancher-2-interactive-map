import { useState } from "react";

import { ImageOverlay, LayerGroup, LayersControl, MapContainer, Marker, Popup } from "react-leaflet"
import Map from "/mapv2_square.png";
import L from "leaflet";

import { GordoIcons } from "./components/GordoIcon";
import { LockedDoorIcons } from "./components/LockedDoorIcon";
import { MapNodeIcons } from "./components/MapNodeIcon";
import { TreasurePodIcons } from "./components/TreasurePodIcon";
import { ResearchDroneIcons } from "./components/ResearchDroneIcon";
import { TeleportLineIcons } from "./components/TeleportLineIcon";
import Sidebar from "./components/Sidebar";
import { icon_template } from "./globals";
import { LocalStoragePin, Pin } from "./types";
import { MapUserPins } from "./components/UserPins";

function App() {
    const [show_log, setShowLog] = useState(false);
    const [current_log, setCurrentLog] = useState(<></>);
    const [selected_pin, setSelectedPin] = useState<Pin | undefined>(undefined);
    const [user_pins, setUserPins] = useState<LocalStoragePin[]>(
        JSON.parse(localStorage.getItem("user_pins")) ?? []
    );

    // TODO: Move to its own file.
    const user_pin_list = user_pins.map((pin: LocalStoragePin) => {
        const key = `${pin.pos.x}${pin.pos.y}`;
        const icon = L.icon({
            ...icon_template,
            iconUrl: `icons/${pin.icon}`,
        });

        const handleClick = () => {
            const new_pins = user_pins.filter(
                (currentMarker) => !(currentMarker.pos === pin.pos)
            );
            // TODO: If the pin isn't reset, a new pin will be placed when 
            // pressing "Remove".
            setSelectedPin(undefined);
            setUserPins(new_pins)
            localStorage.setItem("user_pins", JSON.stringify(new_pins));
        };

        return (
            <Marker
                key={key}
                position={[pin.pos.x, pin.pos.y]}
                icon={icon}
            >
                <Popup>
                    <button onClick={handleClick}>Remove</button>
                </Popup>
            </Marker>
        );
    });

    return (
        <div>
            <div
                className="log-container bg-slate-400/50"
                style={{ display: show_log ? "flex" : "none" }}
            >
                {current_log}
            </div>

            <Sidebar selected_pin={selected_pin} setSelectedPin={setSelectedPin} />

            <MapContainer
                center={[66, 110.7]}
                zoom={4}
                zoomControl={false}
                scrollWheelZoom={true}
                maxZoom={7}
                maxBounds={[
                    [0, 0],
                    [200, 200],
                ]}
                style={{ height: "100vh", width: "100%", zIndex: 1 }}
            >
                {selected_pin &&
                    <MapUserPins
                        selected_pin={selected_pin!}
                        user_pins={user_pins}
                        setUserPins={setUserPins}
                    />
                }

                <LayersControl position="topright" collapsed={false}>
                    <LayersControl.Overlay checked name="Slime Gordos">
                        <LayerGroup>{GordoIcons}</LayerGroup>
                    </LayersControl.Overlay>
                    <LayersControl.Overlay checked name="Map Nodes">
                        <LayerGroup>{MapNodeIcons}</LayerGroup>
                    </LayersControl.Overlay>
                    <LayersControl.Overlay checked name="Locked Doors">
                        <LayerGroup>{LockedDoorIcons}</LayerGroup>
                    </LayersControl.Overlay>
                    <LayersControl.Overlay checked name="7-Zee Rewards">
                        <LayerGroup>{TreasurePodIcons}</LayerGroup>
                    </LayersControl.Overlay>
                    <LayersControl.Overlay checked name="Research Drones">
                        <LayerGroup>{ResearchDroneIcons(setShowLog, setCurrentLog)}</LayerGroup>
                    </LayersControl.Overlay>
                    <LayersControl.Overlay checked name="Teleport Lines">
                        <LayerGroup>{TeleportLineIcons}</LayerGroup>
                    </LayersControl.Overlay>
                    <LayersControl.Overlay checked name="User Pins">
                        <LayerGroup>{user_pin_list}</LayerGroup>
                    </LayersControl.Overlay>
                </LayersControl>

                <ImageOverlay
                    url={Map}
                    bounds={[
                        [0, 0],
                        [200, 200],
                    ]}
                />
            </MapContainer>
        </div >
    )
}

export default App