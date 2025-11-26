import { AiFillCaretDown, AiOutlineClose } from "react-icons/ai";
import { GigiDialogueToOptionsEntry, GigiDialogueToTextEntry, GigiExpression, GigiHologram } from "../types";
import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gigi_hologram_ls_key, icon_opacity, icon_template } from "../globals";
import { FoundContext } from "../FoundContext";
import L from "leaflet";
import MarkerAndPopupTemplate from "./MarkerAndPopupTemplate";
import { gigi_holograms } from "../data/gigi_holograms";
import { handleChecked } from "../util";

// TODO: refactor the language to a configuration or settings area?
const curLanguage = "en";

/* eslint-disable sort-imports */
import happy1 from "/gigi/happy1.png";
import thinking1 from "/gigi/thinking1.png";
import pointing1 from "/gigi/pointing1.png";
import surprised1 from "/gigi/surprised1.png";
import cheery1 from "/gigi/cheery1.png";
import sad1 from "/gigi/sad1.png";
import sad2 from "/gigi/sad2.png";
import sad3 from "/gigi/sad3.png";
import pensive1 from "/gigi/pensive1.png";
import pensive2 from "/gigi/pensive2.png";

export const gigiExpressionImageUrls: { [expression in GigiExpression]: string } = {
    happy1: happy1,
    surprised1: surprised1,
    thinking1: thinking1,
    pointing1: pointing1,
    cheery1: cheery1,
    sad1: sad1,
    sad2: sad2,
    sad3: sad3,
    pensive1: pensive1,
    pensive2: pensive2,
};

export function GigiHologramIcon({
    gigi_hologram,
    setShowConvo,
    setCurrentConvo,
    keyName,
}: {
    gigi_hologram: GigiHologram,
    setShowConvo: React.Dispatch<React.SetStateAction<boolean>>
    setCurrentConvo: React.Dispatch<React.SetStateAction<JSX.Element>>
    keyName: string,
}) {
    const { found, setFound } = useContext(FoundContext);
    const [checked, setChecked] = useState(
        found.gigi_holograms ? found.gigi_holograms.some((k: string) => k === keyName) : false
    );

    useEffect(() => {
        setChecked(found.gigi_holograms ? found.gigi_holograms.some((k: string) => k === keyName) : false);
    }, [found]);

    useEffect(() => {
        if (checked) {
            setFound({
                ...found,
                gigi_holograms: [...found.gigi_holograms, keyName],
            });
        } else {
            setFound({
                ...found,
                gigi_holograms: [...found.gigi_holograms.filter((item: string) => item !== keyName)]
            });
        }
    }, [checked]);

    const iconOptions: L.IconOptions = {
        ...icon_template,
        iconUrl: "/icons/iconRancherGigi.png",
        className: `${checked && icon_opacity}`
    };

    const markerRefKey = `gigihologram_${keyName}`;  // add this prefix to make these unique among _all_ markers on the map

    return (
        <MarkerAndPopupTemplate
            markerRefKey={markerRefKey}
            position={[gigi_hologram.position.x, gigi_hologram.position.y]}
            iconOptions={iconOptions}
            popupCheckedState={checked}
            onPopupCheckChange={() => handleChecked(gigi_hologram_ls_key, keyName, checked, setChecked)}
            headerRowChildren={
                <h1 className="ml-2 text-xl font-medium">{gigi_hologram.name}</h1>
            }
        >
            <div>
                <span className="text-md font-bold">Description: </span>
                <span>{gigi_hologram.description}</span>
            </div>

            <button
                className="border w-[9rem] mt-2 p-1 self-end"
                onClick={() => {
                    setShowConvo(true);
                    setCurrentConvo(<GigiConvo
                        key={`convodialog_${keyName}`}
                        gigi_hologram={gigi_hologram}
                        setShowConvo={setShowConvo}
                    />);
                }}
            >
                Access Conversation
            </button>
        </MarkerAndPopupTemplate>
    );
}

type _EntryId = keyof NonNullable<GigiHologram["dialogue"]>["entries"];
type _ConvoLogEntry = {
    text: string,
    entryId: _EntryId,
    italics?: boolean,
    nextTextId?: _EntryId,
    nextOptionsIds?: GigiDialogueToOptionsEntry["nextOptionsById"],
} | {
    sourceEntryId: _EntryId,
    optionsIds: _EntryId[]
    optionSelectedIndex?: number
};

