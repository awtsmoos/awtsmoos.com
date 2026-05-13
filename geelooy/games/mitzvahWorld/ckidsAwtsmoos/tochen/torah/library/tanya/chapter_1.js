/**
 * B"H
 * @file chapter_1.js
 * @description
 * 📕 TANYA CHAPTER 1 — The Two Souls 📕
 * 
 * Chapter 3: The Internal Battle.
 * 
 * This file contains the essence of the first chapter of the Likutei Amarim.
 */

export const tanya_ch1 = {
    id: "tanya_ch1",
    name: "The Tanya Spark",
    source: "Likutei Amarim, Chapter 1",
    book: "TANYA",
    levels: {
        pshat: {
            name: "Pshat",
            description: "Understanding the five categories of people.",
            bonus: { binah: 10, defense: 5 },
            explanation: "The Tzaddik, the Rasha, and the Beinoni (the Intermediate)."
        },
        remez: {
            name: "Remez",
            description: "The spark of the Animal Soul.",
            bonus: { binah: 20, attack: 15 },
            explanation: "Even the Nefesh HaBehamis (Animal Soul) can be refined and elevated."
        },
        drush: {
            name: "Drush",
            description: "The battle for the heart.",
            bonus: { daas: 30, special: "internal_balance" },
            explanation: "The two souls are like two kings fighting for control over a single city — the body."
        },
        sod: {
            name: "Sod",
            description: "The Divine Soul is 'Truly a part of G-d Above'.",
            bonus: { chochmah: 40, special: "divine_spark_aura" },
            explanation: "The Nefesh HaElokis is an actual extension of the Creator's Essence."
        }
    }
};
