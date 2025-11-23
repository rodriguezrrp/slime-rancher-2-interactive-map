
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
                        { next: string | null; changeExpression?: import("../src/types.js").GigiExpression }
                        | { nextOptions: string[]; changeExpression?: import("../src/types.js").GigiExpression }
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
    // "": {
    //     firstVisitStartEntryId: ,
    //     entries: {
    //         //
    //         "": { next: "" },
    //     }
    // },
}