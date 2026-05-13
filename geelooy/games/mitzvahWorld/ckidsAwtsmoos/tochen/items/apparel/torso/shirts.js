/**
 * B"H
 * @file shirts.js
 * @description THE INNER PURITY — Shirts and Undergarments.
 * 
 * The white shirt is the inner light that glows beneath the dark kapota.
 */

export const SHIRTS = {
    shirt_white: {
        id: "shirt_white", name: "White Weekday Shirt",
        category: "Apparel", slot: "shirt", meshName: "outer-shirt",
        color: "#ffffff", rarity: "COMMON", price: 40,
        description: "Pure white cotton. Simple and clean.",
        stats: { binah: 5, defense: 3, purity: 10 },
        sellPrice: 12
    },
    shirt_shabbos_gold: {
        id: "shirt_shabbos_gold", name: "Golden Shabbos Shirt",
        category: "Apparel", slot: "shirt", meshName: "outer-shirt",
        color: "#ffd700", rarity: "RARE", price: 900,
        description: "Thread of gold for the Golden Shabbos.",
        stats: { binah: 40, chochmah: 30, defense: 18, wealth_merit: 40 },
        specialEffect: "shabbos_xp_boost_50pct",
        sellPrice: 300
    },
    shirt_techelet: {
        id: "shirt_techelet", name: "Techelet Blue Shirt",
        category: "Apparel", slot: "shirt", meshName: "outer-shirt",
        color: "#003366", rarity: "RARE", price: 1200,
        description: "The blue of the sky that leads to the Throne of Glory.",
        stats: { binah: 50, daas: 25, defense: 20, vision: 50 },
        specialEffect: "vision_range_doubled",
        sellPrice: 400
    }
};
