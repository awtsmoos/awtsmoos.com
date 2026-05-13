/**
 * B"H
 * @file ch1.js — Pirkei Avos, Chapter 1
 * @description THE GREAT ASSEMBLY — First Vessels of Wisdom
 * Each perek in its own vessel, infinitely expandable.
 */

export const AVOS_CH1 = [
    {
        id: "avos_1_1",
        name: "The Great Assembly",
        text: "Be deliberate in judgment, raise many students, and make a fence for the Torah.",
        author: "Men of the Great Assembly", verse: 1,
        pardes: {
            pshat:  { power: 30, effect: "Small Ground damage",  unlockMadreiga: 0,  text: "Direct instruction: deliberate, teach, protect." },
            remez:  { power: 50, effect: "Defense +15%",          unlockMadreiga: 5,  text: "Fence = protective layers around divine speech (Yesod)." },
            drush:  { power: 70, effect: "Summon 2 student allies",unlockMadreiga: 10, text: "Every student raised is a cosmic light multiplied." },
            sod:    { power: 95, effect: "Break all enemy fences", unlockMadreiga: 20, text: "'Geder' = 32 paths of Chochmah (lev). Fence IS wisdom." }
        },
        damageType: "Ground", icon: "📜"
    },
    {
        id: "avos_1_2",
        name: "Three Pillars of the World",
        text: "The world stands on three things: Torah, Avodah, and Gemilut Chasadim.",
        author: "Shimon the Righteous", verse: 2,
        pardes: {
            pshat:  { power: 45, effect: "Solid Ground strike",   unlockMadreiga: 0,  text: "Three pillars sustaining creation physically." },
            remez:  { power: 65, effect: "Boost all 3 stats",     unlockMadreiga: 5,  text: "Torah=Chochmah, Avodah=Binah, Chesed=Daas." },
            drush:  { power: 85, effect: "Cannot be dodged",      unlockMadreiga: 10, text: "Without any pillar the Kelipa gains total hold." },
            sod:    { power: 120, effect: "Triple world-shatter",  unlockMadreiga: 20, text: "Three garments of the soul: thought, speech, action." }
        },
        damageType: "Ground", icon: "🌍"
    },
    {
        id: "avos_1_4",
        name: "Sit in the Dust",
        text: "Let your house be a meeting place; sit in the dust of their feet and drink their words with thirst.",
        author: "Yose ben Yoezer", verse: 4,
        pardes: {
            pshat:  { power: 30, effect: "Restore 15 Mana",       unlockMadreiga: 0,  text: "Total bittul before wisdom — beginning of all learning." },
            remez:  { power: 50, effect: "Confusion 1 turn",      unlockMadreiga: 5,  text: "Dust = lowliness; from lowliness come highest revelations." },
            drush:  { power: 70, effect: "Absorb next attack",    unlockMadreiga: 10, text: "Thirst for Torah is the vessel for Infinite Light." },
            sod:    { power: 90, effect: "Dust→Light reveal",     unlockMadreiga: 20, text: "'Afar' (dust) = same letters as 'ohr' (light). Dust IS light." }
        },
        damageType: "Water", icon: "💧"
    },
    {
        id: "avos_1_6",
        name: "Judge Favorably",
        text: "Receive every person with a pleasant countenance. Judge every person favorably.",
        author: "Yehoshua ben Perachya", verse: 6,
        pardes: {
            pshat:  { power: 28, effect: "Heal 20HP",              unlockMadreiga: 0,  text: "Fence against baseless hatred — see the good in others." },
            remez:  { power: 48, effect: "Reflect 25% damage",     unlockMadreiga: 5,  text: "Pleasant face = Shechinah smiling; merit = hidden sparks." },
            drush:  { power: 68, effect: "Flip next attack 50%",   unlockMadreiga: 10, text: "Every person contains a hidden spark — seeing it releases it." },
            sod:    { power: 88, effect: "Mercy barrier 2 turns",  unlockMadreiga: 20, text: "Kaf zchut = 537 = 'anavah' + 'ahavah'. Mercy IS love." }
        },
        damageType: "Air", icon: "☁️"
    },
    {
        id: "avos_1_14",
        name: "If Not Now, When?",
        text: "If I am not for myself, who will be for me? And if not now, when?",
        author: "Hillel", verse: 14,
        pardes: {
            pshat:  { power: 50, effect: "Fire burst",             unlockMadreiga: 0,  text: "Personal responsibility, communal duty, urgency." },
            remez:  { power: 72, effect: "Burn 2 turns",           unlockMadreiga: 5,  text: "'Not now' = Kelipa of procrastination. Fire burns NOW." },
            drush:  { power: 90, effect: "Burn 3 turns",           unlockMadreiga: 10, text: "Every moment of delay is a world lost." },
            sod:    { power: 115, effect: "Moshiach-NOW blast",    unlockMadreiga: 20, text: "'When' (Matai) = Moshiach. The answer IS the question." }
        },
        damageType: "Fire", icon: "🔥"
    },
    {
        id: "avos_1_15",
        name: "Greet Everyone in Peace",
        text: "Make your Torah fixed; say little, do much; receive every person with a pleasant face.",
        author: "Shammai", verse: 15,
        pardes: {
            pshat:  { power: 28, effect: "Heal 20HP/2 turns",     unlockMadreiga: 0,  text: "Consistency, reliability, warmth — the three pillars of peace." },
            remez:  { power: 45, effect: "Defense barrier",        unlockMadreiga: 5,  text: "Fixed (keva) = immovable foundation stone of Yesod." },
            drush:  { power: 65, effect: "Invisible for 1 turn",  unlockMadreiga: 10, text: "Tzaddik acts without proclamation — deeds speak." },
            sod:    { power: 88, effect: "13 Mercy Attributes aura", unlockMadreiga: 20, text: "Pleasant face = 13 attributes of mercy illuminating the countenance." }
        },
        damageType: "Ground", icon: "🤝"
    },
    {
        id: "avos_1_18",
        name: "Three Things Sustain the World",
        text: "The world is sustained by three things: justice, truth, and peace.",
        author: "Rabban Shimon ben Gamliel", verse: 18,
        pardes: {
            pshat:  { power: 40, effect: "Stabilize ground",      unlockMadreiga: 0,  text: "Justice, truth, peace — the social contract of creation." },
            remez:  { power: 60, effect: "Neutralize debuffs",    unlockMadreiga: 5,  text: "Truth (emet) = Tiferet; Peace (shalom) = Yesod; Justice = Malchus." },
            drush:  { power: 80, effect: "All enemies confused",  unlockMadreiga: 10, text: "When one pillar falls the Kelipa enters through the gap." },
            sod:    { power: 105, effect: "Perfect world manifest",unlockMadreiga: 20, text: "These three = Emet, Shalom, Din = three lower pillars of the sefirotic tree." }
        },
        damageType: "Ground", icon: "⚖️"
    }
];