export function GigiConvo({
    gigi_hologram,
    setShowConvo,
}: {
    gigi_hologram: GigiHologram,
    setShowConvo: React.Dispatch<React.SetStateAction<boolean>>,
}) {

    const dialogueEntries = gigi_hologram.dialogue?.entries;

    const nextEntryAsConvoLogEntry = (sourceEntry: Exclude<_ConvoLogEntry, { optionsIds: unknown }> | { nextTextId: _EntryId }): _ConvoLogEntry => {
        if("nextOptionsIds" in sourceEntry && sourceEntry.nextOptionsIds) {
            return {
                sourceEntryId: sourceEntry.entryId,
                optionsIds: sourceEntry.nextOptionsIds,
            };
        }
        else if(sourceEntry.nextTextId) {
            const entry = dialogueEntries![sourceEntry.nextTextId];
            return {
                entryId: sourceEntry.nextTextId,
                nextTextId: "nextTextById" in entry ? entry.nextTextById : undefined,
                text: entry.text[curLanguage] ?? entry.text.en ?? Object.values(entry.text)[0],
                italics: entry.italics,
                nextOptionsIds: "nextOptionsById" in entry ? entry.nextOptionsById : undefined,
            };
        }
        else return null as unknown as _ConvoLogEntry;
    };

    
    const [startEntryId, setStartEntryId] = useState<string | undefined>(gigi_hologram.dialogue?.firstVisitStartEntryId);

    const initConvoLog = useCallback(() => {
        const init = [];
        if(gigi_hologram.dialogue) {
            init.push(nextEntryAsConvoLogEntry({ nextTextId: startEntryId! }));
        }
        return init;
    }, [gigi_hologram, startEntryId]);

    const [convoLog, setConvoLog] = useState(initConvoLog);

    useEffect(() => {
        console.debug("reset convo log to start with startEntryId:", startEntryId);
        setConvoLog(initConvoLog());
    }, [startEntryId, setConvoLog, initConvoLog]);

    const convoLogElemRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        // Anytime convo log changes, scoll the log to the bottom.
        // Note: chose useLayoutEffect because reading DOM layout-dependent property .scrollHeight.
        //   (According to useLayoutEffect docs: "Use this to read layout from the DOM ...")
        if(convoLogElemRef.current) {
            convoLogElemRef.current.scrollTop = convoLogElemRef.current.scrollHeight;
        }
    }, [convoLog]);


    let latestExpression: GigiExpression = "happy1";


    return (
        <div className={"max-w-fit gigi-convo p-7 pl-0"}>
            <div className="flex-grow flex flex-col justify-between overflow-y-hidden">
                <div className="flex justify-between items-center mb-5 ml-7">
                    <span className="font-medium text-2xl">{gigi_hologram.name}</span>
                    <AiOutlineClose
                        onClick={() => setShowConvo(false)}
                        size={25}
                        className="log-close"
                    />
                </div>
                {
                    gigi_hologram.dialogue?.labeledAltEntrypoints
                    && <div className="flex flex-wrap justify-center items-center mb-4 ml-7 gap-2">
                        {Object.entries({
                            "Initial Visit": gigi_hologram.dialogue.firstVisitStartEntryId,
                            ...gigi_hologram.dialogue.labeledAltEntrypoints
                        }).map(([label, entryId]) => {
                            return <button
                                key={label}
                                className={`flex-grow-0 text-center p-2 px-4 rounded-full drop-shadow-md text-md font-normal ${startEntryId === entryId ? "bg-green-400" : "bg-gray-100"} hover:bg-green-200 focus:bg-green-200 text-slate-950`}
                                onClick={() => setStartEntryId(entryId)}
                            >
                                {label}
                            </button>;
                        })}
                    </div>
                }
                <div ref={convoLogElemRef} className="flex flex-col flex-grow gap-2 overflow-y-auto pt-2 *:ml-7">
                    { dialogueEntries && <div className="gigi-convo-top-spacer flex-grow overflow-x-hidden"></div> }
                    {
                        !dialogueEntries
                            ? (<div className="gigi-text-entry">
                                <p>No dialogue for this Gigi Hologram.</p>
                                <p>Todo: enter the dialogue that this Gigi Hologram provides.</p>
                            </div>)
                            : (convoLog.map((convoEntry, entryIndex) => {
                                if(convoEntry === null) return null;
                                const isLastEntry = entryIndex === convoLog.length - 1;
                                if("optionsIds" in convoEntry) {
                                    return (
                                        <div key={`${entryIndex}_${convoEntry.sourceEntryId}_options`}
                                            className="gigi-option-group-entry flex flex-col justify-end"
                                        >
                                            {convoEntry.optionsIds.map((optionId, optionIndex) => {
                                                const thisOptionEntry = (dialogueEntries[optionId] as GigiDialogueToTextEntry);
                                                const optionText = thisOptionEntry.text[curLanguage] ?? thisOptionEntry.text.en ?? Object.values(thisOptionEntry.text)[0];
                                                return <GigiConvoOptionButton
                                                    key={`${optionId}`}
                                                    entryIndex={entryIndex}
                                                    optionIndex={optionIndex}
                                                    optionText={optionText}
                                                    thisOptionEntry={thisOptionEntry}
                                                    convoEntry={convoEntry}
                                                    convoLog={convoLog}
                                                    setConvoLog={setConvoLog}
                                                    nextEntryAsConvoLogEntry={nextEntryAsConvoLogEntry as (o: unknown) => _ConvoLogEntry}
                                                />;
                                            })}
                                        </div>
                                    );
                                }
                                else {
                                    const thisExpression = dialogueEntries[convoEntry.entryId]?.expression;
                                    latestExpression = thisExpression ?? latestExpression;

                                    return <div key={`${entryIndex}_${convoEntry.entryId}`}
                                        className="gigi-text-entry"
                                    >
                                        <img
                                            src={gigiExpressionImageUrls[latestExpression]}
                                            alt={`Portrait of Gigi with a ${latestExpression.replace(/[^a-z-]+/ig,"").toLowerCase()} expression as shown in game.`}
                                            aria-hidden
                                            className="gigi-portrait"
                                        />
                                        <p>{convoEntry.italics ? <i>{convoEntry.text}</i> : convoEntry.text}</p>
                                        {isLastEntry && <GigiConvoTextNextButton
                                            hasMoreConvo={!!(convoEntry.nextTextId || convoEntry.nextOptionsIds)}
                                            convoEntry={convoEntry}
                                            convoLog={convoLog}
                                            setConvoLog={setConvoLog}
                                            nextEntryAsConvoLogEntry={nextEntryAsConvoLogEntry as (o: unknown) => _ConvoLogEntry}
                                        />}
                                    </div>;
                                }
                            }))
                    }
                </div>
            </div>
        </div>
    );
}

