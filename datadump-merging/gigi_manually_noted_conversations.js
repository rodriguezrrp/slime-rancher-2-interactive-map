
/*
 * To construct this data, I have gone through Gigi's dialogues,
 * looked up each text in the exported CommStation localization table (./data_cache/CommStationL10nData.json) and noted its translation ID,
 * and also noted whenever Gigi's expression changes.
 * 
 * There is code in the node processing logic to import this data and transform it,
 * replacing the translation IDs with the complete translation lookups (all available languages),
 * and then export it to gigi_holograms.ts.
 */

/** @type {{
    [hologramId: string]: Omit<NonNullable<import("../src/types.js").GigiHologram["dialogue"]>, "entries"> & {
        entries: {
            [translationId: string]: (
                { next: string | null; changeExpression?: import("../src/types.js").GigiDialogueToTextEntry["expression"] }
                | { nextOptions: string[]; changeExpression?: import("../src/types.js").GigiDialogueToTextEntry["expression"] }
                | null
            );
        }
    };
}} */
export const gigi_manually_noted_conversations = {
    "gigihologram_x1364_y1007": {
        firstVisitStartEntryId: "418299640669696000",
        // subsequentStartEntryId: ,
        entries: {
            // It's... it's you! I can't believe it. Oh my gosh. Um, hello Beatrix- I mean, Ms LeBeau. I mean, is Beatrix ok?
            "418299640669696000": { next: "418299640694861824", changeExpression: "surprised1" },
            // Sorry, I just can't believe I'm talking to you now. You're kind of a legend where I'm... from.
            "418299640694861824": { next: "418299640694861825" },
            // I'm sorry, you probably have a million questions, and I'm so sorry but I can only be so helpful.
            "418299640694861825": { next: "418299640694861826", changeExpression: "happy1" },
            // I'm in a position now where I need to manage what I'm doing here at all times until we can fix it. It's very delicate work. So we'll need to keep our chats a little short.
            "418299640694861826": { nextOptions: ["418299640694861847"], changeExpression: "thinking1" },
            // [Ok, you seem to know me but I don't know you...]
            "418299640694861847": { next: "418299640694861827" },
            // Oh! I'm so sorry. I should have introduced myself. I'm Gigi. I'm a botanist. And an explorer. And lately, a makeshift expert on alien technology.
            "418299640694861827": { next: "418299640694861828", changeExpression: "surprised1" },
            // I'm sorry that I didn't make myself known sooner. But I had to know for sure that you wouldn't be like the others.... that you were someone I could trust.
            "418299640694861828": { nextOptions: ["418299640694861848"], changeExpression: "thinking1" },
            // [So you're the one that sent me the letter and the boat that brought me here?]
            "418299640694861848": { next: "418299640694861829" },
            // Yes. I can't do this alone and you are the one person I believe who could help me.
            "418299640694861829": { nextOptions: ["418299640694861849"] },
            // [Help you with what?]
            "418299640694861849": { next: "418299640694861830" },
            // Help me save Rainbow Island... maybe even all of the Far, Far Range.
            "418299640694861830": { next: "418299640694861831" },
            // You see, when I first came to Rainbow Island I was so taken with its beauty. It was unlike anything I had ever seen before. But I eventually discovered this beauty came at a price.
            "418299640694861831": { next: "418299640694861832", changeExpression: "surprised1" },
            // Long ago, something from way out there in space crashed into what is now Rainbow Island. And slowly, it began to change things.
            "418299640694861832": { next: "418299640694861833" },
            // The rocks and cliffs blushed with color and then rippled with veins of the same prismatic hues that sprouted from the grasses and other flora.
            "418299640694861833": { next: "418299640694861834", changeExpression: "pointing1" },
            // Even the atmosphere here has a kind of hypercolor to it. It's everywhere. All spreading from the thing from space.
            "418299640694861834": { next: "418299640694861835", changeExpression: "happy1" },
            // That thing - I call it the Prismacore - changes the properties of everything around it. It starts with color but then material and elemental changes begin...
            "418299640694861835": { nextOptions: ["418299640694861850"], changeExpression: "thinking1" },
            // [How do we stop it?]
            "418299640694861850": { next: "418299640694861836" },
            // Traverse through the Grey Labyrinth and find me. I cannot leave my post but I can communicate with you from these devices as you find them.
            "418299640694861836": { next: "418299640694861837", changeExpression: "surprised1" },
            // Once you find me we can try to stop what is happening here.
            "418299640694861837": { next: "433459818587123712" },
            // In the meantime I'll do my best to answer more questions as you think of them. But heck, even if you don't have any it will just be good to chat with another human. It has been so long...
            "433459818587123712": { nextOptions:["418299640694861851", "418299640694861852"], changeExpression: "happy1" },
            // [1/2] [Tell me again why you need my help.]
            "418299640694861851": { next: "418299640694861838" },
                // I need you to help me save Rainbow Island... maybe even all of the Far, Far Range.
                "418299640694861838": { next: "418299640694861839", changeExpression: "thinking1" },
                // You see, when I first came to Rainbow Island I was so taken with its beauty. It was unlike anything I had ever seen before. But I eventually discovered this beauty came at a price.
                "418299640694861839": { next: "418299640694861840", changeExpression: "surprised1" },
                // Long ago, something from way out there in space crashed into what is now Rainbow Island. And slowly, it began to change things.
                "418299640694861840": { next: "418299640694861841" },
                // The rocks and cliffs blushed with color and then rippled with veins of the same prismatic hues that sprouted from the grasses and other flora.
                "418299640694861841": { next: "418299640694861842" },
                // Even the atmosphere here has a kind of hypercolor to it. It's everywhere. All spreading from the thing from space.
                "418299640694861842": { next: "418299640694861843" },
                // That thing, I call it the Prismacore, changes the properties of everything around it. It starts with color but then material and elemental changes begin...
                "418299640694861843": { next: "418299640694861844", changeExpression: "thinking1" },
                // I need you to traverse through the Grey Labyrinth and find me. I cannot leave my post but I can communicate with you from these devices as you find them.
                "418299640694861844": { next: "418299640694861845" },
                // I'll do my best to answer more questions as you think of them. But heck, it's even just good to chat to another human. It has been so long...
                "418299640694861845": { nextOptions:["418299640694861851", "418299640694861852"], changeExpression: "happy1" },
            // [2/2] [Ok Gigi, I'll see you inside.]
            "418299640694861852": { next: "418299640694861846" },
                // Good luck, Beatrix. And stay sharp when the colors here intensify. Things will get crazy.
                "418299640694861846": { next: null, changeExpression: "thinking1" },
            // [Subsequent Start] Hello again, Beatrix. Do you need something?
            "433468706430545920": { nextOptions:["418299640694861851", "418299640694861852"], changeExpression: "happy1" },
        }
    },
    // "": {
    //     firstVisitStartEntryId: ,
    //     entries: {
    //         //
    //         "": { next: "" },
    //     }
    // },
}