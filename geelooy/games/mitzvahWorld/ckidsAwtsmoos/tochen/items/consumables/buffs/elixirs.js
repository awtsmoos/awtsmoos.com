/**
 * B"H
 * @file elixirs.js
 * @description THE DROPS OF WISDOM — Stat-boosting elixirs.
 * 
 * Concentrated attributes of the soul, designed to amplify specific 
 * Sefirotic powers for a limited time.
 */

export const ELIXIRS = {
    elixir_chochmah: {
        id: "elixir_chochmah", name: "Elixir of Chochmah",
        category: "Potion", icon: "🔵", rarity: "RARE", price: 600, sellPrice: 200,
        description: "Amplifies the flash of inspiration. Increases debate power.",
        effect: { type: "buff", stats: { chochmah: 50, daas: 30 }, duration: 120 }
    },
    elixir_gevurah: {
        id: "elixir_gevurah", name: "Elixir of Gevurah",
        category: "Potion", icon: "🔴", rarity: "RARE", price: 550, sellPrice: 180,
        description: "Strengthens the soul's resolve and analytical fire.",
        effect: { type: "buff", stats: { attack: 60, defense: 30 }, duration: 90 }
    },
    elixir_joy_simcha: {
        id: "elixir_joy_simcha", name: "Nectar of Simcha",
        category: "Potion", icon: "🟡", rarity: "UNCOMMON", price: 200, sellPrice: 65,
        description: "Removes the coldness of apathy. Increases speed and attack.",
        effect: { type: "buff", stats: { attack: 25, speed: 20 }, clearDebuffs: true, duration: 60 }
    },
    elixir_binah: {
        id: "elixir_binah", name: "Essence of Binah",
        category: "Potion", icon: "💎", rarity: "RARE", price: 580, sellPrice: 190,
        description: "Deepens the understanding of the heart. Boosts defense and binah.",
        effect: { type: "buff", stats: { binah: 45, defense: 40 }, duration: 100 }
    }
};
