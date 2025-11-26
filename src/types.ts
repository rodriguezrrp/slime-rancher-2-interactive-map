import { MapType } from "./CurrentMapContext";
import { mapCRSsettings } from "./data/map_crs_settings";

export interface Vec2 {
    x: number;
    y: number;
}

export interface Gordo {
    internalId: string;
    name: string;
    food: string;
    pos: Vec2;
    image: string;
    drops: string[];
    description: string;
    unlocks: string[];
    dimension: MapType;
}

export interface LockedDoor {
    internalId?: string;
    type: "door" | "receptacle";
    doorId?: string;
    receptacleIds?: string[];
    name: string;
    plort: string;
    pos: Vec2;
    image: string;
    description: string;
    unlocks: string;
    dimension: MapType;
}

export interface MapNode {
    internalId?: string;
    name: string;
    pos: Vec2;
    description: string;
    dimension: MapType;
}

export interface TreasurePod {
    internalId: string;
    internalName?: string;
    contents: string[];
    description: string;
    pos: Vec2;
    dimension: MapType;
}

export type TranslatedType<T> = { en: T } & { [lang in "es"|"de"|"fr"|"ja"|"ko"|"pt"|"ru"|"zh"]?: T };
export type TranslatedDronePage = TranslatedType<string[]>;

export interface ResearchDrone {
    internalId: string;
    name: string;
    log: TranslatedDronePage[];
    archive: TranslatedDronePage[];
    pos: Vec2;
    description: string;
    dimension: MapType;
}

type OmitByValue<T, V> = {
  [K in keyof T as T[K] extends V ? never : K]: T[K];
};

export interface TeleportLine {
    name: string;
    positions: Vec2[];
    midpoint?: Vec2;
    dimension: keyof OmitByValue<typeof mapCRSsettings, { CRS: null }>;
}

export interface TeleportPad {
    internalId: string,
    name: string;
    description: string;
    image?: string;
    position: Vec2;
    dimension: keyof OmitByValue<typeof mapCRSsettings, { CRS: null }>;
}

export interface Resource {
    name: string;
    type: string;
}

export interface PlotOptions extends Pin {
    optionsA?: Pin[];
    optionsAName?: string;
    optionsB?: Pin[];
    optionsBName?: string;
    upgrades: string[];
}

export type PinTitle = "Food" | "Utility" | "Plorts" | "Slimes" | "Gordos" | "Resources";
export interface Pins {
    Food: Pin[];
    Utility: Pin[];
    Plorts: Pin[];
    Slimes: Pin[];
    Gordos: Pin[];
    Resources: Pin[];
}

// Fields must match those found in `globals` / localstorage, e.g. gordo_ls_key
export interface UserData {
    found_gordos: string[];
    found_locked_doors: string[];
    found_map_nodes: string[];
    found_research_drones: string[];
    found_treasure_pods: string[];
    found_stabilizing_gates: string[];
    found_shadow_doors: string[];
    found_gigi_holograms: string[];
    found_projector_puzzles: string[];
    found_teleport_pads: string[];
    found_nullifier_doors: string[];
}

export interface Pin {
    name: string;
    type: string;
    icon: string;
}

export interface LocalStoragePin {
    icon: string;
    pos: Vec2;
    dimension: MapType;
}

export interface LocalStoragePlotPlan {
    selectedPlotType?: number;
    selectedOptionA?: number;
    selectedOptionB?: number;
    selectedUpgrades: number[];
}

export interface LocalStorageSitePlan {
    site: string;
    plotPlans: LocalStoragePlotPlan[];
}

export interface Island {
    resources: string[];
    slimes: string[];
    food: string[];
}

export interface PlannerPosition {
    position: Vec2;
}

export interface PlannerIcon {
    name: string;
    icon: L.Icon<L.IconOptions>;
}

export interface PlannerIcons {
    left: PlannerIcon | null;
    right: PlannerIcon | null;
}

export interface StabilizingGate {
    internalId: string;
    position: Vec2;
    description: string;
}

export interface NullifierDoor {
    position: Vec2;
    description: string;
}

export interface ShadowDoor {
    internalId: string;
    internalName?: string;
    position: Vec2;
    description: string;
    amount_required: number;
    unlocks: string[];
}

export type GigiExpression = "surprised1" | "happy1" | "thinking1" | "pointing1" | "cheery1" | "sad1" | "sad2" | "sad3" | "pensive1" | "pensive2";
interface GigiDialogueEntryBase {
    internalTranslationId?: string;
    text: TranslatedType<string>;
    italics?: boolean,
    expression?: GigiExpression;
}
export interface GigiDialogueToTextEntry extends GigiDialogueEntryBase {
    nextTextById?: string;
}
export interface GigiDialogueToOptionsEntry extends GigiDialogueEntryBase {
    nextOptionsById: string[];
}

export interface GigiHologram {
    internalId?: string;
    name: string;
    position: Vec2;
    description: string;
    dialogue?: {
        firstVisitStartEntryId: string;
        labeledAltEntrypoints?: { [label: string]: string };
        entries: {
            [id: string]: GigiDialogueToTextEntry | GigiDialogueToOptionsEntry;
        }
    }
}

export interface ProjectorPuzzle {
    unlocks: string[];
    name: string;
    startPoint?: {
        id: string;
        nameSuffix: string;
        position: Vec2;
        description: string;
    }
    endPoint?: {
        id: string;
        nameSuffix: string;
        position: Vec2;
        description: string;
    }
}
