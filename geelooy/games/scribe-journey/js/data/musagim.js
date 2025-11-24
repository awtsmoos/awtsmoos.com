// B"H
// js/data/musagim.js

export const musagim = {
    // --- MALKUTH (Physical Kingdom) ---
    'clay_golem': { name: "Clay Golem", emoji: '🗿', type: 'Physical', baseStats: { hp: 55, attack: 12, defense: 15, diligence: 5 }, moves: ['Pummel', 'Harden'], xpYield: 15, moneyYield: { perutah: 10 }, drops: [{itemId: 'manna_dew', chance: 0.05}] },
    'whispering_grass': { name: "Whispering Grass", emoji: '🌾', type: 'Netzach', baseStats: { hp: 35, attack: 8, defense: 8, diligence: 12 }, moves: ['Sway', 'Root_Bind'], xpYield: 12, moneyYield: { perutah: 5 }, drops: [{itemId: 'manna_dew', chance: 0.1}] },
    'tam_ox': { name: "Tam Ox", emoji: '🐂', type: 'Physical', baseStats: { hp: 70, attack: 15, defense: 10, diligence: 8 }, moves: ['Pummel', 'Gore'], xpYield: 25, moneyYield: { perutah: 20 }, drops: [] },
    // ADDED: The new Musag!
    'kicking_rooster': { name: "Kicking Rooster", emoji: '🐓', type: 'Physical', baseStats: { hp: 40, attack: 18, defense: 7, diligence: 15 }, moves: ['Peck', 'Propel_Stones'], xpYield: 22, moneyYield: { perutah: 15 }, drops: [{itemId: 'ink_of_potential', chance: 0.05}], notes: "Embodies the specific case of indirect damage (Grama)." },

    // --- YESOD (Ethereal Foundation) ---
    'doppelganger': { name: "Doppelganger", emoji: '👥', type: 'Mystical', baseStats: { hp: 60, attack: 15, defense: 10, diligence: 18 }, moves: ['Mirror_Image', 'Shift'], xpYield: 30, moneyYield: {perutah: 50}, drops: [] },
    'phantasm': { name: "Phantasm", emoji: '👻', type: 'Mystical', baseStats: { hp: 45, attack: 20, defense: 5, diligence: 22 }, moves: ['Ethereal_Strike', 'Fade'], xpYield: 28, moneyYield: {perutah: 40}, drops: [] },

    // --- MISHNAH CAVERNS (Halachic Concepts) ---
    'pitfall_concept': { name: "Pitfall Concept", emoji: '🕳️', type: 'Physical', baseStats: { hp: 100, attack: 5, defense: 30, diligence: 1 }, moves: ['Collapse', 'Harden'], xpYield: 40, moneyYield: {perutah: 0}, drops: [] },
    'chatzitzah_slime': { name: "Chatzitzah Slime", emoji: '🦠', type: 'Status', baseStats: { hp: 60, attack: 10, defense: 15, diligence: 10 }, moves: ['Intervene', 'Adhere'], xpYield: 35, moneyYield: {perutah: 30}, drops: [{itemId: 'dust_of_tiferet', chance: 0.02}] },
    'drawn_water_elemental': { name: "Drawn Water Elemental", emoji: '🚰', type: 'Chesed', baseStats: { hp: 70, attack: 15, defense: 15, diligence: 18 }, moves: ['Flow', 'Invalidate'], xpYield: 50, moneyYield: {perutah: 60}, drops: [] },

    // --- SEFIROT REALMS ---
    'axiom_of_judgment': { name: "Axiom of Judgment", emoji: '⚖️', type: 'Gevurah', baseStats: { hp: 70, attack: 18, defense: 25, diligence: 10 }, moves: ['Pummel', 'Gevurah_Rebuke'], xpYield: 50, moneyYield: {perutah: 100}, drops: [] },
    'benevolent_stream': { name: "Benevolent Stream", emoji: '💧', type: 'Chesed', baseStats: { hp: 80, attack: 10, defense: 20, diligence: 14 }, moves: ['Soothing_Mist', 'Flow'], xpYield: 40, moneyYield: {perutah: 0}, drops: [] },
    
    // --- QLIPHOTH & SPECIAL ---
    'shadow_of_doubt': { name: "Shadow of Doubt", emoji: '👤', type: 'Qliphoth', baseStats: { hp: 66, attack: 16, defense: 16, diligence: 16 }, moves: ['Whisper_Negation', 'Fade'], xpYield: 66, moneyYield: {perutah: 66}, drops: [] },
    // ADDED: The new Musag for the Library of Hod
    'silent_syllogism': { name: "Silent Syllogism", emoji: '🤔', type: 'Mystical', baseStats: { hp: 80, attack: 10, defense: 20, diligence: 25 }, moves: ['Harden', 'Gematria'], xpYield: 75, moneyYield: {perutah: 150}, drops: [{itemId: 'tome_of_gematria', chance: 0.01}] },
};