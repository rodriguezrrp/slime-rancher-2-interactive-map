import { PlannerPosition, Vec2 } from "../types";

// Reading order - left to right, top to bottom.
export const planner_positions: { [key: string]: { [key: string]: PlannerPosition } } = {
    archway: {
        "0": {
            position: { x: -336.5, y: 740.5 }
        },
        "1": {
            position: { x: -326.5, y: 762.5 }
        },
        "2": {
            position: { x: -311.5, y: 782.5 }
        },
        "3": {
            position: { x: -300.5, y: 726.5 }
        },
        "4": {
            position: { x: -291.5, y: 777.7 }
        }
    },
    conservatory: {
        "0": {
            position: { x: -358.5, y: 494 }
        },
        "1": {
            position: { x: -358.5, y: 511 }
        },
        "2": {
            position: { x: -308, y: 511 }
        },
        "3": {
            position: { x: -308, y: 562 }
        },
        "4": {
            position: { x: -291, y: 494 }
        },
        "5": {
            position: { x: -291, y: 511 }
        },
        "6": {
            position: { x: -291, y: 528 }
        },
        "7": {
            position: { x: -291, y: 562 }
        }
    },
    den: {
        "0": {
            position: { x: -153, y: 615 }
        },
        "1": {
            position: { x: -145, y: 598 }
        },
        "2": {
            position: { x: -127.5, y: 653 }
        },
        "3": {
            position: { x: -120.5, y: 609 }
        },
        "4": {
            position: { x: -120, y: 628 }
        }
    },
    digsite: {
        "0": {
            position: { x: -41, y: 575.5 }
        },
        "1": {
            position: { x: 17, y: 571 }
        },
        "2": {
            position: { x: 35, y: 572.5 }
        },
        "3": {
            position: { x: 53.5, y: 587 }
        }
    },
    gully: {
        "0": {
            position: { x: -537, y: 580 }
        },
        "1": {
            position: { x: -513, y: 541.3 }
        },
        "2": {
            position: { x: -513, y: 567.5 }
        },
        "3": {
            position: { x: -509, y: 604.3 }
        },
        "4": {
            position: { x: -467.8, y: 580.5 }
        }
    },
    tidepools: {
        "0": {
            position: { x: -551.3, y: 702 }
        },
        "1": {
            position: { x: -547.5, y: 738.5 }
        },
        "2": {
            position: { x: -511.2, y: 724 }
        },
        "3": {
            position: { x: -511.2, y: 744.4 }
        },
        "4": {
            position: { x: -483.5, y: 739.1 }
        }
    }
};