function GigiConvoOptionButton<type_nextEntryAsConvoLogEntry extends (o: unknown) => _ConvoLogEntry>({
    entryIndex, optionIndex, optionText, thisOptionEntry, convoEntry, convoLog, setConvoLog, nextEntryAsConvoLogEntry
}: {
    entryIndex: number;
    optionIndex: number;
    optionText: string;
    thisOptionEntry: GigiDialogueToTextEntry;
    convoEntry: Extract<_ConvoLogEntry, { optionSelectedIndex?: number }>;
    convoLog: _ConvoLogEntry[];
    setConvoLog: React.Dispatch<React.SetStateAction<_ConvoLogEntry[]>>;
    nextEntryAsConvoLogEntry: type_nextEntryAsConvoLogEntry;
}) {
    const btnRef = useRef<HTMLButtonElement>(null);

    const someOptionIsSelected = typeof convoEntry.optionSelectedIndex !== "undefined";
    const selected = convoEntry.optionSelectedIndex === optionIndex;
    const isFirst = optionIndex === 0;

    useEffect(() => {
        if(btnRef.current && (selected || (!someOptionIsSelected && isFirst))) {
            btnRef.current.focus();
        }
    }, [btnRef.current]);

    return <button
        ref={btnRef}
        className={`gigi-option-button ${convoEntry.optionSelectedIndex === optionIndex && "selected"}`}
        onClick={() => {
            if(typeof thisOptionEntry.nextTextById === "undefined")
                return;
            setConvoLog([
                // discard convo logs past this option, and this option itself
                ...convoLog.slice(0, entryIndex),
                {
                    // add this entry back
                    ...convoEntry,
                    // and set which option we selected
                    optionSelectedIndex: optionIndex
                },
                // and add the next entry
                nextEntryAsConvoLogEntry({ nextTextId: thisOptionEntry.nextTextById })
            ]);
        }}
    >
        {optionText}
    </button>;
}

function GigiConvoTextNextButton<type_nextEntryAsConvoLogEntry extends (o: unknown) => _ConvoLogEntry>({ hasMoreConvo, convoEntry, convoLog, setConvoLog, nextEntryAsConvoLogEntry }: {
    hasMoreConvo?: boolean;
    convoEntry: _ConvoLogEntry;
    convoLog: _ConvoLogEntry[];
    setConvoLog: React.Dispatch<React.SetStateAction<_ConvoLogEntry[]>>;
    nextEntryAsConvoLogEntry: type_nextEntryAsConvoLogEntry;
}) {

    const btnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if(btnRef.current) {
            btnRef.current.focus();
        }
    }, [btnRef.current]);


    if(hasMoreConvo === false) {
        return <div className="flex flex-row justify-end font-normal text-slate-600">
            <button
                ref={btnRef}
                className="p-1 px-4 -m-1 mt-0 rounded-xl cursor-default"
            >
                End of conversation path
            </button>
        </div>;
    }

    return <div className="flex flex-row justify-end font-normal text-slate-800">
        <button
            ref={btnRef}
            className="p-2 px-4 -m-2 mt-0 rounded-xl hover:bg-slate-200 focus:bg-slate-200"
            onClick={() => {
                setConvoLog([
                    ...convoLog,
                    nextEntryAsConvoLogEntry(convoEntry)
                ]);
            }}
        >
            <AiFillCaretDown className="inline-block"/> Next
        </button>
    </div>;
}



export function GigiHologramIcons(
    setShowConvo: React.Dispatch<React.SetStateAction<boolean>>,
    setCurrentConvo: React.Dispatch<React.SetStateAction<JSX.Element>>,
) {
    return Object.keys(gigi_holograms).map((keyName) => {
        const gigi_hologram = gigi_holograms[keyName];
        return <GigiHologramIcon
            key={keyName}
            gigi_hologram={gigi_hologram}
            setShowConvo={setShowConvo}
            setCurrentConvo={setCurrentConvo}
            keyName={keyName}
        />;
    });
}
