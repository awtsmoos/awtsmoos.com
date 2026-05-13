/**
 * B"H
 * @file hats.js
 * @description THE SHIELDS OF DAAS — Hats for the Chossid.
 * 
 * A hat is not just a covering; it is a declaration of authority 
 * and the boundary of the intellect (Daas).
 */

export const HATS = {
    hat_basic_black: {
        id: "hat_basic_black", name: "Black Fedora",
        category: "Apparel", slot: "hat", meshName: "top-hat",
        color: "#111111", rarity: "COMMON", price: 80,
        description: "The classic Chassidic fedora. Represents the dignity of a Ben Torah.",
        stats: { daas: 10, defense: 5, charisma: 5 },
        sellPrice: 25
    },
    hat_beaver: {
        id: "hat_beaver", name: "Beaver Felt Fedora",
        category: "Apparel", slot: "hat", meshName: "top-hat",
        color: "#2a1a0a", rarity: "UNCOMMON", price: 250,
        description: "Exquisite beaver felt. A hat that carries the weight of history.",
        stats: { daas: 25, chochmah: 15, defense: 10, kavana: 20 },
        sellPrice: 80
    },
    hat_shtreimel: {
        id: "hat_shtreimel", name: "Shtreimel of the Tzaddik",
        category: "Apparel", slot: "hat", meshName: "top-hat",
        color: "#4a2a00", rarity: "LEGENDARY", price: 5000,
        description: "The crown of Shabbos. Each hair is like an angel of song.",
        stats: { daas: 80, chochmah: 60, binah: 60, defense: 40, health: 100, shabbos_power: 100 },
        specialEffect: "shabbos_aura_all_allies",
        sellPrice: 2000
    },
    hat_flat_cap: {
        id: "hat_flat_cap", name: "Simple Flat Cap",
        category: "Apparel", slot: "hat", meshName: "top-hat",
        color: "#333333", rarity: "COMMON", price: 45,
        description: "A humble worker's cap. Pshat level simplicity.",
        stats: { defense: 8, stamina: 10 },
        sellPrice: 15
    }
};
