/**
 * B"H
 * @file jackets.js
 * @description THE ARMOR OF MALCHUS — Kapotas and Jackets.
 * 
 * The Kapota wraps the soul in the garments of action. 
 * Long and refined, it covers the heart with the dignity of a servant of the King.
 */

export const JACKETS = {
    jacket_basic: {
        id: "jacket_basic", name: "Simple Black Kapota",
        category: "Apparel", slot: "jacket", meshName: "jacket",
        color: "#1a1a1a", rarity: "COMMON", price: 150,
        description: "A standard weekday kapota. Durable and modest.",
        stats: { defense: 12, chochmah: 8, midos: 10 },
        sellPrice: 50
    },
    jacket_shabbos: {
        id: "jacket_shabbos", name: "Shabbos Kapota",
        category: "Apparel", slot: "jacket", meshName: "jacket",
        color: "#001133", rarity: "UNCOMMON", price: 400,
        description: "Silky texture for the Day of Delight.",
        stats: { defense: 25, chochmah: 20, binah: 15, joy: 30 },
        sellPrice: 130
    },
    jacket_rebbe: {
        id: "jacket_rebbe", name: "Kapota of the Rebbe's Court",
        category: "Apparel", slot: "jacket", meshName: "jacket",
        color: "#000000", rarity: "EPIC", price: 2000,
        description: "A garment that has absorbed the atmosphere of the Holy Courtyard.",
        stats: { defense: 50, chochmah: 45, binah: 35, daas: 35, bittul: 50 },
        specialEffect: "bittul_shield_absorb_10pct",
        sellPrice: 700
    },
    jacket_moshiach: {
        id: "jacket_moshiach", name: "White Garment of Redemption",
        category: "Apparel", slot: "jacket", meshName: "jacket",
        color: "#f8f8f8", rarity: "LEGENDARY", price: 15000,
        description: "Luminous white, heralding the end of exile.",
        stats: { defense: 100, chochmah: 100, binah: 100, daas: 100, health: 200, geulah_light: 100 },
        specialEffect: "geulah_aura_all_worlds",
        sellPrice: 6000
    }
};
