/**
 * B"H
 * @file consumables.js — POTIONS, FOOD, AND ELIXIRS
 * Healing, buffs, and divine restoration items.
 */
export const CONSUMABLES_REGISTRY = {
    // ─── HEALING ─────────────────────────────────────────────────────────────
    challah_small: {
        id: "challah_small", name: "Shabbos Challah",
        category: "Food", icon: "🍞", rarity: "COMMON", price: 8, sellPrice: 2,
        description: "Fresh-baked challah. Restores the soul as well as the body.",
        effect: { type: "heal", value: 25 }
    },
    challah_round: {
        id: "challah_round", name: "Round Rosh Hashana Challah",
        category: "Food", icon: "🍞", rarity: "UNCOMMON", price: 25, sellPrice: 8,
        description: "Round like the cycle of the year — infinite blessing.",
        effect: { type: "heal", value: 60 }
    },
    rugelach: {
        id: "rugelach", name: "Rugelach",
        category: "Food", icon: "🥐", rarity: "COMMON", price: 12, sellPrice: 4,
        description: "Sweet rolled pastry — the joy of Shabbos in every bite.",
        effect: { type: "heal", value: 35 }
    },
    honey_cake: {
        id: "honey_cake", name: "Lekach Honey Cake",
        category: "Food", icon: "🍰", rarity: "UNCOMMON", price: 40, sellPrice: 12,
        description: "Given away on Erev Yom Kippur. Sweet for a sweet year.",
        effect: { type: "heal", value: 80, buff: { attack: 10, duration: 60 } }
    },
    kugel: {
        id: "kugel", name: "Jerusalem Kugel",
        category: "Food", icon: "🟡", rarity: "UNCOMMON", price: 30, sellPrice: 10,
        description: "Spiced noodle kugel — the taste of Yerushalayim.",
        effect: { type: "heal", value: 50, buff: { defense: 15, duration: 45 } }
    },
    matzah: {
        id: "matzah", name: "Matzah of Freedom",
        category: "Food", icon: "🫓", rarity: "RARE", price: 150, sellPrice: 50,
        description: "The bread of affliction AND freedom. Paradox that heals all.",
        effect: { type: "heal", value: 100, clearDebuffs: true }
    },
    apple_honey: {
        id: "apple_honey", name: "Apple Dipped in Honey",
        category: "Food", icon: "🍎", rarity: "COMMON", price: 10, sellPrice: 3,
        description: "May the new year be sweet — healing and hope combined.",
        effect: { type: "heal", value: 30, buff: { daas: 5, duration: 30 } }
    },

    // ─── POTIONS ─────────────────────────────────────────────────────────────
    potion_light_small: {
        id: "potion_light_small", name: "Vial of Dawn Light",
        category: "Potion", icon: "🧪", rarity: "COMMON", price: 20, sellPrice: 6,
        description: "Bottled morning light. Simple healing.",
        effect: { type: "heal", value: 50 }
    },
    potion_light_medium: {
        id: "potion_light_medium", name: "Chalice of Midday Light",
        category: "Potion", icon: "🧪", rarity: "UNCOMMON", price: 80, sellPrice: 25,
        description: "The full power of noon — concentrated healing.",
        effect: { type: "heal", value: 150 }
    },
    potion_light_grand: {
        id: "potion_light_grand", name: "Elixir of the Infinite Light",
        category: "Potion", icon: "✨", rarity: "RARE", price: 400, sellPrice: 130,
        description: "The Or Ein Sof in drinkable form — complete restoration.",
        effect: { type: "full_heal" }
    },
    potion_revive: {
        id: "potion_revive", name: "Spark of Resurrection",
        category: "Potion", icon: "💫", rarity: "EPIC", price: 1200, sellPrice: 400,
        description: "Teshuvah in liquid form. Rise again, stronger than before.",
        effect: { type: "revive", healPercent: 0.75 }
    },
    elixir_wisdom: {
        id: "elixir_wisdom", name: "Elixir of Chochmah",
        category: "Potion", icon: "🔵", rarity: "RARE", price: 600, sellPrice: 200,
        description: "Distilled wisdom of the sages — boosts Torah debate power.",
        effect: { type: "buff", stats: { chochmah: 50, daas: 30 }, duration: 120 }
    },
    elixir_strength: {
        id: "elixir_strength", name: "Elixir of Gevurah",
        category: "Potion", icon: "🔴", rarity: "RARE", price: 550, sellPrice: 180,
        description: "The red fire of holy strength — for the most intense battles.",
        effect: { type: "buff", stats: { attack: 60, defense: 30 }, duration: 90 }
    },
    elixir_joy: {
        id: "elixir_joy", name: "Nectar of Simcha",
        category: "Potion", icon: "🟡", rarity: "UNCOMMON", price: 200, sellPrice: 65,
        description: "Joy removes the Kelipa of sadness more than anything else.",
        effect: { type: "buff", stats: { attack: 25, speed: 20 }, clearDebuffs: true, duration: 60 }
    },
    potion_mana: {
        id: "potion_mana", name: "Inkwell of Sages",
        category: "Potion", icon: "🖋️", rarity: "UNCOMMON", price: 100, sellPrice: 30,
        description: "The ink of Torah scholars — restores debate energy (Mana).",
        effect: { type: "restore_mana", value: 80 }
    },
    tea_chamomile: {
        id: "tea_chamomile", name: "Herbal Tea of Serenity",
        category: "Food", icon: "🍵", rarity: "COMMON", price: 15, sellPrice: 5,
        description: "Calming herbal tea — the Chassidic remedy for all anxiety.",
        effect: { type: "heal", value: 20, buff: { defense: 10, duration: 30 } }
    }
};

export const CONSUMABLES_LIST = Object.values(CONSUMABLES_REGISTRY);
