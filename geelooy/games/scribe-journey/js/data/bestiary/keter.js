
// B"H
// js/data/bestiary/keter.js

export const keterBeasts = {
    'infinite_light': { name: "Infinite Light", emoji: '✨', type: 'Keter', baseStats: { hp: 300, attack: 10, defense: 60, diligence: 60 }, moves: ['Flow', 'Fade'], xpYield: 500, moneyYield: { perutah: 0 } },
    'silent_aleph': { name: "Silent Aleph", emoji: '🤫', type: 'Keter', baseStats: { hp: 250, attack: 5, defense: 80, diligence: 50 }, moves: ['Harden', 'Endure'], xpYield: 400, moneyYield: { perutah: 300 } },
    'crown_of_will': { name: "Crown of Will", emoji: '👑', type: 'Keter', baseStats: { hp: 400, attack: 40, defense: 40, diligence: 40 }, moves: ['Gematria', 'Gevurah_Rebuke'], xpYield: 1000, moneyYield: { perutah: 1000 }, drops: [{itemId: 'kli_ein_sof', chance: 0.1}] },
    'primordial_torah': { name: "Primordial Letter", emoji: '📜', type: 'Keter', baseStats: { hp: 150, attack: 30, defense: 30, diligence: 30 }, moves: ['Analyze', 'Ethereal_Strike'], xpYield: 350, moneyYield: { perutah: 200 } }
};
