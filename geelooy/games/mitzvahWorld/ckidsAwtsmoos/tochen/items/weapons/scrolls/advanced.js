/**
 * B"H
 * @file advanced.js
 * @description THE DEEP WELLS — Advanced Torah and Chassidus Scrolls.
 * 
 * Scrolls that reach into the fiery depths of Gemara and the airy 
 * heights of Chassidus and Kabbalah.
 */

export const ADVANCED_SCROLLS = {
    scroll_gemara: {
        id: "scroll_gemara", name: "Gemara Masechta",
        category: "Scroll", slot: "weapon", icon: "📘", rarity: "RARE", price: 700, sellPrice: 230,
        description: "Analytical fire of the Sages. Boosts fire-type moves.",
        stats: { chochmah: 55, binah: 40, daas: 30, attack: 45, analysis: 50 },
        passiveEffect: { type: "boost_type", damageType: "Fire", amount: 0.40 }
    },
    scroll_tanya: {
        id: "scroll_tanya", name: "Tanya — Likkutei Amarim",
        category: "Scroll", slot: "weapon", icon: "📕", rarity: "EPIC", price: 2000, sellPrice: 650,
        description: "The Map of the Soul. Boosts air-type moves and PaRDeS unlocks.",
        stats: { chochmah: 80, binah: 70, daas: 60, attack: 70, soul_depth: 80 },
        passiveEffect: { type: "boost_type", damageType: "Air", amount: 0.50 },
        specialEffect: "pardes_unlock_speed_double"
    },
    scroll_zohar: {
        id: "scroll_zohar", name: "Zohar — Sefer HaZohar",
        category: "Scroll", slot: "weapon", icon: "✨", rarity: "LEGENDARY", price: 10000, sellPrice: 4000,
        description: "The Book of Radiance. Unlocks the secrets of the Zohar.",
        stats: { chochmah: 150, binah: 130, daas: 120, attack: 100, radiance: 150 },
        passiveEffect: { type: "boost_all_types", amount: 0.30 },
        specialEffect: "unlock_zohar_passages"
    }
};
