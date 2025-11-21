
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
                { next: string | null; changeExpression?: import("../src/types.js").GigiExpression }
                | { nextOptions: string[]; changeExpression?: import("../src/types.js").GigiExpression }
                | null
            );
        }
    };
}} */
export const gigi_manually_noted_conversations = {
    "gigihologram_x1364_y1007": {
        firstVisitStartEntryId: "418299640669696000",
        subsequentStartEntryId: "433468706430545920",
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
            "433459818587123712": { nextOptions: ["418299640694861851", "418299640694861852"], changeExpression: "happy1" },
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
                "418299640694861845": { nextOptions: ["418299640694861851", "418299640694861852"], changeExpression: "happy1" },
            // [2/2] [Ok Gigi, I'll see you inside.]
            "418299640694861852": { next: "418299640694861846" },
                // Good luck, Beatrix. And stay sharp when the colors here intensify. Things will get crazy.
                "418299640694861846": { next: null, changeExpression: "thinking1" },
            // [Subsequent Start] Hello again, Beatrix. Do you need something?
            "433468706430545920": { nextOptions: ["418299640694861851", "418299640694861852"], changeExpression: "happy1" },
        }
    },
    "gigihologram_x1162_y1426": {
        firstVisitStartEntryId: "434144876759248896",
        entries: {
            // Isn't it beautiful? Despite everything there's a part of me that is still happy to see it all again...
            "434144876759248896": { nextOptions: ["434144879288414208", "434144879774953472", "434144880240521216"], changeExpression: "happy1" },
            // [1/3] [Am I... still inside the Labyrinth...?]
            "434144879288414208": { next: "434144880701894656" },
                // Yes, you're still inside the Labyrinth, if you can believe it. It's a total recreation of aspects of the environment outside, down to the atmosphere.
                "434144880701894656": { next: "434144881163268096", changeExpression: "happy1" },
                // But even more astonishing is the scale of it all. It's actually bigger on the inside than it is on the outside. A total mind-bender!
                "434144881163268096": { next: "434144881654001664", changeExpression: "surprised1" },
                // Not everything here will make sense at first, or maybe ever. So just do what you do best: explore, collect, and figure out how best to navigate this place.
                "434144881654001664": { next: "434144882119569408", changeExpression: "pointing1" },
                // Knowing your way around and understanding how things work here will prove valuable in time.
                "434144882119569408": { nextOptions: ["434144879288414208", "434144879774953472", "434144880240521216"], changeExpression: "happy1" },
            // [2/3] [I was in a room with strange lights and things got crazy.]
            "434144879774953472": { next: "434144882580942848" },
                // When parts of the Labyrinth begin to shimmer and explode with radiant light, you need to watch out.
                "434144882580942848": { next: "434144883059093504", changeExpression: "thinking1" },
                // I call them Prisma Disruptions. They are the unstable bursts of energy generated by the Prismacore. They come in waves, so learn to spot them and how to survive them.
                "434144883059093504": { next: "434144883512078336" },
                // Because though the disruptions are dangerous, they will prove essential for our work here... in time.
                "434144883512078336": { nextOptions: ["434144879288414208", "434144879774953472", "434144880240521216"] },
            // [3/3] [I'm going to get back to exploring.]
            "434144880240521216": { next: "434144883965063168" },
                // Ok Beatrix, you know where to find me if you need me.... Well, sort of.
                "434144883965063168": { next: null, changeExpression: "cheery1" },
        }
    },
    "gigihologram_x1123_y1382": {
        firstVisitStartEntryId: "434160849277054976",
        entries: {
            // Have you watched the sunset inside the Labyrinth? The darkness of night creeps in and yet- it's all an illusion. Or at least, it has to be...
            "434160849277054976": { nextOptions: ["434160851747500032", "434160852200484864", "434160852657664000"], changeExpression: "happy1" },
            // [1/3] [Speaking of darkness, what's with those shadowy slimes I've seen?]
            "434160851747500032": { next: "434160853140008960" },
                // Shadow slimes are a strange variant of slimes that seem to be the opposing polarity of the Prismacore made manifest.
                "434160853140008960": { next: "434160853597188096", changeExpression: "surprised1" },
                // I still don't know if they were specifically created by someone to be this kind of opposing force, or if they evolved to be that way. You know, how nature always seems to find a way?
                "434160853597188096": { next: "434160854066950144" },
                // Either way, shadow plorts seem to provide a kind of dampening effect to prisma disruptions. It's a longshot but maybe they can somehow be used to negate the effects of the Prismacore.
                "434160854066950144": { nextOptions: ["434160854532517888", "434160852657664000"] },
                // [Got any Shadow Slime tips?]
                "434160854532517888": { next: "434160855006474240", changeExpression: "pointing1" },
                // They're slippery little fellows, aren't they? Shadow slimes will quickly flee from you or prisma disruptions. So your best bet is to search areas that were not recently under the effects of a prisma disruption.
                "434160855006474240": { next: "434160855480430592", changeExpression: "happy1" },
                // Once you do see a group of them you need to sneak up on them and then try to knock out as many plorts as possible before they all flee. So be sure to bring some extra junk in your vacpack just for that.
                "434160855480430592": { next: "434160855937609728", changeExpression: "thinking1" },
                // Just don't go chasing one off a ledge or something. I'm definitely not speaking from experience there... oof.
                "434160855937609728": { nextOptions: ["434160851747500032", "434160852200484864", "434160852657664000"] },
            // [2/3] [Why did you trust me with all of this, Gigi?]
            "434160852200484864": { next: "434160856415760384" },
                // I'm no hero, Beatrix. So I knew that I needed a real hero to stop what is happening here.
                "434160856415760384": { next: "434160856881328128" , changeExpression: "sad1" },
                // And a hero... well, a hero you can trust. I mean if you can't then who else is there? So I tried to picture the perfect person for this job and it was you.
                "434160856881328128": { next: "434160857334312960", changeExpression: "happy1" },
                // I've had my trust broken before. That's what caused everything to go wrong. I trusted the wrong people. But this is my chance to make it right.
                "434160857334312960": { next: "434160857791492096", changeExpression: "sad1" },
                // You might not feel it yet, but you are a hero Beatrix. You will become one in time. There are so many amazing adventures ahead of you, I promise.
                "434160857791492096": { next: "434160858261254144", changeExpression: "cheery1" },
                // In time, this will be just another chapter in the Adventures of Beatrix LeBeau. Another story for some little girl to read under a tree and dream that her life might ever be as grand a tale...
                "434160858261254144": { nextOptions: ["434160851747500032", "434160852200484864", "434160852657664000"] },
            // [3/3] [I better keep moving.]
            "434160852657664000": { next: "434160858726821888" },
                // Happy to shed some light for you whenever you need it.
                "434160858726821888": { next: null, changeExpression: "cheery1" },
        }
    },
    // "": {
    //     firstVisitStartEntryId: ,
    //     entries: {
    //         //
    //         "": { next: "" },
    //     }
    // },
    // "": {
    //     firstVisitStartEntryId: ,
    //     entries: {
    //         //
    //         "": { next: "" },
    //     }
    // },
}