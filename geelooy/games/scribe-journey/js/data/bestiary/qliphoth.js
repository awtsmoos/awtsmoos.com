
// B"H
// js/data/bestiary/qliphoth.js

export const qliphothBeasts = {
    'hollow_crown': { name: "Hollow Crown", emoji: '👑', type: 'Qliphoth', baseStats: { hp: 200, attack: 40, defense: 10, diligence: 5 }, moves: ['Whisper_Negation', 'Collapse'], xpYield: 300, moneyYield: { perutah: 500 } },
    'broken_vessel': { name: "Broken Vessel", emoji: '🏺', type: 'Qliphoth', baseStats: { hp: 80, attack: 35, defense: 5, diligence: 10 }, moves: ['Invalidate', 'Propel_Stones'], xpYield: 100, moneyYield: { perutah: 50 } },
    'stagnant_mire': { name: "Stagnant Mire", emoji: '🤢', type: 'Qliphoth', baseStats: { hp: 150, attack: 10, defense: 30, diligence: 5 }, moves: ['Adhere', 'Collapse'], xpYield: 120, moneyYield: { perutah: 80 } },
    'snake_of_doubt': { name: "Snake of Doubt", emoji: '🐍', type: 'Qliphoth', baseStats: { hp: 110, attack: 30, defense: 20, diligence: 40 }, moves: ['Whisper_Negation', 'Fade'], xpYield: 200, moneyYield: { perutah: 150 } },
    'false_god': { name: "Idol of Ego", emoji: '🗿', type: 'Qliphoth', baseStats: { hp: 250, attack: 50, defense: 50, diligence: 0 }, moves: ['Pummel', 'Gevurah_Rebuke'], xpYield: 500, moneyYield: { perutah: 1000 }, drops: [{itemId: 'kli_ein_sof', chance: 0.01}] }
};
