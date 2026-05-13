/**
 * B"H
 * @file shoes.js
 * @description THE PATHWAYS OF THE FEET — Shoes and Sandals.
 * 
 * "How beautiful are your feet in sandals, O prince's daughter" (Song of Songs 7:2).
 * Shoes protect the soul's connection to the earth, allowing it to elevate the physical.
 */

export const SHOES = {
    shoes_leather: {
        id: "shoes_leather", name: "Black Leather Shoes",
        category: "Apparel", slot: "shoes", meshName: "shoes",
        color: "#111111", rarity: "COMMON", price: 90,
        description: "Classic leather shoes. For the long walks of life.",
        stats: { defense: 6, speed: 2, endurance: 10 },
        sellPrice: 28
    },
    shoes_gold: {
        id: "shoes_gold", name: "Golden Sandals of the Kohen",
        category: "Apparel", slot: "shoes", meshName: "shoes",
        color: "#ffd700", rarity: "EPIC", price: 3000,
        description: "Sandals that echo the service of the Priests in the Temple.",
        stats: { defense: 30, speed: 15, daas: 25, holiness: 60 },
        specialEffect: "mountain_walk_no_penalty",
        sellPrice: 1000
    },
    shoes_shabbos_polished: {
        id: "shoes_shabbos_polished", name: "Polished Shabbos Shoes",
        category: "Apparel", slot: "shoes", meshName: "shoes",
        color: "#050505", rarity: "UNCOMMON", price: 300,
        description: "Shoes so polished they reflect the light of the Sabbath candles.",
        stats: { defense: 15, speed: 8, joy: 20 },
        sellPrice: 100
    }
};
