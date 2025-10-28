// B"H
// js/data/musagim.js

export const musagim = {
    // --- MALKUTH (Physical Kingdom) ---
    'clay_golem': { name: "Clay Golem", emoji: '🗿', type: 'Physical', baseStats: { hp: 55, attack: 12, defense: 15, diligence: 5 }, moves: ['Pummel', 'Harden'], xpYield: 15, moneyYield: { perutah: 10 } },
    'whispering_grass': { name: "Whispering Grass", emoji: '🌾', type: 'Netzach', baseStats: { hp: 35, attack: 8, defense: 8, diligence: 12 }, moves: ['Sway', 'Root_Bind'], xpYield: 12, moneyYield: { perutah: 5 } },
    'tam_ox': { name: "Tam Ox", emoji: '🐂', type: 'Physical', baseStats: { hp: 70, attack: 15, defense: 10, diligence: 8 }, moves: ['Pummel', 'Gore'], xpYield: 25, notes: "Represents an animal not known to be dangerous (a Tam)." },
    'kicking_rooster': { name: "Kicking Rooster", emoji: '🐓', type: 'Physical', baseStats: { hp: 40, attack: 18, defense: 7, diligence: 15 }, moves: ['Peck', 'Propel_Stones'], xpYield: 22, notes: "Embodies the specific case of indirect damage (Grama)." },

    // --- YESOD (Ethereal Foundation) ---
    'doppelganger': { name: "Doppelganger", emoji: '👥', type: 'Mystical', baseStats: { hp: 60, attack: 15, defense: 10, diligence: 18 }, moves: ['Mirror_Image', 'Shift'], xpYield: 30 },
    'phantasm': { name: "Phantasm", emoji: '👻', type: 'Mystical', baseStats: { hp: 45, attack: 20, defense: 5, diligence: 22 }, moves: ['Ethereal_Strike', 'Fade'], xpYield: 28 },

    // --- MISHNAH CAVERNS (Halachic Concepts) ---
    'pitfall_concept': { name: "Pitfall Concept", emoji: '🕳️', type: 'Physical', baseStats: { hp: 100, attack: 5, defense: 30, diligence: 1 }, moves: ['Collapse', 'Harden'], xpYield: 40, notes: "The essence of a stationary hazard (Bor)." },
    'chatzitzah_slime': { name: "Chatzitzah Slime", emoji: '🦠', type: 'Status', baseStats: { hp: 60, attack: 10, defense: 15, diligence: 10 }, moves: ['Intervene', 'Adhere'], xpYield: 35, notes: "An intervening substance that invalidates purity." },
    'drawn_water_elemental': { name: "Drawn Water Elemental", emoji: '🚰', type: 'Chesed', baseStats: { hp: 70, attack: 15, defense: 15, diligence: 18 }, moves: ['Flow', 'Invalidate'], xpYield: 50, notes: "Water disconnected from its natural source, unfit for a Mikveh." },

    // --- SEFIROT REALMS ---
    'axiom_of_judgment': { name: "Axiom of Judgment", emoji: '⚖️', type: 'Gevurah', baseStats: { hp: 70, attack: 18, defense: 25, diligence: 10 }, moves: ['Pummel', 'Gevurah_Rebuke'], xpYield: 50 },
    'benevolent_stream': { name: "Benevolent Stream", emoji: '💧', type: 'Chesed', baseStats: { hp: 80, attack: 10, defense: 20, diligence: 14 }, moves: ['Soothing_Mist', 'Flow'], xpYield: 40 },
    
    // --- QLIPHOTH (Shadow Concepts) ---
    'shadow_of_doubt': { name: "Shadow of Doubt", emoji: '👤', type: 'Qliphoth', baseStats: { hp: 66, attack: 16, defense: 16, diligence: 16 }, moves: ['Whisper_Negation', 'Fade'], xpYield: 66 },
};