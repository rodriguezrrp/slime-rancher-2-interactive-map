import {
    LocalStoragePlotPlan,
    LocalStorageSitePlan,
    PlannerIcon,
    PlannerIcons,
    PlannerPosition,
    PlotOptions,
} from "../../types";
import { getStoredPlotPlans, handlePlotPlanned } from "../../util";
import { Marker as ComponentMarker } from "@adamscybot/react-leaflet-component-marker";
import IconWithFallbacks from "../IconWithFallbacks";
import L from "leaflet";
import Planner from "./Planner";
import { Popup } from "react-leaflet";
import { icon_template } from "../../globals";
import { planner_positions } from "../../data/plot_planner_positions";
import { plotTypes } from "../../data/pins";
import { useState } from "react";
import { vecToLatLng } from "../../util";

export function PlotPlanner({
    positions,
    site,
    plot,
    retrievedPlotPlan,
}: {
    positions: PlannerPosition;
    site: string;
    plot: number;
    retrievedPlotPlan: LocalStoragePlotPlan;
}) {
    function getSelectedPlotTypeFromRetrievedPlotPlan(): PlotOptions | undefined {
        if (plotPlan !== null && plotPlan.selectedPlotType !== undefined) {
            return plotTypes[plotPlan.selectedPlotType];
        }
        return undefined;
    }

    function getIconsFromRetrievedPlan(): PlannerIcons {
        let plotType;

        if (plotPlan !== null && plotPlan.selectedPlotType !== undefined) {
            plotType = plotTypes[plotPlan.selectedPlotType];
        }

        return {
            left:
                plotType !== undefined &&
                    plotType.optionsA !== undefined &&
                    plotPlan.selectedOptionA !== undefined &&
                    plotType.optionsA[plotPlan.selectedOptionA] !== undefined
                    ? {
                        name: plotType.optionsA[plotPlan.selectedOptionA].name,
                        icon: L.icon({
                            ...icon_template,
                            iconUrl: plotType.optionsA[plotPlan.selectedOptionA].icon,
                        }),
                    }
                    : plotType !== undefined &&
                        (plotType.optionsB === undefined ||
                            (plotType.optionsB !== undefined && plotPlan.selectedOptionB === undefined))
                        ? {
                            name: plotType.name,
                            icon: L.icon({
                                ...icon_template,
                                iconUrl: plotType.icon,
                            }),
                        }
                        : null,
            right:
                plotType !== undefined &&
                    plotType.optionsB !== undefined &&
                    plotPlan.selectedOptionB !== undefined &&
                    plotType.optionsB[plotPlan.selectedOptionB] !== undefined
                    ? {
                        name: plotType.optionsB[plotPlan.selectedOptionB].name,
                        icon: L.icon({
                            ...icon_template,
                            iconUrl: plotType.optionsB[plotPlan.selectedOptionB].icon,
                        }),
                    }
                    : null,
        };
    }

    const invisible_icon: PlannerIcon = {
        name: "invisible",
        icon: L.icon({
            ...icon_template,
            iconUrl: "icons/lockedIcon.png",
        }),
    };

    const [plotPlan, setPlotPlan] = useState<LocalStoragePlotPlan>(retrievedPlotPlan);
    const [plotType, setplotType] = useState<PlotOptions | undefined>(getSelectedPlotTypeFromRetrievedPlotPlan);
    const [icons, setIcons] = useState<PlannerIcons>(getIconsFromRetrievedPlan);

    const doubleIconYOffset = 3.25;

    function handlePlotPlanChange(newPlotPlan: LocalStoragePlotPlan) {
        setPlotPlan(newPlotPlan);
        handlePlotPlanned(site, plot, newPlotPlan);
        retrievedPlotPlan = newPlotPlan;
    }

    const plotTypeName = plotType?.name ? plotType.name : "Choose";

    return (
        <div>
            {icons.left && icons.right ? (
                <div>
                    <ComponentMarker
                        position={vecToLatLng({
                            x: positions.position.x,
                            y: positions.position.y - doubleIconYOffset,
                        })}
                        icon={<IconWithFallbacks iconOptions={icons.left.icon.options} style={{ height: "auto", aspectRatio: "auto" }} />}
                    />
                    <ComponentMarker
                        position={vecToLatLng({
                            x: positions.position.x,
                            y: positions.position.y + doubleIconYOffset,
                        })}
                        icon={<IconWithFallbacks iconOptions={icons.right.icon.options} style={{ height: "auto", aspectRatio: "auto" }} />}
                    />
                </div>
            ) : icons.left ? (
                <ComponentMarker position={vecToLatLng(positions.position)} icon={<IconWithFallbacks iconOptions={icons.left.icon.options} style={{ height: "auto", aspectRatio: "auto" }} />} />
            ) : icons.right ? (
                <ComponentMarker position={vecToLatLng(positions.position)} icon={<IconWithFallbacks iconOptions={icons.right.icon.options} style={{ height: "auto", aspectRatio: "auto" }} />} />
            ) : (
                <></>
            )}

            <ComponentMarker
                position={vecToLatLng(positions.position)}
                icon={invisible_icon.icon}
                opacity={0}
                zIndexOffset={10}
            >
                <Popup>
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center gap-5">
                            <h1 className="ml-2 text-xl font-medium">{plotTypeName}</h1>
                            <select
                                className="bg-btn outline outline-1 p-1"
                                value={
                                    plotPlan !== null && plotPlan.selectedPlotType !== undefined
                                        ? plotPlan.selectedPlotType
                                        : -1
                                }
                                onChange={(e) => {
                                    const plot_index = parseInt(e.target.value, 10);
                                    setIcons({
                                        left:
                                            plot_index !== -1
                                                ? {
                                                    name: (plotTypes[plot_index] as PlotOptions).name,
                                                    icon: L.icon({
                                                        ...icon_template,
                                                        iconUrl: plotTypes[plot_index].icon,
                                                    }),
                                                }
                                                : null,
                                        right: null,
                                    });
                                    setplotType(plotTypes[plot_index]);
                                    handlePlotPlanChange({
                                        selectedPlotType: plot_index !== -1 ? plot_index : undefined,
                                        selectedUpgrades: [],
                                    });
                                }}
                            >
                                <option value={-1}>Empty</option>
                                {plotTypes.map((plotType, index) => (
                                    <option key={index} value={index}>
                                        {plotType.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <hr />

                        <Planner
                            plotType={plotType}
                            icons={icons}
                            setIcons={setIcons}
                            plotPlan={plotPlan}
                            setPlotPlan={handlePlotPlanChange}
                        />
                    </div>
                </Popup>
            </ComponentMarker>
        </div>
    );
}
const storedPlan: LocalStorageSitePlan[] = getStoredPlotPlans();

function getPlotPlanFromSitePlan(
    sitePlan: LocalStorageSitePlan,
    plot: number
): LocalStoragePlotPlan {
    if (sitePlan === undefined || sitePlan.plotPlans[plot] === undefined) {
        return { selectedUpgrades: [] };
    }

    return sitePlan.plotPlans[plot];
}

export const PlotPlanners = Object.keys(planner_positions).flatMap((site) => {
    const retrievedSitePlan: LocalStorageSitePlan = storedPlan.filter(
        (plan) => plan.site === site
    )[0];

    return Object.keys(planner_positions[site]).map((plot) => {
        return (
            <PlotPlanner
                key={`${site}${plot}`}
                positions={planner_positions[site][plot]}
                site={site}
                plot={Number(plot)}
                retrievedPlotPlan={getPlotPlanFromSitePlan(retrievedSitePlan, Number(plot))}
            />
        );
    });
});
