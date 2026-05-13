/**
 * B"H
 * @file potions.js
 * @description THE VIALS OF RADIANCE — Restoration potions.
 * 
 * Liquid light that restores the vessels of the soul, allowing the 
 * Chossid to continue his debate with the darkness.
 */

export const POTIONS = {
    potion_light_small: {
        id: "potion_light_small", name: "Vial of Dawn Light",
        category: "Potion", icon: "🧪", rarity: "COMMON", price: 20, sellPrice: 6,
        description: "Restores a small amount of spiritual health.",
        effect: { type: "heal", value: 50 }
    },
    potion_light_medium: {
        id: "potion_light_medium", name: "Chalice of Midday Light",
        category: "Potion", icon: "🧪", rarity: "UNCOMMON", price: 80, sellPrice: 25,
        description: "Potent light from the height of the day.",
        effect: { type: "heal", value: 150 }
    },
    potion_light_grand: {
        id: "potion_light_grand", name: "Elixir of the Infinite Light",
        category: "Potion", icon: "✨", rarity: "RARE", price: 400, sellPrice: 130,
        description: "Bottled Or Ein Sof. Restores all health instantly.",
        effect: { type: "full_heal" }
    },
    potion_revive_spark: {
        id: "potion_revive_spark", name: "Spark of Resurrection",
        category: "Potion", icon: "💫", rarity: "EPIC", price: 1200, sellPrice: 400,
        description: "Can bring a fallen debater back into the light of the study hall.",
        effect: { type: "revive", healPercent: 0.75 }
    },
    potion_mana_ink: {
        id: "potion_mana_ink", name: "Inkwell of Sages",
        category: "Potion", icon: "🖋️", rarity: "UNCOMMON", price: 100, sellPrice: 30,
        description: "Restores energy for Torah debate. The ink of the scholars.",
        effect: { type: "restore_mana", value: 80 }
    }
};
