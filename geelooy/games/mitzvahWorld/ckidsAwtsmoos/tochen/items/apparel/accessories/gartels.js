/**
 * B"H
 * @file gartels.js
 * @description THE BOUNDARY OF HOLINESS — Gartels for the Chossid.
 * 
 * The gartel separates the heart from the lower desires, creating a vessel 
 * for concentrated prayer and connection to the Awtsmoos.
 */

export const GARTELS = {
    gartel_black: {
        id: "gartel_black", name: "Black Silk Gartel",
        category: "Apparel", slot: "gartel", meshName: "gartel",
        color: "#111111", rarity: "COMMON", price: 50,
        description: "A standard black gartel. Simple separation for prayer.",
        stats: { daas: 10, binah: 5, defense: 3, prayer_focus: 15 },
        sellPrice: 15
    },
    gartel_silk: {
        id: "gartel_silk", name: "Fine Silk Gartel",
        category: "Apparel", slot: "gartel", meshName: "gartel",
        color: "#1a1a1a", rarity: "UNCOMMON", price: 200,
        description: "A finely woven gartel with many strings, representing many mitzvot.",
        stats: { daas: 25, binah: 15, defense: 8, prayer_focus: 30 },
        sellPrice: 65
    },
    gartel_white_yom_kippur: {
        id: "gartel_white_yom_kippur", name: "White Yom Kippur Gartel",
        category: "Apparel", slot: "gartel", meshName: "gartel",
        color: "#ffffff", rarity: "RARE", price: 700,
        description: "Pure white gartel for the Day of Atonement. Reaches the highest soul levels.",
        stats: { daas: 40, binah: 30, defense: 12, health: 50, teshuvah_power: 50 },
        specialEffect: "prayer_critical_chance_15pct",
        sellPrice: 230
    },
    gartel_gold: {
        id: "gartel_gold", name: "Golden Gartel of the Alter Rebbe",
        category: "Apparel", slot: "gartel", meshName: "gartel",
        color: "#ffd700", rarity: "LEGENDARY", price: 8000,
        description: "A legendary gartel said to have been used in the highest Chassidic meditations.",
        stats: { daas: 90, binah: 70, chochmah: 50, defense: 25, health: 150, divine_connection: 100 },
        specialEffect: "alter_rebbe_prayer_mode",
        sellPrice: 3000
    }
};
