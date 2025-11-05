import { Marker, Popup } from "react-leaflet";
import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { icon_opacity, icon_template, research_drone_ls_key } from "../globals";
import { AiFillCaretDown, AiOutlineClose } from "react-icons/ai";
import { FoundContext } from "../FoundContext";
import L from "leaflet";
import { MapType } from "../CurrentMapContext";
import { GigiDialogueToOptionsEntry, GigiDialogueToTextEntry, GigiHologram } from "../types";
import { gigiExpressionImageUrls, handleChecked } from "../util";
import { gigi_holograms } from "../data/gigi_holograms";

// TODO: move this to a configuration or settings area?
const curLanguage = "en";

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
    const deprecatedKey = null;
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

    const icon = L.icon({
        ...icon_template,
        iconUrl: "/icons/iconRancherGigi.png",
        className: `${checked && icon_opacity}`
    });

    return (
        <Marker key={keyName} position={[gigi_hologram.position.x, gigi_hologram.position.y]} icon={icon}>
            <Popup>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center gap-5">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleChecked(research_drone_ls_key, keyName, checked, setChecked, deprecatedKey)}
                                className="w-4 h-4"
                            />
                            <h1 className="ml-2 text-xl font-medium">{gigi_hologram.name}</h1>
                        </div>
                    </div>
                    <hr />
                    <div>
                        <span className="text-md font-bold">Description: </span>
                        <span>{gigi_hologram.description}</span>
                    </div>
                    {/* <div>
                        <span className="text-md font-bold">internalId: </span>
                        <span>{research_drone.internalId}</span>
                    </div>
                    <div>
                        <span className="text-md font-bold">keyName: </span>
                        <span>{keyName}</span>
                    </div> */}

                    <button
                        className="border w-[9rem] mt-2 p-1 self-end"
                        onClick={() => {
                            setShowConvo(true);
                            setCurrentConvo(<GigiConvo gigi_hologram={gigi_hologram} setShowConvo={setShowConvo} />);
                        }}
                    >
                        Access Conversation
                    </button>
                </div>
            </Popup>
        </Marker>
    );
}

