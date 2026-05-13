/**
 * B"H
 * @file pants.js
 * @description THE FOUNDATIONS OF STABILITY — Pants for the Chossid.
 * 
 * Simple and dignified, the pants provide the groundedness needed to 
 * walk the path of the Awtsmoos in the physical world.
 */

export const PANTS = {
    pants_black: {
        id: "pants_black", name: "Simple Black Pants",
        category: "Apparel", slot: "pants", meshName: "pants",
        color: "#1a1a1a", rarity: "COMMON", price: 60,
        description: "Standard black pants. Solid and reliable.",
        stats: { defense: 8, daas: 3, groundedness: 15 },
        sellPrice: 18
    },
    pants_white_shabbos: {
        id: "pants_white_shabbos", name: "White Shabbos Pants",
        category: "Apparel", slot: "pants", meshName: "pants",
        color: "#f0f0f0", rarity: "UNCOMMON", price: 200,
        description: "Pristine white pants for the Sabbath Queen. Pure light.",
        stats: { defense: 18, daas: 20, chochmah: 10, purity: 25 },
        sellPrice: 65
    },
    pants_refined_wool: {
        id: "pants_refined_wool", name: "Refined Wool Slacks",
        category: "Apparel", slot: "pants", meshName: "pants",
        color: "#222222", rarity: "RARE", price: 500,
        description: "High-quality wool that repels the dust of the mundane.",
        stats: { defense: 35, daas: 30, binah: 15, resistance: 40 },
        sellPrice: 150
    }
};
