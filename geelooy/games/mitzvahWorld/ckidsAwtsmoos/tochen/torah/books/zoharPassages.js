/**
 * B"H
 * @file zoharPassages.js — THE RADIANCE — Zohar Selections
 * The highest tier of secret Torah — Sod of Sod.
 * Unlocked only at very high Madreiga levels.
 */
export const ZOHAR_PASSAGES = [
    {
        id: "zohar_bereishis_1", name: "With Beginning",
        text: "Bereishit bara Elohim — With beginning, G-d created. The word Bereishit itself contains all the worlds.",
        source: "Zohar, Bereishis 1a", icon: "✨",
        category: "Sod", damageType: "Air", tier: "LEGENDARY",
        pardes: {
            pshat:  { power: 70, effect: "Creation quake",        unlockMadreiga: 15, text: "The first word of Torah contains all of creation within it." },
            remez:  { power: 95, effect: "Shatter 3 defenses",    unlockMadreiga: 18, text: "Bereishit = Beit-Reishit — 'for the sake of Torah and Israel.'" },
            drush:  { power: 125, effect: "World-origin blast",   unlockMadreiga: 22, text: "Each letter of Bereishit contains a complete spiritual world." },
            sod:    { power: 160, effect: "Ain Sof revelation",   unlockMadreiga: 30, text: "Bereishit = the first concealment of Ein Sof into the letter Beit." }
        }
    },
    {
        id: "zohar_shma_1", name: "The Hidden Light",
        text: "When the Holy One created His world, He created an exalted hidden light... He concealed it for the righteous.",
        source: "Zohar, Bereishis 31b", icon: "🌟",
        category: "Sod", damageType: "Air", tier: "LEGENDARY",
        pardes: {
            pshat:  { power: 75, effect: "Hidden light reveal",   unlockMadreiga: 15, text: "The Or HaGanuz — hidden light stored for the righteous." },
            remez:  { power: 100, effect: "Reveal hidden drops",  unlockMadreiga: 18, text: "Hidden for righteous = stored in the Torah for those who learn Sod." },
            drush:  { power: 130, effect: "All Kelipas blinded",  unlockMadreiga: 22, text: "When the hidden light shines, Kelipas cannot see or exist." },
            sod:    { power: 165, effect: "Or HaGanuz eruption",  unlockMadreiga: 30, text: "The Or HaGanuz IS the Atzmus — the light that has no vessel." }
        }
    },
    {
        id: "zohar_tikkun_1", name: "Patach Eliyahu",
        text: "Elijah opened and said: Master of the worlds, You are One but not in the numerical sense. You are exalted above all...",
        source: "Tikkunei Zohar, Introduction", icon: "🔮",
        category: "Sod", damageType: "Air", tier: "LEGENDARY",
        pardes: {
            pshat:  { power: 80, effect: "Eliyahu summon",        unlockMadreiga: 15, text: "Elijah's prayer opening the gates of wisdom." },
            remez:  { power: 108, effect: "Prophet's vision",     unlockMadreiga: 18, text: "'You are One but not in the numerical sense' — beyond all Sefirot." },
            drush:  { power: 138, effect: "Beyond-number strike", unlockMadreiga: 22, text: "G-d's unity is absolute — not like physical oneness which admits otherness." },
            sod:    { power: 170, effect: "Yichud Elyon",         unlockMadreiga: 30, text: "The Awtsmoos transcends even the category of 'one' — Ein Sof is before all." }
        }
    },
    {
        id: "zohar_chayyei_1", name: "Lamp of Commandment",
        text: "Come and see: The candle is lit, the Torah gives light, and through it man rises from world to world.",
        source: "Zohar, Chayyei Sarah 121a", icon: "🕯️",
        category: "Sod", damageType: "Fire", tier: "LEGENDARY",
        pardes: {
            pshat:  { power: 72, effect: "Fire light",            unlockMadreiga: 15, text: "Torah as the candle that illuminates all worlds." },
            remez:  { power: 98, effect: "World-jump ability",    unlockMadreiga: 18, text: "Candle=Nefesh, Flame=Ruach, Light=Neshama — the three rising." },
            drush:  { power: 128, effect: "Rise through worlds",  unlockMadreiga: 22, text: "Each Torah insight elevates the soul through the worlds literally." },
            sod:    { power: 162, effect: "Ascent to Atzilus",    unlockMadreiga: 30, text: "The ultimate ascent brings the soul to merge with the Awtsmoos." }
        }
    },
    {
        id: "zohar_vayikra_1", name: "The Secret of Sacrifice",
        text: "One who truly sacrifices his evil inclination before G-d — it is as if he had offered all the sacrifices.",
        source: "Zohar, Vayikra 5a", icon: "🔥",
        category: "Sod", damageType: "Fire", tier: "RARE",
        pardes: {
            pshat:  { power: 65, effect: "Self-sacrifice power",  unlockMadreiga: 10, text: "Inner sacrifice surpasses outer ritual in the eyes of G-d." },
            remez:  { power: 88, effect: "All debuffs to power",  unlockMadreiga: 15, text: "Evil inclination = the Kelipa animal soul offered UP to holiness." },
            drush:  { power: 115, effect: "Triple sacrifice hit",  unlockMadreiga: 20, text: "When the Yetzer Hara is truly conquered, it becomes a holy offering." },
            sod:    { power: 145, effect: "Korban Olah nova",     unlockMadreiga: 28, text: "The inner offering elevates ALL worlds simultaneously like the Olah." }
        }
    }
];