type _EntryId = keyof NonNullable<GigiHologram["dialogue"]>["entries"];
// type _Entry = NonNullable<GigiHologram["dialogue"]>["entries"][_EntryId];
type _ConvoLogEntry = {
    text: string,
    entryId: _EntryId,
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

    const nextEntryAsConvoLogEntry = (sourceEntry: Exclude<_ConvoLogEntry, { optionsIds: any }> | { nextTextId: _EntryId }): _ConvoLogEntry => {
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
                text: entry.text[curLanguage],
                nextOptionsIds: "nextOptionsById" in entry ? entry.nextOptionsById : undefined,
            };
        }
        else return null as unknown as _ConvoLogEntry;
    };

    const [convoLog, setConvoLog] = useState(() => {
        let init = [];
        if(gigi_hologram.dialogue) {
            init.push(nextEntryAsConvoLogEntry({ nextTextId: gigi_hologram.dialogue.firstVisitStartEntryId })); // TODO subsequent start entry ID too!
        }
        return init;
    });

    const convoLogRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        // Anytime convo log changes, scoll the log to the bottom.
        // Note: chose useLayoutEffect because reading DOM layout-dependent property .scrollHeight.
        //   (According to useLayoutEffect docs: "Use this to read layout from the DOM ...")
        if(convoLogRef.current) {
            convoLogRef.current.scrollTop = convoLogRef.current.scrollHeight;
        }
    }, [convoLog]);

    // if(!dialogueMap) {
    //     <div>
    //         <p>No dialogue for this Gigi Hologram.</p>
    //         <p>(Todo make this no-dialogue message prettier)</p>
    //         <button onClick={() => setShowConvo(false)}>Close</button>
    //     </div>
    // }

    // const rewindConvoToPreviousOptionSelection = () => {
    //     let log = [ ...convoLog ];
    //     const optionEntryCt = log.reduce((acc, logEntry) => (acc + +(logEntry !== null && ("optionIds" in logEntry))), 0);
    //     if(optionEntryCt === 0 || (optionEntryCt === 1 && typeof log[log.length - 1].nextOptionsIds !== "undefined"))
    //         return;
    //     do {
    //         // remove latest convo entry (so that if it is an options entry, it gets rewinded past)
    //         log.pop();
    //         // and keep removing convo entries until we hit another options entry.
    //     } while (typeof log[log.length - 1].nextOptionsIds === "undefined");
    //     setConvoLog(log);
    // }
    
    
    
    // const [showArchived, setShowArchived] = useState(false);

    // const translatedPages = !showArchived ? gigi_hologram.log : gigi_hologram.archive;

    // let accessingText = translatedPages[0]?.[curLanguage]?.[0];
    // if(!accessingText)
    //     accessingText = `Accessing GG${!showArchived ? "Log" : "Archive"}:`;

    let latestExpression: NonNullable<GigiDialogueToTextEntry["expression"]> = "happy1";


    return (
        <div className={`max-w-fit gigi-convo p-7 pl-0`}>
            <div className="flex-grow flex flex-col justify-between overflow-y-hidden">
                <div className="flex justify-between items-center mb-5 ml-7">
                    <span className="font-medium text-2xl">{gigi_hologram.name}</span>
                    <AiOutlineClose
                        onClick={() => setShowConvo(false)}
                        size={25}
                        className="log-close"
                    />
                </div>
                {/* <div className="flex-grow flex-shrink"></div> */}
                <div ref={convoLogRef} className="flex flex-col flex-grow gap-2 overflow-y-auto pt-2 *:ml-7">
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
                                    <div key={`${convoEntry.sourceEntryId}_options`}
                                        className="gigi-option-group-entry flex flex-row justify-end"
                                    >
                                        {convoEntry.optionsIds.map((optionId, optionIndex) => {
                                            const thisOptionEntry = (dialogueEntries[optionId] as GigiDialogueToTextEntry);
                                            const optionText = thisOptionEntry.text[curLanguage];
                                            return <GigiConvoOptionButton
                                                entryIndex={entryIndex}
                                                optionIndex={optionIndex}
                                                optionText={optionText}
                                                thisOptionEntry={thisOptionEntry}
                                                convoEntry={convoEntry}
                                                convoLog={convoLog}
                                                setConvoLog={setConvoLog}
                                                nextEntryAsConvoLogEntry={nextEntryAsConvoLogEntry}
                                            />;
                                        })}
                                    </div>
                                )
                            }
                            else {
                                const thisExpression = dialogueEntries[convoEntry.entryId].expression;
                                latestExpression = thisExpression ?? latestExpression;

                                return <div key={convoEntry.entryId}
                                    className="gigi-text-entry"
                                >
                                    <img
                                        src={gigiExpressionImageUrls[latestExpression]}
                                        alt={`Portrait of Gigi with a ${latestExpression.replace(/\d+$/ig,"").toLowerCase()} expression as shown in game.`}
                                        aria-hidden
                                        className="gigi-portrait"
                                    />
                                    <p>{convoEntry.text}</p>
                                    {isLastEntry && <GigiConvoTextNextButton
                                        hasMoreConvo={!!(convoEntry.nextTextId || convoEntry.nextOptionsIds)}
                                        convoEntry={convoEntry}
                                        convoLog={convoLog}
                                        setConvoLog={setConvoLog}
                                        nextEntryAsConvoLogEntry={nextEntryAsConvoLogEntry}
                                    />}
                                </div>;
                            }
                        }))
                    }
                </div>
            </div>
            {/* <div className="flex justify-end">
                <button
                    className="text-base bg-white py-1 px-2 text-black"
                    onClick={() => setShowArchived(!showArchived)}
                >
                    {!showArchived ? "Access Archive" : "Access Log"}
                </button>
            </div> */}
        </div>
    );
}

function GigiConvoOptionButton<type_nextEntryAsConvoLogEntry extends (o: any) => _ConvoLogEntry>({
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
        console.log(btnRef.current, selected, someOptionIsSelected, isFirst);
        if(btnRef.current && (selected || (!someOptionIsSelected && isFirst))) {
            btnRef.current.focus();
        }
    }, [btnRef.current]);

    return <button
        ref={btnRef}
        className={`gigi-option-button ${convoEntry.optionSelectedIndex === optionIndex && "selected"}`}
        // style={convoEntry.optionSelectedIndex === optionIndex ? { border: "2px solid red" } : { border: "2px solid grey" }}
        onClick={() => {
            if(typeof thisOptionEntry.nextTextById === "undefined")
                return;
            setConvoLog([
                ...convoLog.slice(0, entryIndex),  // discard convo logs past this option, and this option itself
                {
                    ...convoEntry,
                    // set which one we selected
                    optionSelectedIndex: optionIndex
                },
                nextEntryAsConvoLogEntry({ nextTextId: thisOptionEntry.nextTextById })
            ]);
        }}
    >
        {optionText}
    </button>;
}

function GigiConvoTextNextButton<type_nextEntryAsConvoLogEntry extends (o: any) => _ConvoLogEntry>({ hasMoreConvo, convoEntry, convoLog, setConvoLog, nextEntryAsConvoLogEntry }: {
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
            // const keylistener = () => ;
            // return () => {
            //     if(btnRef.current) {
            //         btnRef.
            //     }
            // }
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
                ])
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
