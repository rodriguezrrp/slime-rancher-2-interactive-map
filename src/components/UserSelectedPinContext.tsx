import React, { ReactNode, createContext, useContext, useState } from "react";
import { Pin } from "../types";

type UserSelectedPinContextType = {
    selectedPin?: Pin;
    setSelectedPin: React.Dispatch<React.SetStateAction<Pin | undefined>>;
};

const UserSelectedPinContext = createContext<UserSelectedPinContextType | undefined>(undefined);

export function UserSelectedPinProvider({ children }: { children: ReactNode }) {
    const [selectedPin, setSelectedPin] = useState<Pin | undefined>(undefined);

    return (
        <UserSelectedPinContext.Provider value={{ selectedPin, setSelectedPin }}>
            {children}
        </UserSelectedPinContext.Provider>
    );
}

export function useUserSelectedPin() {
    const ctx = useContext(UserSelectedPinContext);
    if (!ctx) throw new Error("useUserSelectedPin must be used within UserSelectedPinProvider");
    return ctx;
}

export default UserSelectedPinContext;
