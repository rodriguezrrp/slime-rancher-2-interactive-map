import { PopupSwitchButtonsWrapper, useMapMarkersContextSetMarkerRef } from "./popupUtils";
import { useRef, useState } from "react";
import { Marker as ComponentMarker } from "@adamscybot/react-leaflet-component-marker";
import { Popup } from "react-leaflet";
import L from "leaflet";
import { icon_opacity } from "../globals";

export default function MarkerAndPopupTemplate({
    children,
    markerRefKey,
    position,
    icon,
    popupCheckedState,
    onPopupCheckChange,
    headerRowChildren,
}: {
    children: React.ReactNode;
    markerRefKey: string;
    position: L.LatLngExpression;
    icon: L.MarkerOptions["icon"];
    popupCheckedState: boolean;
    onPopupCheckChange: React.ChangeEventHandler<HTMLInputElement>;
    headerRowChildren: React.ReactNode;
}) {
    const setMarkerRef = useMapMarkersContextSetMarkerRef();

    // bring marker to front (like riseOnHover) when popup is opened as well
    const localMarkerRef = useRef<L.Marker | null>(null);
    const nonHoveredZIndexRef = useRef<string | null>(null);
    type HandlerFnType = NonNullable<L.LeafletEventHandlerFnMap[keyof L.LeafletEventHandlerFnMap]>;
    type HandlerFnEvtParamType = Parameters<HandlerFnType>[0];
    const hoverOn = (e: HandlerFnEvtParamType) => {
        // console.debug('hoverOn ', e.type);
        const style = localMarkerRef.current?.getElement()?.style;
        if(typeof style !== "undefined" && nonHoveredZIndexRef.current === null) {
            nonHoveredZIndexRef.current = `${style.zIndex}`;
            // boost it arbitrarily way above the others
            style.zIndex = "99999";// + nonHoveredZIndex.current;
        }
    };
    const hoverOff = (e: HandlerFnEvtParamType) => {
        // console.debug('hoverOff ', e.type);
        const style = localMarkerRef.current?.getElement()?.style;
        if(typeof style !== "undefined" && nonHoveredZIndexRef.current !== null) {
            style.zIndex = nonHoveredZIndexRef.current;
            nonHoveredZIndexRef.current = null;
        }
    };
    const popupEventHandlers: L.LeafletEventHandlerFnMap = {
        "popupopen": hoverOn,
        "mouseover": hoverOn,
        "add": hoverOn,
        "popupclose": hoverOff,
        "mouseout": hoverOff, 
        "remove": hoverOff
    };

    let componentCapableIcon: Parameters<typeof ComponentMarker>[0]["icon"] = icon;

    const iconSize: number[] = (
        icon && Array.isArray(icon.options.iconSize)
            ? icon.options.iconSize
            : icon && icon.options.iconSize instanceof L.Point
                ? [icon.options.iconSize.x, icon.options.iconSize.y]
                : [32, 32]
    );
    // console.debug(iconSize);
    const iconWidth = iconSize[0] ?? 32;
    const iconHeight = iconSize[1] ?? 32;

    const [labelDir, setLabelDir] = useState<"up" | "down" | "left" | "right">("up");

    const dirsToClassNameMap: Record<"up" | "down" | "left" | "right", NonNullable<React.HTMLAttributes<HTMLDivElement>>["className"]> = {
        // "up": "",
        // "down": "",
        // "left": "",
        // "right": "",
        "up": "bottom-full left-1/2 -translate-x-1/2 mb-1",
        "down": "top-full left-1/2 -translate-x-1/2 mt-1",
        "left": "right-full top-1/2 -translate-y-1/2 mr-1",
        "right": "left-full top-1/2 -translate-y-1/2 ml-1"
    };

    const googleSheetIdMap = {
        "treasure_luminousstrand_pod1359946455": "#1",
        "treasure_rainbowfields_pod1210187464": "#2",
        "treasure_rainbowfields_pod1958610754": "#3",
        "teleporter_Bluffs_x-1343_y-709": "#4",
        "teleporter_BluffsNavigation_x-1655_y-619": "#5",
        "teleporter_Conservatory_Arboretum_x-162_y50": "#6",
        "teleporter_Conservatory_Arboretum_x-394_y33": "#7",
        "teleporter_Conservatory_Digsite_x-147_y335": "#8",
        "teleporter_Conservatory_Digsite_x-529_y274": "#9",
        "teleporter_Conservatory_Garden_x-284_y52": "#10",
        "teleporter_ConservatoryFields_x-236_y525": "#11",
        "teleporter_Gorge_Vista_x-499_y-1153": "#12",
        "teleporter_Gorge_x-463_y-206": "#13",
        "teleporter_GorgeGateTransfer_x-234_y-625": "#14",
        "teleporter_GorgeNavigation_x-767_y-700": "#15",
        "teleporter_GorgeNavigation_x-884_y-582": "#16",
        "teleporter_LabStrandEntranceDESIGN_x1154_y1953": "#17",
        "teleporter_LabStrandEntranceMain_B_x1132_y994": "#18",
        "teleporter_LabyrinthCorePath_x408_y1465": "#19",
        "teleporter_LabyrinthHub_B_x950_y1449": "#20",
        "teleporter_LabyrinthHub_C_x160_y2247": "#21",
        "teleporter_LabyrinthHub_x384_y917": "#22",
        "teleporter_LabyrinthWeather_x770_y1874": "#23",
        "teleporter_Strand_Vista_x875_y222": "#24",
        "teleporter_Strand_x121_y-7": "#25",
        "teleporter_StrandNavigation_x530_y336": "#26",
        "line_Conservatory_Arboretum_Gorge": "#27",
        "line_GorgeGateTransfer_BluffsNavigation": "#28",
        "line_GorgeNavigation_Bluffs": "#29",
        "line_GorgeNavigation_Conservatory_Digsite": "#30",
        "line_LabyrinthCorePath_LabyrinthHub_C": "#31",
        "line_LabyrinthHub_LabyrinthWeather": "#32",
        "line_Strand_Conservatory_Arboretum": "#33",
        "line_StrandNavigation_Conservatory_Digsite": "#34",
        "stabilizinggate_stabilizinggate0148392974": "#35",
        "stabilizinggate_stabilizinggate1172010955": "#36",
        "shadowdoor_plortdepo0848528777": "#37",
        "shadowdoor_plortdepo0888553246": "#38",
        "shadowdoor_plortdepo0983262903": "#39",
        "shadowdoor_plortdepo1514039874": "#40",
        "shadowdoor_plortdepo1585516932": "#41",
        "shadowdoor_plortdepo1639552273": "#42",
        "projectorpuzzle_dreamland_entrance_geyser_puzzle": "#43",
        "projectorpuzzle_dreamland_entrance_wall_tower_puzzle": "#44",
        "projectorpuzzle_dreamland_pergola_room": "#45",
        "projectorpuzzle_dreamland_wall_door_1": "#46",
        "projectorpuzzle_dreamland_wall_door_2": "#47",
        "projectorpuzzle_dreamland_windmill_hill": "#48",
        "projectorpuzzle_hub_puzzle_tower": "#49",
        "projectorpuzzle_terrarium_center_to_east": "#50",
        "projectorpuzzle_terrarium_east_to_center": "#51",
        "projectorpuzzle_terrarium_entry": "#52",
        "nullifierdoor_x1020_y1954": "#53",
        "nullifierdoor_x1082_y1870": "#54",
        "nullifierdoor_x1323_y1316": "#55",
        "nullifierdoor_x1356_y1111": "#56",
        "nullifierdoor_x1357_y1001": "#57",
        "nullifierdoor_x1488_y1354": "#58",
        "nullifierdoor_x409_y728": "#59",
        "nullifierdoor_x431_y941": "#60",
        "nullifierdoor_x593_y996": "#61",
        "nullifierdoor_x740_y2113": "#62",
        "nullifierdoor_x786_y1875": "#63",
        "nullifierdoor_x800_y2039": "#64",
        "nullifierdoor_x891_y1909": "#65",
        "nullifierdoor_x931_y1468": "#66",
        "nullifierdoor_x987_y842": "#67",
        "nullifierdoor_x989_y834": "#68",
        "nullifierdoor_x990_y1844": "#69",
        "locked_zonegorgenavigation_puz0194168418": "#70",
        "locked_zonegorgenavigation_puz1378549307": "#71",
        "locked_zonelabstrandentrancedesign_puz1696095484": "#72",
        "locked_zonerainbowcore_puz0105158232": "#73",
        "locked_zonerainbowcore_puz0257618133": "#74",
        "lockeddoor_environmentgorge_puzzlelock0136459905": "#75",
        "lockeddoor_environmentstrand_puzzlelock0133494774": "#76",
        "lockeddoor_environmentstrand_puzzlelock0472447112": "#77",
        "lockeddoor_environmentstrand_puzzlelock1960975923": "#78",
        "lockeddoor_zoneconservatoryarboretum_puzzlelock0438051759": "#79",
        "lockeddoor_zonegorgegatetransfer_puzzlelock0982098626": "#80",
        "lockeddoor_zonegorgenavigation_puzzlelock0554385439": "#81",
        "lockeddoor_zonegorgenavigation_puzzlelock1383942904": "#82",
        "lockeddoor_zonegorgeweather_puzzlelock0039039033": "#83",
        "lockeddoor_zonelabstrandentrance_puzzlelock0469363929": "#84",
        "lockeddoor_zonelabstrandentrancedesign_puzzlelock0613399195": "#85",
        "lockeddoor_zonelabstrandentrancedesign_puzzlelock0964624336": "#86",
        "lockeddoor_zonelabstrandentrancedesign_puzzlelock1060786563": "#87",
        "lockeddoor_zonelabstrandentrancedesign_puzzlelock1071849493": "#88",
        "lockeddoor_zonelabstrandentrancedesign_puzzlelock1215647778": "#89",
        "lockeddoor_zonelabstrandentrancedesign_puzzlelock1355797245": "#90",
        "lockeddoor_zonelabstrandentrancedesign_puzzlelock1907608575": "#91",
        "lockeddoor_zonelabstrandentrancemainb_puzzlelock1447897039": "#92",
        "lockeddoor_zonelabstrandentrancemainb_puzzlelock1656042506": "#93",
        "lockeddoor_zonelabstrandentrancemainb_puzzlelock1991737884": "#94",
        "lockeddoor_zonelabyrinthdisruptiontest_puzzlelock1050181413": "#95",
        "lockeddoor_zonelabyrinthdreamlandb_puzzlelock0832500514": "#96",
        "lockeddoor_zonelabyrinthdreamlandb_puzzlelock1668742734": "#97",
        "lockeddoor_zonelabyrinthdreamlandb_puzzlelock2081200745": "#98",
        "lockeddoor_zonelabyrinthdreamlandc_puzzlelock1074301965": "#99",
        "lockeddoor_zonelabyrinthdreamlanddesign_puzzlelock0149444268": "#100",
        "lockeddoor_zonelabyrinthdreamlanddesign_puzzlelock0312054777": "#101",
        "lockeddoor_zonelabyrinthdreamlanddesign_puzzlelock1045124157": "#102",
        "lockeddoor_zonelabyrinthdreamlanddesign_puzzlelock1111370558": "#103",
        "lockeddoor_zonelabyrinthhub_puzzlelock1797201574": "#104",
        "lockeddoor_zonelabyrinthhubb_puzzlelock0425896758": "#105",
        "lockeddoor_zonelabyrinthhubb_puzzlelock0544941896": "#106",
        "lockeddoor_zonelabyrinthhubb_puzzlelock1053305437": "#107",
        "lockeddoor_zonelabyrinthhubb_puzzlelock1302005974": "#108",
        "lockeddoor_zonelabyrinthhubdesign_puzzlelock1040355200": "#109",
        "lockeddoor_zonelabyrinthhubdesign_puzzlelock1458701232": "#110",
        "lockeddoor_zonelabyrinthhubdesign_puzzlelock2006019391": "#111",
        "lockeddoor_zonelabyrinthhubdesign_puzzlelock2042096013": "#112",
        "lockeddoor_zonelabyrinthterrariumjungleglacier_puzzlelock1237654307": "#113",
        "lockeddoor_zonelabyrinthterrariumjungleglacier_puzzlelock1347392166": "#114",
        "lockeddoor_zonerainbowcore_puzzlelock0745527622": "#115",
        "lockeddoor_zonerainbowcore_puzzlelock0903198556": "#116",
        "lockeddoor_zonerainbowcore_puzzlelock1602179426": "#117",
        "lockeddoor_zonerainbowcore_puzzlelock1841176534": "#118",
        "lockeddoor_zonerainbowcore_puzzlelock1854676018": "#119",
        "lockeddoor_zonestrand_puzzlelock1268629766": "#120",
        "lockeddoor_zonestrand_puzzlelock1388684203": "#121",
        "lockeddoor_zonestrand_puzzlelock1492305905": "#122",
        "lockeddoor_zonestrandlabyrinthgate_puzzlelock0968189461": "#123",
        "lockeddoor_zonestrandlabyrinthgate_puzzlelock1350784030": "#124",
        "lockeddoor_zonestrandlabyrinthgate_puzzlelock1728666225": "#125",
        "lockeddoor_zonestrandlabyrinthgate_puzzlelock1870787726": "#126",
        "lockeddoor_zonestrandlabyrinthgate_puzzlelock2115176931": "#127",
        "lockeddoor_zonestrandweather_puzzlelock1987366521": "#128",
        "hypergordo_zonelabyrinthterrariumjungleglacier_gordo1932334613": "#129",
        "gigihologram_x1004_y1415": "#130",
        "gigihologram_x1076_y907": "#131",
        "gigihologram_x1123_y1382": "#132",
        "gigihologram_x1136_y1828": "#133",
        "gigihologram_x1139_y1323": "#134",
        "gigihologram_x1162_y1426": "#135",
        "gigihologram_x1163_y1570": "#136",
        "gigihologram_x134_y2247": "#137",
        "gigihologram_x1364_y1007": "#138",
        "gigihologram_x500_y1104": "#139",
        "gigihologram_x746_y1101": "#140",
        "gigihologram_x766_y2011": "#141",
        "gigihologram_x817_y2171": "#142",
        "gigihologram_x82_y2225": "#143",
        "gigihologram_x838_y1796": "#144",
        "gigihologram_x878_y1466": "#145",
        "gigihologram_x991_y1920": "#146"
    };
    

    const markerId = markerRefKey.split("_").slice(1).join("_");
    const markerNum = googleSheetIdMap[markerId as keyof typeof googleSheetIdMap];

    const rotate: React.MouseEventHandler = (e) => { e.stopPropagation(); setLabelDir(labelDir === "up" ? "left" : labelDir === "left" ? "down" : labelDir === "down" ? "right" : "up"); };

    if(icon instanceof L.Icon && icon.options.iconUrl && /\/icons\/.+\.[a-z]+$/i.test(icon.options.iconUrl)) {
        componentCapableIcon = <>
            <MarkerIconWithPictureSourceFallbacks src={icon.options.iconUrl} width={`${iconWidth}px`} height={`${iconHeight}px`} className={`${!markerNum && icon_opacity} ${markerNum && "bigzindex"}`} />

            {
                markerNum ? (() => {
                    const size = 10; // base size for the arrow
                    let svgWidth = 0;
                    let svgHeight = 0;
                    let points = "";
                    const posStyle: React.CSSProperties = {
                        position: "absolute",
                        pointerEvents: "none",
                    };

                    switch (labelDir) {
                        case "up":
                        // label above marker -> arrow points down (toward marker)
                            svgWidth = size * 2;
                            svgHeight = size;
                            points = `0,0 ${svgWidth},0 ${svgWidth / 2},${svgHeight}`;
                            posStyle.left = "50%";
                            posStyle.transform = "translateX(-50%)";
                            posStyle.bottom = "90%";
                            break;
                        case "down":
                        // label below marker -> arrow points up
                            svgWidth = size * 2;
                            svgHeight = size;
                            points = `${svgWidth / 2},0 0,${svgHeight} ${svgWidth},${svgHeight}`;
                            posStyle.left = "50%";
                            posStyle.transform = "translateX(-50%)";
                            posStyle.top = "90%";
                            break;
                        case "left":
                        // label to left of marker -> arrow points right
                            svgWidth = size;
                            svgHeight = size * 2;
                            points = `0,0 ${svgWidth},${svgHeight / 2} 0,${svgHeight}`;
                            posStyle.right = "90%";
                            posStyle.top = "50%";
                            posStyle.transform = "translateY(-50%)";
                            break;
                        case "right":
                        // label to right of marker -> arrow points left
                            svgWidth = size;
                            svgHeight = size * 2;
                            points = `${svgWidth},0 0,${svgHeight / 2} ${svgWidth},${svgHeight}`;
                            posStyle.left = "90%";
                            posStyle.top = "50%";
                            posStyle.transform = "translateY(-50%)";
                            break;
                    }

                    return (
                        <svg
                            aria-hidden
                            width={svgWidth}
                            height={svgHeight}
                            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                            style={posStyle}
                        >
                            <polygon points={points} fill="#fff" stroke="#000" strokeWidth={2} />
                        </svg>
                    );
                })() : null
            }
            <div className="w-0 h-0 relative">
                <div className="w-[32px] h-[32px] bottom-0 absolute">
                    <div className={`${labelDir === null || !markerNum ? "hidden" : dirsToClassNameMap[labelDir]} px-1 absolute bg-white text-black border-black border-2 rounded text-base font-medium select-none whitespace-nowrap`}
                        onClick={rotate}>
                        {markerNum?.replace("#", "")}
                    </div>
                </div>
            </div>
        </>;
    }

    return (
        <ComponentMarker
            ref={(instance) => { localMarkerRef.current = instance; setMarkerRef(markerRefKey, instance); }}
            key={markerRefKey} position={position}
            icon={componentCapableIcon}
            riseOnHover={true}
        >
            <Popup eventHandlers={popupEventHandlers}>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center gap-3">
                        <PopupSwitchButtonsWrapper
                            markerRefKey={markerRefKey}
                            // add w-0 if disabled to give header a little more horizontal room,
                            // while still keeping it horizontally justified to the center
                            // due to there still being an element present inside the encompassing flex row
                            popupSwitchButtonConditionalStyling={(previous, enabled) => ({ className: `${previous ? "right-2" : "left-2"} ${!enabled && "w-0"}` })}
                        >
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={popupCheckedState}
                                    onChange={onPopupCheckChange}
                                    className="w-4 h-4"
                                />
                                {headerRowChildren}
                            </div>
                        </PopupSwitchButtonsWrapper>
                    </div>

                    <hr />

                    {children}
                </div>
            </Popup>
        </ComponentMarker>
    );
}

export function MarkerIconWithPictureSourceFallbacks({ src, width, height, style, ...props }: { src: string, width?: string, height?: string } & React.ImgHTMLAttributes<HTMLImageElement>) {
    const strippedExt = src.split(".").slice(0, -1).join(".").replace("/icons/", "/compressed/icons/");
    return (
        <picture>
            <source srcSet={`${strippedExt}_96.webp`} type="image/webp" />
            <source srcSet={`${strippedExt}_96.png`} type="image/png" />
            <img src={src} style={{ ...style, width: width, height: height }} {...props} />
        </picture>
    );
}