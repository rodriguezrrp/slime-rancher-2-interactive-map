import { CurrentMapContext, MapType } from "../CurrentMapContext";
import { createContext, useContext, useEffect, useState } from "react";
import { Marker as ComponentMarker } from "@adamscybot/react-leaflet-component-marker";
import IconWithFallbacks from "./IconWithFallbacks";
import L from "leaflet";
import { LocalStoragePin } from "../types";
import { Popup } from "react-leaflet";
import { icon_template } from "../globals";
import { useUserSelectedPin } from "./UserSelectedPinContext";

export const UserPinsContext = createContext<{
    user_pins: LocalStoragePin[];
    setUserPins: React.Dispatch<React.SetStateAction<LocalStoragePin[]>>;
} | undefined>(undefined);

export function UserPinsProvider({ children }: { children: React.ReactNode }) {
    const [user_pins, setUserPins] = useState<LocalStoragePin[]>(() => {
        let parsed_user_pins: LocalStoragePin[] = [];
        try {
            parsed_user_pins = JSON.parse(localStorage.getItem("user_pins") ?? "[]") ?? [];
        } catch {
            window.alert("Failed to read user pins.");
            parsed_user_pins = [];
        }
        return parsed_user_pins;
    });

    useEffect(() => {
        localStorage.setItem("user_pins", JSON.stringify(user_pins));
    }, [user_pins]);

    return (
        <UserPinsContext.Provider value={{ user_pins, setUserPins }}>
            {children}
        </UserPinsContext.Provider>
    );
}

export function useUserPins() {
    const ctx = useContext(UserPinsContext);
    if (!ctx) throw new Error("useUserPins must be used within a UserPinsProvider");
    return ctx;
}

export function UserPinsList() {
    const { user_pins, setUserPins } = useUserPins();
    const { setSelectedPin } = useUserSelectedPin();
    const { current_map } = useContext(CurrentMapContext);
    // const [selected_pin, setSelectedPin] = useState<Pin | undefined>(undefined);

    const user_pin_list = user_pins.filter((pin: LocalStoragePin) => {
        return pin.dimension === current_map ||
            // This is required to maintain backwards compatibility
            (pin.dimension === undefined && current_map === MapType.overworld);
    }).map((pin: LocalStoragePin) => {
        const key = `${pin.pos.x}${pin.pos.y}`;
        const pinIconOptions: L.IconOptions = {
            ...icon_template,
            iconUrl: `icons/${pin.icon}`,
        };

        const handleClick = () => {
            const new_pins = user_pins.filter(
                (currentMarker) => currentMarker.pos !== pin.pos
            );
            // TODO: If the pin isn't reset, a new pin will be placed when 
            // pressing "Remove".
            setSelectedPin(undefined);
            setUserPins(new_pins);
            localStorage.setItem("user_pins", JSON.stringify(new_pins));
        };

        return (
            <ComponentMarker
                key={key}
                position={[pin.pos.x, pin.pos.y]}
                icon={<IconWithFallbacks iconOptions={pinIconOptions}/>}
                riseOnHover={true}
            >
                <Popup>
                    <button className="border w-[5rem] mt-2 self-end" onClick={handleClick}>Remove</button>
                </Popup>
            </ComponentMarker>
        );
    });

    return user_pin_list;
}