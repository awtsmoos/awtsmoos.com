/**
 * B"H
 * @file basic.js
 * @description THE WRITTEN LAW — Basic Torah Scrolls.
 * 
 * Foundation scrolls that provide the grounding for all Torah debate.
 */

export const BASIC_SCROLLS = {
    scroll_chumash: {
        id: "scroll_chumash", name: "Chumash Scroll",
        category: "Scroll", slot: "weapon", icon: "📜", rarity: "COMMON", price: 100, sellPrice: 30,
        description: "The Five Books of Moses. Essential for every Chossid.",
        stats: { chochmah: 20, attack: 15, foundation: 20 },
        passiveEffect: { type: "boost_type", damageType: "Ground", amount: 0.20 }
    },
    scroll_mishnah: {
        id: "scroll_mishnah", name: "Mishnah Volume",
        category: "Scroll", slot: "weapon", icon: "📙", rarity: "UNCOMMON", price: 280, sellPrice: 90,
        description: "The Oral Law crystallized. Boosts water-type moves.",
        stats: { chochmah: 35, binah: 20, attack: 25, law: 30 },
        passiveEffect: { type: "boost_type", damageType: "Water", amount: 0.30 }
    },
    scroll_siddur: {
        id: "scroll_siddur", name: "Daily Siddur",
        category: "Scroll", slot: "weapon", icon: "📖", rarity: "COMMON", price: 50, sellPrice: 15,
        description: "The order of prayer. Boosts healing effects.",
        stats: { daas: 15, binah: 10, prayer: 25 },
        passiveEffect: { type: "boost_heal", amount: 0.15 }
    }
};
