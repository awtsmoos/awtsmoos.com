/**
 * B"H
 * @file rods.js
 * @description THE STAVES OF AUTHORITY — Rulers of the Soul.
 * 
 * Staves that focus the spiritual energy of the Chossid into a single 
 * point of light or power.
 */

export const RODS = {
    staff_simple: {
        id: "staff_simple", name: "Simple Wooden Staff",
        category: "Staff", slot: "weapon", icon: "🪄", rarity: "COMMON", price: 60, sellPrice: 18,
        description: "A humble staff for a humble traveler.",
        stats: { attack: 20, defense: 10, support: 10 }
    },
    staff_almond: {
        id: "staff_almond", name: "Almond-Wood Staff of Aaron",
        category: "Staff", slot: "weapon", icon: "🌳", rarity: "RARE", price: 900, sellPrice: 300,
        description: "Echoes the miracle of Aaron's rod that blossomed overnight.",
        stats: { attack: 60, chochmah: 45, daas: 35, growth: 50 },
        specialEffect: "sprout_random_passage_30pct"
    },
    staff_fire_pillar: {
        id: "staff_fire_pillar", name: "Pillar of Fire Staff",
        category: "Staff", slot: "weapon", icon: "🔥", rarity: "EPIC", price: 3500, sellPrice: 1200,
        description: "Harnesses the pillar of fire that guided the Israelites through the desert.",
        stats: { attack: 90, chochmah: 60, binah: 40, light: 80 },
        passiveEffect: { type: "boost_type", damageType: "Fire", amount: 0.25 },
        specialEffect: "fire_crit_25pct"
    }
};
