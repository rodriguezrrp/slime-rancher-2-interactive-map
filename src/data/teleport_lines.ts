import { MapType } from "../CurrentMapContext";
import { TeleportLine } from "../types";

export const teleport_lines: { [key: string]: TeleportLine } = {
    "line_Conservatory_Arboretum_Gorge": {
        name: "Todo: insert a name for this teleporter line line_Conservatory_Arboretum_Gorge",
        dimension: MapType.overworld,
        positions: [
            { x: -391.32, y: 28.990009999999984 },
            { x: -463.6939042629503, y: -205.30958241841563 }
        ],
        midpoint: { x: -450, y: -88 }
    },
    "line_GorgeGateTransfer_BluffsNavigation": {
        name: "Todo: insert a name for this teleporter line line_GorgeGateTransfer_BluffsNavigation",
        dimension: MapType.overworld,
        positions: [
            { x: -234.5980921945242, y: -624.9159343018114 },
            { x: -1655.3422646888146, y: -618.8851018536452 }
        ],
        midpoint: { x: -1050, y: -840 }
    },
    "line_GorgeNavigation_Bluffs": {
        name: "Todo: insert a name for this teleporter line line_GorgeNavigation_Bluffs",
        dimension: MapType.overworld,
        positions: [
            { x: -767.745936082538, y: -699.5367929140971 },
            { x: -1343.1115851111438, y: -708.4533891542853 }
        ],
        midpoint: { x: -1055.428760596841, y: -750 }
    },
    "line_GorgeNavigation_Conservatory_Digsite": {
        name: "Todo: insert a name for this teleporter line line_GorgeNavigation_Conservatory_Digsite",
        dimension: MapType.overworld,
        positions: [
            { x: -884.0700671476657, y: -581.5115297610962 },
            { x: -526.8301539258165, y: 269.69751675386937 }
        ],
        midpoint: { x: -805, y: -142 }
    },
    "line_LabyrinthCorePath_LabyrinthHub_C": {
        name: "Todo: insert a name for this teleporter line line_LabyrinthCorePath_LabyrinthHub_C",
        dimension: MapType.labyrinth,
        positions: [
            { x: 407.0752270849671, y: 1465.0055712162446 },
            { x: 293.9796000512331, y: 1457.50102662475 }
        ],
        midpoint: { x: 350.5274135681001, y: 1461.2532989204974 }
    },
    "line_LabyrinthHub_LabyrinthWeather": {
        name: "Todo: insert a name for this teleporter line line_LabyrinthHub_LabyrinthWeather",
        dimension: MapType.labyrinth,
        positions: [
            { x: 383.2116448162886, y: 917.3351884933705 },
            { x: 46, y: 1311 },
            { x: 153, y: 1727 },
            { x: 769.2033059782564, y: 1874.6343695132564 }
        ]
    },
    "line_StrandNavigation_Conservatory_Digsite": {
        name: "Todo: insert a name for this teleporter line line_StrandNavigation_Conservatory_Digsite",
        dimension: MapType.overworld,
        positions: [
            { x: 529.4325760462142, y: 336.66512683503964 },
            { x: -144.28200645349517, y: 331.3684569836389 }
        ],
        midpoint: { x: 170, y: 425 }
    },
    "line_Strand_Conservatory_Arboretum": {
        name: "Todo: insert a name for this teleporter line line_Strand_Conservatory_Arboretum",
        dimension: MapType.overworld,
        positions: [
            { x: 120.56663535451779, y: -6.602006493686105 },
            { x: -159.20999999999998, y: 45.67000999999999 }
        ],
        midpoint: { x: -48, y: 1 }
    }
};
