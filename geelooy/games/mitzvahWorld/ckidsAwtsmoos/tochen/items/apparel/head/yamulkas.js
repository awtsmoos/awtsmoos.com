/**
 * B"H
 * @file yamulkas.js
 * @description THE CROWNS OF HUMILITY — Head coverings for the Chossid.
 * 
 * Every Jew is a king; the yamulka is his crown, 
 * reminding him of the Awtsmoos constantly recreating him from above.
 */

export const YAMULKAS = {
    yamulka_black: {
        id: "yamulka_black", name: "Black Suede Yamulka",
        category: "Apparel", slot: "head", meshName: "yamulka",
        color: "#1a1a1a", rarity: "COMMON", price: 30,
        description: "A simple black suede yamulka. A constant reminder of the One Above.",
        stats: { chochmah: 5, defense: 2, humility: 10 },
        sellPrice: 10
    },
    yamulka_velvet: {
        id: "yamulka_velvet", name: "Velvet Shabbos Yamulka",
        category: "Apparel", slot: "head", meshName: "yamulka",
        color: "#440088", rarity: "UNCOMMON", price: 120,
        description: "Rich purple velvet — royal garments for the holy Shabbos.",
        stats: { chochmah: 15, binah: 8, defense: 5, humility: 20 },
        sellPrice: 40
    },
    yamulka_gold: {
        id: "yamulka_gold", name: "Golden Yamulka of the Kohein",
        category: "Apparel", slot: "head", meshName: "yamulka",
        color: "#ffd700", rarity: "EPIC", price: 800,
        description: "Woven with gold thread, echoing the splendor of the Beis Hamikdash.",
        stats: { chochmah: 40, binah: 30, daas: 20, defense: 15, holiness: 50 },
        specialEffect: "prayer_power_up_20pct",
        sellPrice: 250
    },
    yamulka_silk_white: {
        id: "yamulka_silk_white", name: "White Silk Yamulka",
        category: "Apparel", slot: "head", meshName: "yamulka",
        color: "#fdfdfd", rarity: "RARE", price: 450,
        description: "Pure white silk, worn on days of great teshuvah and joy.",
        stats: { binah: 25, daas: 15, defense: 8, purity: 30 },
        sellPrice: 150
    }
};
