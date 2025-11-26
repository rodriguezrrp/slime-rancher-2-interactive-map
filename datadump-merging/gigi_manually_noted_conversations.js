/* eslint-disable indent */

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
    [hologramId: string]: (
        { convoReference: string; }
        | (
            Omit<NonNullable<import("../src/types.js").GigiHologram["dialogue"]>, "entries"> & {
                entries: {
                    [translationId: string]: (
                        { next: string | null; changeExpression?: import("../src/types.js").GigiExpression, italics?: boolean }
                        | { nextOptions: string[]; changeExpression?: import("../src/types.js").GigiExpression, italics?: boolean }
                        | null
                    );
                }
            }
        )
    );
}} */
export const gigi_manually_noted_conversations = {
    "gigihologram_x1364_y1007": {
        firstVisitStartEntryId: "418299640669696000",
        labeledAltEntrypoints: {
            "Subsequent Visit": "433468706430545920",
        },
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
    "gigihologram_x1136_y1828": {
        // appears to use the same convo as the first gigi hologram in the strand-accessed section of the labyrinth
        convoReference: "gigihologram_x1364_y1007",
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
    "gigihologram_x1163_y1570": {
        // appears to use the same convo as the gigi hologram in the open-air section of the labyrinth and directly outside the first strand-accessed prismatic room
        convoReference: "gigihologram_x1162_y1426",
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
    "gigihologram_x838_y1796": {
        firstVisitStartEntryId: "523379801986854912",
        entries: {
            // Hi, Beatrix. I've been calling this area the Terrarium.
            "523379801986854912": { nextOptions: ["523379806806110208", "523379807615610880", "523379808395751424"], changeExpression: "cheery1" },
            // [1/3] [Why 'the Terrarium?']
            "523379806806110208": { next: "523379809226223616" },
                // Well... you know, a terrarium is just a container that keeps plants outside of their usual environment.
                "523379809226223616": { next: "523379810023141376", changeExpression: "pointing1" },
                // The first time I came through here, that's what it looked like to me. Just a biosphere, though a really beautiful one, with unique food and slimes.
                "523379810023141376": { next: "523379810853613568", changeExpression: "happy1" },
                // And... maybe that's true. It's possible that this is just a way to represent the outside world here in the Labyrinth, safely behind glass.
                "523379810853613568": { next: "523379811671502848" },
                // But... I'm no longer so sure.
                "523379811671502848": { nextOptions: ["523379812455837696", "523379813261144064"], changeExpression: "thinking1" },
                // [1/2] [So what do you think it really is?]
                "523379812455837696": { next: "523379814079033344" },
                    // That's the thing, Beatrix. I have no way of knowing, not really. But...
                    "523379814079033344": { next: "523379814884339712", changeExpression: "thinking1" },
                    // I'm very sure the Labyrinth as a whole is a facility that was intended to contain and stabilize the Prismacore. So logically, the Terrarium is here for some Prismacore-related reason.
                    "523379814884339712": { next: "523379815681257472", changeExpression: "happy1" },
                    // And if I think about what that could be...
                    "523379815681257472": { next: "523379816478175232" },
                    // I wonder if it's a seed bank of some kind. Like, if things went really bad in the future, if the Prismacore became too unstable and really, truly breached... this would be a way to ensure that some of the flora would survive the ensuing calamity.
                    "523379816478175232": { next: "523379817296064512", changeExpression: "pensive1" },
                    // If so, that would mean the Terrarium is basically, well, an insurance policy, so that if the worst happens, there could be a do-over.
                    "523379817296064512": { next: "523379818080399360" },
                    // I mean, relatable.
                    "523379818080399360": { nextOptions: ["523379818885705728", "523379819695206400"], changeExpression: "pensive2" },
                    // [1/2] [What part of that do you relate to?]
                    "523379818885705728": { next: "523379820555038720" },
                        // Well, that's...
                        "523379820555038720": { next: "523379821393899520", changeExpression: "surprised1" },
                        // ...
                        "523379821393899520": { next: "523379822186622976", changeExpression: "pensive1" },
                        // O-of course I want to think that my actions in the past might help save the future. I mean, I think it's natural to want to set things up so the future can be better, even if there's no way to know for sure what helps.
                        "523379822186622976": { next: "523379823033872384", changeExpression: "happy1" },
                        // But...
                        "523379823033872384": { next: "523379823839178752", changeExpression: "pensive2" },
                        // If you think of it another way: to all those who exist in the future, what's happening right now is the past. We want those people of the future to look back at what we're doing and feel like it made all the difference to them.
                        "523379823839178752": { next: "523379824648679424" },
                        // Or, better yet, we want to make it so they never had to worry in the first place.
                        "523379824648679424": { next: "523379825487540224", changeExpression: "happy1" },
                        // What we do here will make all the difference eventually. I have to believe that.
                        "523379825487540224": { nextOptions: ["523379826301235200"] },
                        // [All we can do is live in the moment. I'll head onward.]
                        "523379826301235200": { next: "523379827114930176" },
                        // Things are in a bad state, but... there's a lot to see and love here. I hope you can take the time to enjoy it, too.
                        "523379827114930176": { next: null, changeExpression: "happy1" },
                    // [2/2] [I'll try to stop it before it gets to that.]
                    "523379819695206400": { next: "523379827114930176" },
                // [2/2] [I should probably keep moving.]
                "523379813261144064": { next: "523379827114930176" },
            // [2/3] [What's this area for? Preservation?]
            "523379807615610880": { next: "523379814079033344" },
            // [3/3] [I'll head on in to check it out right now.]
            "523379808395751424": { next: "523379827114930176" },
        }
    },
    "gigihologram_x766_y2011": {
        firstVisitStartEntryId: "523380586816630784",
        entries: {
            // Hi, Beatrix. Fascinating area, right?
            "523380586816630784": { nextOptions: ["523380587600965632", "523380588435632128"], changeExpression: "happy1" },
            // [1/2] [It's almost like some kind of museum!]
            "523380587600965632": { next: "523380589240938496" },
                // That might be what glass cases say to us, but I believe they're here for another purpose. Actually, I'm convinced that they have something to do with the manipulation of time.
                "523380589240938496": { next: "523380590050439168", changeExpression: "pointing1" },
                // I've observed the ones with plants for a while, and I've noticed that time's moving faster inside these cases than outside of them.
                "523380590050439168": { next: "523380590868328448", changeExpression: "happy1" },
                // I think that it must be some way of analyzing the Prismacore's effects on the natural world. Perhaps they're a way to help predict what would happen in the event of a breach.
                "523380590868328448": { nextOptions: ["523380591715577856", "523380592537661440"] },
                // [1/2] [Is it happening with the tiny buildings too?]
                "523380591715577856": { next: "523380593342967808" },
                    // It might be, but I'm not sure.
                    "523380593342967808": { next: "523380594135691264", changeExpression: "happy1" },
                    // Maybe it is, or maybe it's manipulating space instead... or even a third thing that's so alien to us that we'll never have the context to figure it out
                    "523380594135691264": { next: "523380594928414720", changeExpression: "thinking1" },
                    // There are so many mysteries on Rainbow Island, Beatrix, and I don't think we'll solve even half of them in our lifetimes.
                    "523380594928414720": { next: "523380595721138176" },
                    // Sometimes all you can do is look through the glass and wonder about what's happening on the other side.
                    "523380595721138176": { nextOptions: ["523380596513861632"], changeExpression: "pensive1" },
                    // [Do you feel that way often?]
                    "523380596513861632": { next: "523380597340139520" },
                    // I've felt that way for a long time, honestly.
                    "523380597340139520": { next: "523380598174806016", changeExpression: "sad1" },
                    // You know, my whole life was planned out: I'd grow up and then take over the ranch, just like my mom took over from Grandma. One day, I'd pass the ranch down to a child of my own. It was all meant with such love. A beautiful home, our family legacy.
                    "523380598174806016": { next: "523380598980112384", changeExpression: "sad2" },
                    // To me, it was such a small world, like being in one of these domes here, pressing my hands against the glass and imagining the life I'd be living if I hadn't been born on a ranch.
                    "523380598980112384": { next: "523380599785418752", changeExpression: "pensive1" },
                    // I came here to Rainbow Island to try to live that other life. But I'm trapped again now, this time for real. Isn't it ironic? I'm behind glass, shut away like everything else in here.
                    "523380599785418752": { nextOptions: ["523380600670416896"], changeExpression: "pensive2" },
                    // [I'll head out to help free you as soon as I can.]
                    "523380600670416896": { next: "523380601471528960" },
                    // I know we have to hurry, but take some time to enjoy what's in front of you, too.
                    "523380601471528960": { next: null, changeExpression: "happy1" },
                // [2/2] [No time to linger.]
                "523380592537661440": { next: "523380601471528960" },
            // [2/2] [No time to linger, Gigi.]
            "523380588435632128": { next: "523380601471528960" },
        }
    },
    "gigihologram_x991_y1920": {
        firstVisitStartEntryId: "523382731968245760",
        entries: {
            // Oh no... there's gold here. So even the Terrarium is starting to be affected. At least it's probably still a useful shortcut.
            "523382731968245760": { nextOptions: ["523382733075542016", "523382733901819904", "523382734740680704"], changeExpression: "surprised1" },
            // [1/3] [The gold's a problem, right?]
            "523382733075542016": { next: "523382735625678848" },
                // Anywhere close to the Prismacore can be affected by its reality-altering properties. Materials changing from one to another, switching from solid to liquid or gas, flickering entirely out of existence...
                "523382735625678848": { next: "523382736426790912", changeExpression: "surprised1" },
                // Outside the Labyrinth, it's seemingly harmless changes, but here, it's more dangerous. Imagine if the section of the floor you're standing on vanished under you, or if the only door out became a wall of solid rock...
                "523382736426790912": { next: "523382737257263104", changeExpression: "pointing1" },
                // And the gold... that seems to be the most potent of the transmutations, and it's probably the fate of this world if left unchecked.
                "523382737257263104": { next: "523382738058375168", changeExpression: "happy1" },
                // It all feels like King Midas from my storybooks.
                "523382738058375168": { nextOptions: ["523382738859487232"], changeExpression: "pensive1" },
                // [King Midas?]
                "523382738859487232": { next: "523382739689959424" },
                // It's an old myth about a king named Midas who wished to have all he touched turn to gold. He became rich beyond measure, but soon discovered that he could no longer eat or drink, and withered away.
                "523382739689959424": { next: "523382740512043008", changeExpression: "sad1" },
                // When I first discovered the Prismacore, I was horrified at seeing the whole ecosystem turning to gold. I called for help, but those that arrived saw only the value of that gold.
                "523382740512043008": { next: "523382741329932288", changeExpression: "sad2" },
                // ...It ended in disaster when they tried to harness its full power. I won't let that happen again. We can't.
                "523382741329932288": { nextOptions: ["523382742143627264", "523382734740680704"], changeExpression: "pensive1" },
                // [1/2] [So I should hurry and make use of that shortcut?]
                "523382742143627264": { next: "523382742982488064" },
                // Right, I remember there being one there. Though my memory isn't that reliable these days.
                "523382742982488064": { next: "523382743829737472", changeExpression: "pointing1" },
                // Shortcuts are funny things. Space and time are both full of shortcuts, when you think about it — I mean, I used my memories of the area and quantum tech to set up these projectors. That's a kind of time-based shortcut.
                "523382743829737472": { next: "523382744668598272", changeExpression: "happy1" },
                // Physical shortcuts are maybe more recognizable. Knowing there are quick ways back to places you've been before... it can make all the difference, right? It can completely change what you'd otherwise do. I know it has for me.
                "523382744668598272": { next: "523382745478098944" },
                // Though I suppose we often find ourselves in the same place in the end, one way or another.
                "523382745478098944": { nextOptions: ["523382734740680704"] },
            // [2/3] [There's a shortcut through here?]
            "523382733901819904": { next: "523382742982488064" },
            // [3/3] [Time to head on.]
            "523382734740680704": { next: "523382746308571136" },
                // Talk to you soon, Beatrix.
                "523382746308571136": { next: null, changeExpression: "happy1" },
        }
    },
    "gigihologram_x817_y2171": {
        firstVisitStartEntryId: "523383596829536256",
        entries: {
            // Beatrix, look out the window. There's so much more out there than I'd realized.
            "523383596829536256": { nextOptions: ["523383597957804032", "523383598784081920", "523383599606165504"], changeExpression: "surprised1" },
            // [1/3] [Haven't you been there before?]
            "523383597957804032": { next: "523383600424054784" },
                // I haven't. I don't remember seeing anything out those windows. I saw it for the first time just now when you activated the projector.
                "523383600424054784": { next: "523383601229361152", changeExpression: "surprised1" },
                // You know, back then, I really thought I'd walked through the whole facility. I was pretty sure I'd had this whole place mapped out.
                "523383601229361152": { next: "523383602017890304", changeExpression: "happy1" },
                // But times like now, I catch glimpses of what feels like an infinite expanse out there, labyrinth as far as the eye can see. Was it here the whole time and I just... missed it?
                "523383602017890304": { next: "523383602810613760", changeExpression: "thinking1" },
                // Maybe it wasn't, though. It might be made using quantum architecture. That means it could be here in a moment and then gone in a flash... or even both here and not here at the same time.
                "523383602810613760": { next: "523383603599142912", changeExpression: "pointing1" },
                // I mean, I make use of quantum tech often enough myself. It'd be foolish to overlook the possibility.
                "523383603599142912": { nextOptions: ["523383604450586624", "523383605264281600"], changeExpression: "happy1" },
                // [1/2] [How have you been using quantum tech?]
                "523383604450586624": { next: "523383606057005056" },
                    // Oh, a few ways. You're interacting with one right now.
                    "523383606057005056": { next: "523383606879088640", changeExpression: "happy1" },
                    // The projectors themselves aren't quantum in nature, but how I placed them was. You've been unlocking all sorts of gates to get here, right? Well, it's not that I've gone through, placed things, and then locked up again behind myself.
                    "523383606879088640": { next: "523383607663423488", changeExpression: "pointing1" },
                    // Back when I first came here, it was all open and unlocked, so I wandered all over the place. I've used quantum technology to place the projectors in places I remember having seen.
                    "523383607663423488": { next: "523383608443564032", changeExpression: "happy1" },
                    // Though... my memory isn't as reliable as it used to be, so some of them may have gotten lost in transit. I guess we'll find out if and when you activate them.
                    "523383608443564032": { nextOptions: ["523383609236287488", "523383610091925504"] },
                    // [1/2] [So what memory did you use to place this one?]
                    "523383609236287488": { next: "523383610918203392" },
                        // Well, I placed this one because I remembered this lovely little tree. Strangely, a memory came back to me all of a sudden...
                        "523383610918203392": { next: "523383611719315456", changeExpression: "happy1" },
                        // So, there was this one Tabby Slime that was always hanging around the ranch back home. It was just a wild slime, but it came around all the time, and by the afternoon would always just bounce away again.
                        "523383611719315456": { next: "523383612520427520", changeExpression: "pensive1" },
                        // And one day... I decided to follow it.
                        "523383612520427520": { next: "523383613338316800", changeExpression: "sad3" },
                        // It took me deep into the woods. After a while, it did a wiggle at this huge tree and then began to climb it, just jiggling its way from branch to branch all the way up.
                        "523383613338316800": { next: "523383614231703552" },
                        // I followed it. Partway up, I lost sight of the slime, but I kept climbing. Soon enough, I broke the tree cover, and... oh, Beatrix, I don't know how to put it into words.
                        "523383614231703552": { next: "523383615057981440", changeExpression: "happy1" },
                        // I'd never been so high up, and I'd never seen so much of the big, wide world. My entire life had been in the acres around my home, and there I could see just... everything. Trees blanketing the Far, Far Range, birds flying above...
                        "523383615057981440": { next: "523383615863287808", changeExpression: "cheery1" },
                        // It took my breath away. I stayed up there for hours until my mom came looking for me. Boy, did she give me an earful.
                        "523383615863287808": { next: "523383616693760000", changeExpression: "pensive1" },
                        // It wouldn't be the last time I disappeared on her to see the wider world...
                        "523383616693760000": { nextOptions: ["523383617561980928"], changeExpression: "pensive2" },
                        // [We'll get you out to see the world again.]
                        "523383617561980928": { next: "523383618426007552" },
                        // Better make like a tree and leave, then. See you, Beatrix.
                        "523383618426007552": { next: "", changeExpression: "happy1" },
                    // [2/2] [I'll keep looking for the rest, then.]
                    "523383610091925504": { next: "523383618426007552" },
                // [2/2] [I feel like I should move on before this place vanishes too.]
                "523383605264281600": { next: "523383618426007552" },
            // [2/3] [So why did you put the projector here?]
            "523383598784081920": { next: "523383610918203392" },
            // [3/3] [It's amazing... but I'd better press on.]
            "523383599606165504": { next: "523383618426007552" },
        }
    },
    "gigihologram_x1139_y1323": {
        firstVisitStartEntryId: "434166468247711744",
        entries: {
            // It's so easy to get lost in thought admiring this strange architecture and wondering where it all came from, isn't it?
            "434166468247711744": { nextOptions: ["434166470726545408", "434166471175335936", "434166471632515072"], changeExpression: "happy1" },
            // [1/3] [Who do you think built this place?]
            "434166470726545408": { next: "434166472085499904" },
                // There is much evidence across the Far, Far Range that someone or something was here long ago. There are crumbling ruins and the remains of ancient technological devices all over the planet.
                "434166472085499904": { next: "434166472546873344", changeExpression: "surprised1" },
                // These ruins have always been perplexing because they don't seem to have specific functions, at least that we can understand. Not to mention all the slime statues you see everywhere!
                "434166472546873344": { next: "434166473004052480", changeExpression: "thinking1" },
                // But the Labyrinth is different. I believe it was built with a specific purpose in mind.
                "434166473004052480": { nextOptions: ["434166473478008832", "434166471632515072"], changeExpression: "surprised1" },
                // [1/2] [And what purpose is that?]
                "434166473478008832": { next: "434166473964548096" },
                // I think the Prismacore was discovered long ago and this Labyrinth is actually a containment and research facility that was built around it.
                "434166473964548096": { next: "434166474417532928", changeExpression: "pointing1" },
                // They couldn't stop the effects of the Prismacore so they just tried to prevent it from affecting the rest of the Far, Far Range while they looked for a solution.
                "434166474417532928": { next: "434166474862129152", changeExpression: "happy1" },
                // The Labyrinth was designed to be a self-sustaining ecosystem. I think this was to simulate parts of Rainbow Island and see what the Prismacore would do to it over time.
                "434166474862129152": { next: "434166475315113984" },
                // Outside the Labyrinth you have seen mostly chromatic changes to the world, but inside, where the effects are amplified, elemental properties will shift entirely.
                "434166475315113984": { next: "434627962089402368", changeExpression: "thinking1" },
                // I've seen water turn to glass. Flowers turn to metal. It's dire.
                "434627962089402368": { nextOptions: ["434166475772293120"] },
                // [We'll find a way to stop it.]
                "434166475772293120": { next: "434166476250443776" },
                // In time, I hope so. Always in time...
                "434166476250443776": { nextOptions: ["434166470726545408", "434166471175335936", "434166471632515072"], changeExpression: "thinking1" },
            // [2/3] [What about you, Gigi? Where are you from?]
            "434166471175335936": { next: "434166476711817216" },
                // A hard question to answer I guess. I'm actually from not too far from where you now call home. But we would have never crossed paths until now.
                "434166476711817216": { next: "434166477168996352", changeExpression: "thinking1" },
                // I was born on the Far, Far Range. It's my home and it's all I've ever known outside of books.
                "434166477168996352": { next: "434166477621981184", changeExpression: "happy1" },
                // So when I first discovered Rainbow Island it felt so genuinely new, like finding a secret room in your childhood home. I wanted to stay there forever.
                "434166477621981184": { next: "434166478079160320" },
                // But now it feels as though I've lived many lifetimes. My childhood was one of them, and my life on Rainbow Island another. And now that I'm back, well, I suppose that's another. But it's getting fuzzy.
                "434166478079160320": { nextOptions: ["434166478590865408"], changeExpression: "thinking1" },
                // [What do you mean?]
                "434166478590865408": { next: "434166479039655936" },
                // The way I managed to get back, to get another chance to fix what is happening here... well, it wasn't your typical way of traveling. And so now my head is always a little foggy, a little mixed up.
                "434166479039655936": { next: "434166479530389504", changeExpression: "sad1" },
                // The memories I have now feel rearranged, like they're out of order. Sometimes what I did yesterday will feel so distant, like a half-remembered thing from my childhood...
                "434166479530389504": { next: "434166479983374336" },
                // ...and those same childhood memories of mine will suddenly be crystal clear, sometimes even feeling new.
                "434166479983374336": { next: "434166480478302208" },
                // My earliest memory has always been sitting underneath our dining room table and watching my mom vacuum the living room. She didn't know I was there and I just watched her.
                "434166480478302208": { next: "434166480927092736", changeExpression: "pensive2" },
                // I remember that it was a hot day and she looked tired and upset about something. And that used to be it.
                "434166480927092736": { next: "434166481380077568" },
                // But since I came back, that memory has changed. I'm still under the table and she's still vacuuming. The day is hot and she is tired...
                "434166481380077568": { next: "434166481862422528", changeExpression: "sad1" },
                // ...But then she notices me. And her expression suddenly moves to surprise and joy and she stops what she's doing.
                "434166481862422528": { next: "434166482319601664", changeExpression: "pensive2" },
                // She kneels down and we talk about something but I can't hear my own words. I just see her listening and smiling.
                "434166482319601664": { next: "434627965256101888" },
                // And then her expression changes again. She's still smiling and I see tears begin to form in the corners of her eyes, but she holds them back.
                "434627965256101888": { next: "442195192629063680", changeExpression: "pensive1" },
                // And then she tells me that she is so sorry my grandmother never had the chance to meet me.
                "442195192629063680": { next: "442195194155790336", changeExpression: "sad3" },
                // She puts a hand on my shoulder and is about to say something else but the comm station rings and she turns her head.
                "442195194155790336": { next: "442195194625552384" },
                // I can't remember anything more after that.
                "442195194625552384": { nextOptions: ["434166470726545408", "434166471175335936", "434166471632515072"], changeExpression: "pensive1" },
            // [3/3] [I think it's time I head out.]
            "434166471632515072": { next: "434166482772586496" },
                // Happy exploring!
                "434166482772586496": { next: null, changeExpression: "happy1" },
        }
    },
    "gigihologram_x746_y1101": {
        firstVisitStartEntryId: "434192420939919360",
        entries: {
            // I like to call this place Dream Land. I used to make my way up here and while away the hours among the clouds. It's a nice place to forget about your problems.
            "434192420939919360": { nextOptions: ["434192423401975808", "434192423859154944", "434192424307945472"], changeExpression: "cheery1" },
            // [1/3] [Is this where the Labyrinth generates its atmosphere?]
            "434192423401975808": { next: "434192424760930304" },
                // Yes, I think so, maybe even more. There is something different in the air here. It's hard to explain. But it feels almost as if the clouds and even the islands you stand on now are formed from the ether around you.
                "434192424760930304": { next: "434192425192943616", changeExpression: "pointing1" },
                // Not built or assembled, but more gathered from tiny nothings in the air. I've spent a long time on these islands and sometimes I swear I could begin to feel a kind of flow to it. Like I was gaining control over it.
                "434192425192943616": { next: "434192425650122752", changeExpression: "surprised1" },
                // One day I was feeling homesick while I sat here and thought about how when I was little I would be out in my mom's garden in the evening and I would start to smell supper cooking from our house.
                "434192425650122752": { next: "434192426132467712", changeExpression: "cheery1" },
                // I used to delight in seeing vegetables growing right in front of me while smelling their cooked aromas in the air. It felt like things were connected in a way.
                "434192426132467712": { next: "434192426606424064" },
                // And then while I sat here I closed my eyes trying to picture that garden again and in that moment I swear I could smell supper cooking.
                "434192426606424064": { next: "434192427101351936", changeExpression: "pensive1" },
                // When I opened my eyes there was a new island in the distance ahead of me, and on it was the house I grew up in. But it was only there for a moment before fading into the clouds...
                "434192427101351936": { next: "434638300511891456", changeExpression: "thinking1" },
                // ...I still don't know if it was real or not.
                "434638300511891456": { nextOptions: ["434192423401975808", "434192423859154944", "434192424307945472"], changeExpression: "sad1" },
            // [2/3] [Do you have any dreams, Gigi?]
            "434192423859154944": { next: "434192427579502592" },
                // I used to have lots of dreams. I wanted to break free of the expectations my parents had for me. I wanted to be in charge of my own path. So I dreamed of running away and becoming whoever I wanted to be.
                "434192427579502592": { next: "434192428028293120", changeExpression: "pensive2" },
                // I dreamed that one day they would see the person I became and be so happy for me. And everything would be fine somehow. It wouldn't matter that I left them behind.
                "434192428028293120": { next: "434192428472889344", changeExpression: "pensive1" },
                // But when you're young, you sometimes don't see just how broken things are that are right in front of you. Your version of the world is like a foggy bathroom mirror. The shape of things but not the details.
                "434192428472889344": { next: "434192428925874176", changeExpression: "sad1" },
                // I know now that my mom never got over my grandmother's passing. I didn't realize the pressure she felt to continue her legacy and the sadness that just became part of her life... not until long after I was gone too.
                "434192428925874176": { next: "434192429374664704", changeExpression: "pensive2" },
                // Now I dream that someday I will make it back home and somehow my parents will understand why I had to leave. I think that's always what it comes down to... you just want them to understand you.
                "434192429374664704": { nextOptions: ["434192423401975808", "434192423859154944", "434192424307945472"], changeExpression: "sad2" },
            // [3/3] [I think it's time I explore this Dream Land myself.]
            "434192424307945472": { next: "434192429836038144" },
                // Watch your step out here. Dreams can come to an end just like that.
                "434192429836038144": { next: null, changeExpression: "pensive1" },
        }
    },
    "gigihologram_x500_y1104": {
        firstVisitStartEntryId: "434196761864204288",
        entries: {
            // Hello Beatrix. Seems you are not lost in the dream just yet.
            "434196761864204288": { nextOptions: ["434196764397563904", "434196764867325952", "434169722817900544"], changeExpression: "happy1" },
            // [1/3] [Everything here seems to be turning gold...]
            "434196764397563904": { next: "434196765337088000" },
                // Yes, due to Dream Land's proximity to the Prismacore you're seeing some of the worst of its effects.
                "434196765337088000": { next: "434166475315113984", changeExpression: "surprised1" },
                // Outside the Labyrinth you have seen mostly chromatic changes to the world, but inside, where the effects are amplified, elemental properties will shift entirely.
                "434166475315113984": { next: "434196765790072832", changeExpression: "surprised1" },
                // In here I have seen water turn to glass, trees to metal, and whole structures surrounding the Prismacore become nearly invisible before vanishing entirely, as if they just phased right out of reality.
                "434196765790072832": { next: "434196766251446272", changeExpression: "thinking1" },
                // Bit by bit all of Dream Land will turn to gold unless we stop it. Where you stand will grow heavy and fall from the sky. In time, the generated atmosphere here will collapse and further destabilize the Labyrinth.
                "434196766251446272": { next: "434196766717014016" },
                // And once the Labyrinth falls and the Prismacore's energy radiates across the whole of the Far, Far Range, it will transform this world into something unrecognizable, taking all life on the planet with it.
                "434196766717014016": { nextOptions: ["434196767195164672"] },
                // [The slimes...]
                "434196767195164672": { next: "434196767660732416" },
                // Yes, even the tenacious slimes couldn't possibly survive such a catastrophe. But we won't let that happen. You and I will find a way.
                "434196767660732416": { nextOptions: ["434196764397563904", "434196764867325952", "434169722817900544"], changeExpression: "surprised1" },
            // [2/3] [Do you feel lost, Gigi?]
            "434196764867325952": { next: "434196768130494464" },
                // I feel lost all the time. But maybe never more so than when I traveled across the Glass Desert.
                "434196768130494464": { nextOptions: ["434196768587673600", "434166471632515072"], changeExpression: "thinking1" },
                // [1/2] [You crossed the Glass Desert?]
                "434196768587673600": { next: "434196769053241344" },
                    // Yes, twice actually, if you can believe it. And to be honest it nearly killed me...
                    "434196769053241344": { next: "434196769531392000", changeExpression: "surprised1" },
                    // You see, when I started researching the Glass Desert I discovered that the name was hardly befitting such a place. What I saw was verdant and teeming with life.
                    "434196769531392000": { next: "434196769996959744" },
                    // This is due to a very special kind of water that flows there that can almost magically grow- well, who am I kidding, you know this all quite well.
                    "434196769996959744": { next: "434196770475110400" },
                    // So because of this I didn't prepare well enough. And on my return trip... the Glass Desert earned its reputation.
                    "434196770475110400": { next: "434196770932289536", changeExpression: "sad1" },
                    // It was a barren wasteland. The winds stung my face and blinded me. And every time I thought I had my bearing the world around me would erupt into flames.
                    "434196770932289536": { next: "434639513852735488", changeExpression: "thinking1" },
                    // I spent so many days just huddled in caves trying to find the courage to press on. But I knew I had to. I had to get back to Rainbow Island and find a solution.
                    "434639513852735488": { nextOptions: ["434196771376885760", "434166471632515072"], changeExpression: "sad1" },
                    // [1/2] [How did you find the strength to press on?]
                    "434196771376885760": { next: "434196771855036416" },
                    // Gigi pauses for a moment and runs the tatters of her cloak between her fingers.
                    "434196771855036416": { next: "434196772320604160", changeExpression: "sad3", italics: true },
                    // This cloak belonged to my grandmother. Well, it was the blanket that she used to keep around her legs later in life. That's what I saw in photos anyway. And then it belonged to my mother until she gave it to me.
                    "434196772320604160": { next: "434196772781977600", changeExpression: "sad1" },
                    // Mom used to sew up every tear or fray the moment it happened. So many little stitches that didn't quite match, the way she tried to keep it all together.
                    "434196772781977600": { next: "434196773243351040" },
                    // One day I was sitting on the floor of a cave, listening to the storm rage outside. I was wrapped in my cloak and just crying from the weight of it all. I was tired and it all felt unbearable.
                    "434196773243351040": { next: "434196773717307392", changeExpression: "sad3" },
                    // And then I felt my mom protecting me. I looked at all the zigzagging stitches wrapped around me and realized she kept it all together for me, whatever it took to do the job.
                    "434196773717307392": { next: "434196774170292224" },
                    // And maybe now it is torn and frayed and will never be the same. But it's still here. It saved me just like we'll save this place. It might never be quite the same but we'll hold it all together, Beatrix.
                    "434196774170292224": { nextOptions: ["434196764397563904", "434196764867325952", "434169722817900544"], changeExpression: "sad1" },
                // [2/2] [I think it's time I head out.]
                "434166471632515072": { next: "434196774627471360" },
            // [3/3] [I need to be on my way.]
            "434169722817900544": { next: "434196774627471360" },
                // Carry on, Beatrix.
                "434196774627471360": { next: null, changeExpression: "pensive1" },
        }
    },
    "gigihologram_x1004_y1415": {
        firstVisitStartEntryId: "434169717507911680",
        labeledAltEntrypoints: {
            "Subsequent Visit": "434169717507911680_subsequentvisit",
        },
        entries: {
            // What an incredible view... so easy to get lost in the beauty of it. That is, until a Prisma Disruption turns it all to chaos.
            "434169717507911680": { nextOptions: ["434169719974162432"], changeExpression: "cheery1" },
            // What an incredible view... so easy to get lost in the beauty of it. That is, until a Prisma Disruption turns it all to chaos.
            "434169717507911680_subsequentvisit": { nextOptions: ["434169721878376448", "434169722331361280", "434169722817900544"], changeExpression: "cheery1" },
            //   Note: When visiting this Gigi hologram for the first time, the dialog below plays out and Gigi gives you the disrution detector blueprint.
            //         When visiting it for subsequent times, the intro line above skips straight to the nextOptions ["434169721878376448", "434169722331361280", "434169722817900544"] instead.
            //         That is why I have duplicated the first line with the alternate nextOptions as an alternate entrypoint.
            // [Yeah, finding your way around here is hard enough without them.]
            "434169719974162432": { next: "434169720464896000" },
            // I thought that might be the case, so I have been developing a gadget that should prove useful to you.
            "434169720464896000": { next: "434169720938852352", changeExpression: "pointing1" },
            // I call it a Disruption Detector and it does exactly that: placing them around the Labyrinth will tell you when a Prisma Disruption is about to happen in that area. It even works on your map!
            "434169720938852352": { next: "434169721408614400", changeExpression: "happy1" },
            // I'll give you one I made myself as well as the blueprint so you can fabricate as many as you need.
            "434169721408614400": { nextOptions: ["434169721878376448", "434169722331361280", "434169722817900544"] },
            // [1/3] [How do I use the Disruption Detector again?]
            "434169721878376448": { next: "434169723275079680" },
                // Don't worry, I get a little jumbled up in the head sometimes too. Part of the side effects of, well...
                "434169723275079680": { next: "434169723770007552", changeExpression: "surprised1" },
                // Anyway, using a Disruption Detector is easy. Just fabricate one and drop it anywhere in the Labyrinth where you want to track Prisma Disruptions.
                "434169723770007552": { next: "434169724218798080", changeExpression: "pointing1" },
                // Once placed, a Disruption Detector will then let you know if a Prisma Disruption is about to happen or is currently happening in that area.
                "434169724218798080": { next: "434629957986709504", changeExpression: "happy1" },
                // It even works on your map, so be sure to place a bunch and get as much of the Labyrinth covered as possible if you're looking to collect loads of Prisma Plorts, something we'll need when you find me.
                "434629957986709504": { nextOptions: ["434169722331361280", "434169722817900544"] },
            // [2/3] [How do I acquire Prisma Plorts?]
            "434169722331361280": { next: "434169724671782912" },
                // Prisma Plorts can be acquired within the chaotic Prisma Disruptions that happen all over the Labyrinth. Prismatic Disruptions will cause areas to suddenly glow with prismatic energy, intensifying over time.
                "434169724671782912": { next: "434169725158322176", changeExpression: "pointing1" },
                // During these disruptions, you can find food on the ground that has become unstable from the effects of the Prismacore. If you feed this food to slimes, those slimes will produce an Unstable Plort.
                "434169725158322176": { nextOptions: ["434169725653250048"], changeExpression: "happy1" },
                // [Unstable Plorts? How do I stabilize them?]
                "434169725653250048": { next: "434169726093651968" },
                // Unstable plorts can be stabilized into Prisma Plorts using stabilizers that you will find in the Labyrinth. Based on my findings, they come in two forms.
                "434169726093651968": { next: "434169726567608320", changeExpression: "pointing1" },
                // First are the large, ring-like Ancient Stabilizer devices you will find tucked away in the Labyrinth. They're big and hard to miss.
                "434169726567608320": { next: "434169727016398848", changeExpression: "happy1" },
                // Then there are the ethereal Temporal Stabilizers that randomly appear as small, golden rings of energy during Prisma Disruptions. Disruptions are chaotic so keep your eyes peeled.
                "434169727016398848": { next: "434169727490355200" },
                // In either case, shooting Unstable Plorts through these rings will yield Prisma Plorts. And with Ancient Stabilizers you can even leap through them to stabilize all your plorts at once. It's fun!
                "434169727490355200": { next: "434629960771727360", changeExpression: "cheery1" },
                // Well, fun if it weren't for the fact that the world around you at the time is likely exploding with dangerous energies and unstable plorts are flying out of your tank...
                "434629960771727360": { next: "434634062582935552", changeExpression: "thinking1" },
                // Either way, it's an adventure, right?
                "434634062582935552": { nextOptions: ["434169721878376448", "434169722331361280", "434169722817900544"], changeExpression: "cheery1" },
            // [3/3] [I need to be on my way.]
            "434169722817900544": { next: "434169727981088768" },
                // Happy exploring!
                "434169727981088768": { next: null, changeExpression: "cheery1" },
        }
    },
    "gigihologram_x878_y1466": {
        firstVisitStartEntryId: "434198584142491648",
        entries: {
            // I can hardly believe you made it this far, Beatrix. This labyrinth would swallow up a normal person. But you, you're different. I was right to put my faith in you.
            "434198584142491648": { next: "434198586608742400", changeExpression: "surprised1" },
            // The Prismacore lies ahead. Maybe together we now stand a chance of stopping this thing and changing the future of the Far, Far Range...
            "434198586608742400": { nextOptions: ["434198589339234304"], changeExpression: "happy1" },
            
            // Below is dialogue this gigi hologram held before 1.0. I tried to reconstruct it how it was before the 1.0 update removed it. I left it disconnected from the dialogue above, as it is no longer part of the game experience.

            // The conclusion to our story awaits in our next content update! In the meantime be sure to explore the Labyrinth, chat with Gigi everywhere, and build infrastructure with gadgets to aid your travels.
            "434198587065921536": { next: "434198587523100672" },
            // Thank you so much for your support, feedback, and enthusiasm for Slime Rancher. We can't wait for you to see what's next!
            "434198587523100672": { nextOptions: ["434198587980279808", "434198588420681728", "434198588886249472", "434198589339234304"] },
            // [When will the next content update be released?]
            "434198587980279808": { next: "434198589813190656" },
                // You can be the first to know by following Slime Rancher on social media, or by subscribing to our newsletter at <style=\"weblink\"><link=\"https://gsght.com/c/4l9e90\">slimerancher.com</link></style>
                "434198589813190656": { nextOptions: ["434198587980279808", "434198588420681728", "434198588886249472", "434198589339234304"] },
            // [How do I make Slime Rancher even better?]
            "434198588420681728": { next: "434198590266175488" },
                // Slime Rancher is only possible through the support of our community. You can support us by leaving reviews for Slime Rancher, streaming it, or chatting about it with other members of our community.
                "434198590266175488": { next: "434198590719160320" },
                // Even just telling a friend, relative, or particularly influential neighborhood cat about it helps spread the word!
                "434198590719160320": { nextOptions: ["434198587980279808", "434198588420681728", "434198588886249472", "434198589339234304"] },
            // [I really, really love slimes.]
            "434198588886249472": { next: "434198591176339456" },
                // They really, really love you too.
                "434198591176339456": { nextOptions: ["434198587980279808", "434198588420681728", "434198588886249472", "434198589339234304"] },

            // [I'm ready to get back to exploring!]
            "434198589339234304": { next: "434169727981088768" },
                // Note: there are two gigi dialogue translation entries with the exact same text, "Happy exploring!", and I could not determine which was used in this conversation so I just made an educated guess.
                // Happy exploring!
                "434169727981088768": { next: null, changeExpression: "happy1" },
        }
    },
    "gigihologram_x134_y2247": {
        firstVisitStartEntryId: "512404458169856000",
        labeledAltEntrypoints: {
            "After Activating Harmonizers": "528406570288705536",
            "After Stabilizing Core": "nospoilers"
        },
        entries: {
            // Here it is, Beatrix… the Prismacore.\r
            "512404458169856000": { next: "512404595482980352", changeExpression: "happy1" },
            // I was breathless when I first saw it. Seeing the way light twisted and moved within it, the way it seemed to change with every moment… It was like staring into the infinite. If I only knew then what would become of it, of me... of everything.
            "512404595482980352": { next: "512405717933256704", changeExpression: "surprised1" },
            // I’m sorry to have brought you here. To have you pulled you into all this. But it was the only way.\r
            "512405717933256704": { nextOptions: ["527360988719771648"], changeExpression: "sad1" },
            // [But where are you, Gigi?]
            "527360988719771648": { next: "527357008383995904" },
            // I’m afraid I still can’t greet you in person. I would have loved to thank you properly. But I’ve locked myself away in the facility on the other side of this room. I’ll try to explain everything. After all you’ve been through to get here, I at least owe you that much.
            "527357008383995904": { next: "527357083470426112", changeExpression: "pensive2" },
            // So let’s start over. My name is…\r
            "527357083470426112": { next: "527357621113090048", changeExpression: "happy1" },
            // Gigi Twillgers-West.\r
            "527357621113090048": { next: "527357752021512192", changeExpression: "cheery1" },
            // I’m the granddaughter of Hobson and Thora.\r
            "527357752021512192": { nextOptions: ["527356088736706560"], changeExpression: "happy1" },
            // [Wait, how is that possible?]
            "527356088736706560": { next: "527359885328412672" },
            // You might not believe this, but… the short answer is that I’m from the future. In my time, I discovered Rainbow Island and the Prismacore, and… things went badly. It was rapidly destabilizing, and when I tried to fix it, I only made it worse. I called the wrong people to help, and they tried to exploit its unnatural power. 
            "527359885328412672": { next: "527360055189336064", changeExpression: "sad1" },
            // Everything quickly fell apart after that. There was an explosion. Prismatic light tore across Rainbow Island and into the atmosphere of the Far, Far Range. I shielded myself from the blast, but my arm… something happened.
            "527360055189336064": { next: "527360305023053824", changeExpression: "sad2" },
            // The energy from the Prismacore imprinted itself on me. I can feel it coursing in my arm despite my efforts to contain it. It’s why I’ve sealed myself away and needed your help: when I get near the Prismacore it causes the destabilization to accelerate, like it’s reacting to its own energy signature.
            "527360305023053824": { nextOptions: ["527360902036090880"], changeExpression: "sad3" },
            // [But if you’re here, what about back… home?]
            "527360902036090880": { next: "527361539041816576" },
            // My world — the Far, Far Range in my time… it’s on the brink of disaster. The Prismacore’s energy has blanketed the atmosphere and has begun to warp the environment as it has here: changing trees to metal, water to glass, and even phasing the natural world out of reality.
            "527361539041816576": { next: "527361573745487872", changeExpression: "sad1" },
            // In time, there will be nothing left to sustain the ecosystem. Faced with that… knowing that I had a hand in causing it all… I had to do something. 
            "527361573745487872": { nextOptions: ["527363917346402304"], changeExpression: "sad2" },
            // [So how did you… travel here?\r]
            "527363917346402304": { next: "527364226567270400" },
            // Remember during your previous journey in the Glass Desert, where my grandfather led you to a “portal beyond space and time?” When you got there, it seemed like it was ruined.
            "527364226567270400": { next: "527364268539670528", changeExpression: "pointing1" },
            // Well, that’s because I had already used it. I was able to direct the one in my world to this point in our timeline. There was just one problem…
            "527364268539670528": { next: "527364314953838592", changeExpression: "happy1" },
            // …It crumbled from the shock of activating when I arrived. I didn’t realize it would be a one way trip.\r
            "527364314953838592": { nextOptions: ["527365295787634688"], changeExpression: "surprised1" },
            // [So you’re stuck here?]
            "527365295787634688": { next: "527365580824145920" },
            // Yes. Perhaps there’s a way of repairing the portal, but like so many things here, it’s beyond my understanding. So I have to accept that I will never return home... never see my family again.
            "527365580824145920": { next: "527365598020792320", changeExpression: "thinking1" },
            // But it will be worth it if we can somehow stabilize the Prismacore. If we can do that, then not only do we save everything here and now, but it will fix my mistakes in the future. I have to believe that.
            "527365598020792320": { nextOptions: ["527366192357863424"], changeExpression: "happy1" },
            // [How do we stabilize the Prismacore?\n]
            "527366192357863424": { next: "527366405030047744" },
            // In my research here, I have discovered that whoever built the Grey Labyrinth created devices called Harmonizers designed to stabilize the Prismacore… only they just didn’t work. There’s evidence that it was attempted multiple times, each time having the opposite effect and making the situation worse.
            "527366405030047744": { nextOptions: ["527366769041108992"], changeExpression: "pointing1" },
            // [But if they didn’t work before, how will it work this time?]
            "527366769041108992": { next: "527367021353660416" },
            // I’ll have to explain later. But I think I have something that maybe they didn’t… something that might allow it to work this time.
            "527367021353660416": { next: "527367034532163584", changeExpression: "thinking1" },
            // There’s only one problem: the Harmonizers are lost. There’s no record of where they are located. Heck, there’s no record of what they even look like. I am completely in the dark here and don’t know what to do.
            "527367034532163584": { nextOptions: ["528420089105117184"], changeExpression: "sad1" },
            // [You know, your grandfather once gave me some great advice.]
            "528420089105117184": { next: "528419886759309312" },
            // Oh? What did he say? Never give up? To keep pushing through when all the odds are stacked against you? My mom always said grandpa had a way with words.
            "528419886759309312": { nextOptions: ["528420424708157440"], changeExpression: "thinking1" },
            // [He said, “Keep your peepers peeled.”]
            "528420424708157440": { next: "528420990658179072" },
            // Huh? What do you mean?
            "528420990658179072": { nextOptions: ["528421599239106560"], changeExpression: "surprised1" },
            // [The only way to find something hidden is to look for it.]
            "528421599239106560": { next: "528422067466039296" },
            // But where do we even start?\r
            "528422067466039296": { nextOptions: ["528422403345903616"], changeExpression: "thinking1" },
            // [I’ve seen some funny looking walls here. Seems like a good place to start.]
            "528422403345903616": { next: "528422630249361408" },
            // Beatrix, that’s it! I kept thinking I’d find a door or something I couldn’t enter. But what if they’re hidden in plain sight? I… I think I could make some new tech that you could use to test this theory.
            "528422630249361408": { next: "528422765066874880", changeExpression: "cheery1" },
            // Head on over to the Exchange Station on the balcony above and I’ll get you set up!\r
            "528422765066874880": { nextOptions: ["528422907241197568"], changeExpression: "pointing1" },
            // [On my way!]
            "528422907241197568": { next: null },

            // This is it, Beatrix. With the Harmonizers activated, and with your help, I can attempt to stabilize the Prismacore. Are you ready?
            "528406570288705536": { next: "528371201086222336", changeExpression: "surprised1" },
            // It works like this: the Prismacore is constantly emitting a chaotic array of energy waves that seemingly take the form of color in our world. But it’s totally out of sync with our world, in a way that runs deep, like in an elemental way. That’s how it warps reality around it.
            "528371201086222336": { next: "528371269646315520", changeExpression: "pointing1" },
            // But this is where you come in. The Harmonizers you activated emit a special energy pulse that reverberates through the whole of the Labyrinth. Combined, they form a kind of harmonious energy wave, and when directed at the Prismacore, it attempts to change it, to make it harmonious too.
            "528371269646315520": { nextOptions: ["528372202270781440"], changeExpression: "happy1" },
            // [But you said it was attempted before and never worked?]
            "528372202270781440": { next: "528372807345270784" },
            // Yes, that’s true. But I think I have something that the architects of this system did not: my arm. \r
            "528372807345270784": { next: "528372915524759552", changeExpression: "sad1" },
            // I can feel the energy waves of the Prismacore in my arm. I can feel its chaos… and so I think I will be able to change its wavelength and create that harmony. Because I’ll be able to feel it myself.
            "528372915524759552": { nextOptions: ["528373981557452800"], changeExpression: "sad3" },
            // [Ok, what do you need me to do?]
            "528373981557452800": { next: "528374290384056320" },
            // Once you’re ready, I’ll begin overlaying the Harmonizer’s wavelengths onto the Prismacore. This will cause incredible disruptions and send the Prismacore into a state of chaos until we can actually stabilize it.\r\n
            "528374290384056320": { next: "528374334084509696", changeExpression: "pointing1" },
            // This chaos will have a volatile effect on the world around us, transmuting even slimes into masses of horrible Tarr that will fill this room and ultimately destroy everything unless we do something about it.
            "528374334084509696": { next: "528374369555738624", changeExpression: "surprised1" },
            // I’ll need you to fight back and destroy all the Tarr before they destabilize the Prismacore and take us down with it. Normally, water can’t exist here for long. It turns to glass this close to the Prismacore.
            "528374369555738624": { next: "528374611244118016", changeExpression: "pointing1" },
            // But the Harmonizers resonate through the water that flows here now. So grab it when you can and wipe out those Tarr!
            "528374611244118016": { nextOptions: ["528375375807016960"], changeExpression: "happy1" },
            // [What if things get really out of hand?]
            "528375375807016960": { next: "528377335033524224" },
            // I’ve got you covered! I’ve rigged a hydro shower above the Prismacore. It only needs to build up enough pressure to be used. So to do that, pack it full of slimes! Not only might it save the day, but you’ll save some slimes with it.\r\n
            "528377335033524224": { next: "528378858748669952", changeExpression: "cheery1" },
            // Also, I’ll store the contents of your vac tank during the process so you’ll have plenty of room for slimes.\r
            "528378858748669952": { next: "528378932769746944", changeExpression: "happy1" },
            // I know this all sounds like a lot, and a total long shot. But it’s our only chance.\r
            "528378932769746944": { next: "528378958938009600", changeExpression: "pensive1" },
            // So, are you ready?\r
            "528378958938009600": { nextOptions: ["459162940231806976", "528382405372440576", "459163070364282880"], changeExpression: "happy1" },
            // [1/3] [Let’s do this]
            "459162940231806976": { next: "459163883820183552" },
                // Once more, I’m counting on you, Beatrix.\r
                "459163883820183552": { next: null, changeExpression: "happy1" },
            // [2/3] [Can you explain how all this is going to work again?]
            "528382405372440576": { next: "528374290384056320" },   // TODO: double check this is the correct next entry
            // [3/3] [I need to prepare a bit more.]
            "459163070364282880": { next: "459163407372414976" },
                // Come back when you’re ready. I’ll be waiting.
                "459163407372414976": { next: null },   // TODO: specify expression

            // TODO: there's also a "When you’re ready, we can try this again. I believe in you.\r".
            // Where does it belong?
        }
    },
    "gigihologram_x1076_y907": {
        firstVisitStartEntryId: "434189984019935232",
        entries: {
            // It seems you're awfully good at finding secrets. Took me forever to find this spot.
            "434189984019935232": { nextOptions: ["434189987203411968", "434189987656396800", "434189988105187328"], changeExpression: "surprised1" },
            // [1/3] [Secrets seem to be the building blocks of this place.]
            "434189987203411968": { next: "434189988549783552" },
                // It would seem that way. I suspect part of its strange layout is that the Labyrinth was built upon over time. And eventually more creative solutions had to be developed to make it even bigger than it could be.
                "434189988549783552": { nextOptions: ["434189989002768384"], changeExpression: "surprised1" },
                // [Creative solutions?]
                "434189989002768384": { next: "434189989472530432" },
                // You know the way that the Labyrinth appears bigger on the inside than it is outside? I think that was somehow technology adapted from the Prismacore itself.
                "434189989472530432": { next: "434189989963264000", changeExpression: "pointing1" },
                // Because while this sounds crazy, the Prismacore's energy in its most concentrated form seems to be able to bend reality itself.
                "434189989963264000": { next: "434189990416248832", changeExpression: "happy1" },
                // I think the Labyrinth was eventually expanded to try to contain all of the Prismacore's energy, and then when that wasn't working, some kind of reality-bending technology was used to make it even bigger.
                "434189990416248832": { next: "434189990873427968" },
                // But then at some point everything started failing. And the Prismacore's energy is now radiating out across Rainbow Island.
                "434189990873427968": { next: "434637451849003008", changeExpression: "thinking1" },
                // In some ways my arrival to this place was just in time. In time and altogether out of it I suppose..
                "434637451849003008": { nextOptions: ["434189987203411968", "434189987656396800", "434189988105187328"] },
            // [2/3] [Speaking of secrets, why did you pretend to be an AI?]
            "434189987656396800": { next: "434189991326412800" },
                // I'm sorry, but I had to be sure I could trust Viktor, and I needed to know he could figure out what I couldn't. You see, the doors to the Labyrinth were locked to you but not to me. At least, not any more.
                "434189991326412800": { next: "434189991829729280", changeExpression: "thinking1" },
                // When I first encountered the Prismacore, before I got here, when the catastrophe occurred... it left me marked in a way. I tried to shield myself from the blast. I survived, but something was different.
                "434189991829729280": { next: "434189992282714112", changeExpression: "pensive2" },
                // Part of the energy signature of the Prismacore is now a part of me. It's why I can't get too close to it and why I need you to help me.
                "434189992282714112": { next: "434189992735698944", changeExpression: "sad2" },
                // So you need to understand that I just couldn't have it all happen again. If I were to hand over the keys to this place to the wrong person... Well, you'll just have to trust me that this is our last chance at this.
                "434189992735698944": { next: "434189993218043904", changeExpression: "thinking1" },
                // There's no going back for me.
                "434189993218043904": { nextOptions: ["434189987203411968", "434189987656396800", "434189988105187328"], changeExpression: "pensive1" },
            // [3/3] [On to the next secret then...]
            "434189988105187328": { next: "434189993696194560" },
                // If anyone can find it it's you, Beatrix.
                "434189993696194560": { next: null, changeExpression: "pensive1" },
        }
    },
};