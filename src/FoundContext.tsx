import React, { createContext, useState } from "react";
import {
    gigi_hologram_ls_key,
    gordo_ls_key,
    locked_door_ls_key,
    map_node_ls_key,
    nullifier_door_ls_key,
    projector_puzzle_ls_key,
    research_drone_ls_key,
    shadow_door_ls_key,
    stabilizing_gate_ls_key,
    teleport_pad_ls_key,
    treasure_pod_ls_key,
} from "./globals";

export interface Found {
    gordos: string[];
    locked_doors: string[];
    map_nodes: string[];
    treasure_pods: string[];
    research_drones: string[];
    stabilizing_gates: string[];
    shadow_doors: string[];
    nullifier_doors: string[];
    gigi_holograms: string[];
    projector_puzzles: string[];
    teleport_pads: string[];
}

export const FoundContext: React.Context<{
    found: Found,
    setFound: React.Dispatch<React.SetStateAction<Found>>
}> = createContext({
    found: {
        gordos: [],
        locked_doors: [],
        map_nodes: [],
        treasure_pods: [],
        research_drones: [],
        stabilizing_gates: [],
        shadow_doors: [],
        nullifier_doors: [],
        gigi_holograms: [],
        projector_puzzles: [],
        teleport_pads: [],
    } as Found,
    setFound: {} as React.Dispatch<React.SetStateAction<Found>>,
});

export function FoundProvider({ children }: { children: React.ReactNode }) {
    const [found, setFound] = useState<Found>({
        gordos: JSON.parse(localStorage.getItem(gordo_ls_key) ?? "[]") ?? [],
        locked_doors: JSON.parse(localStorage.getItem(locked_door_ls_key) ?? "[]") ?? [],
        map_nodes: JSON.parse(localStorage.getItem(map_node_ls_key) ?? "[]") ?? [],
        treasure_pods: JSON.parse(localStorage.getItem(treasure_pod_ls_key) ?? "[]") ?? [],
        research_drones: JSON.parse(localStorage.getItem(research_drone_ls_key) ?? "[]") ?? [],
        stabilizing_gates: JSON.parse(localStorage.getItem(stabilizing_gate_ls_key) ?? "[]") ?? [],
        shadow_doors: JSON.parse(localStorage.getItem(shadow_door_ls_key) ?? "[]") ?? [],
        nullifier_doors: JSON.parse(localStorage.getItem(nullifier_door_ls_key) ?? "[]") ?? [],
        gigi_holograms: JSON.parse(localStorage.getItem(gigi_hologram_ls_key) ?? "[]") ?? [],
        projector_puzzles: JSON.parse(localStorage.getItem(projector_puzzle_ls_key) ?? "[]") ?? [],
        teleport_pads: JSON.parse(localStorage.getItem(teleport_pad_ls_key) ?? "[]") ?? [],
    });

    return (
        <FoundContext.Provider value={{ found, setFound }}>
            {children}
        </FoundContext.Provider>
    );
}
