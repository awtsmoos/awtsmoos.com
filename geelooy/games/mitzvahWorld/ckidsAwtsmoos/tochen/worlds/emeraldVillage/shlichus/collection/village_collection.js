/**
 * B"H
 * @file village_collection.js
 * @description 💰 COLLECTION MISSIONS — Tzedakah and Sparks 💰
 */

export const collection_missions = {
    "collect_perutahs": {
        id: "collect_perutahs", name: "Tzedakah Fund",
        description: "Collect 1000 Perutahs from winning battles and debates.",
        task: "collect_currency", targetCurrency: "perutahs", count: 1000,
        reward: { xp: 8000,
            item: { id: "gartel_silk", name: "Silk Gartel of Distinction", className: "Apparel",
                    meshName: "gartel", color: "#f5f5f5", stats: { daas: 40, health: 100 } } }
    },
    "collect_sparks": {
        id: "collect_sparks", name: "Gathering Sparks",
        description: "Collect 20 Holy Sparks dropped by Kelipos.",
        task: "collect_item", targetItem: "holy_spark", count: 20,
        reward: { money: 1200, xp: 7000,
            item: { id: "gem_diamond", name: "Diamond of Unity", className: "Gem",
                    stats: { chochmah: 50, binah: 50, daas: 50 } } }
    },
    "collect_5_apples": {
        id: "collect_5_apples", name: "The Sweetness of Fruit",
        description: "Collect 5 Sacred Apples from Rabbi Levi's garden.",
        task: "collect_item", targetItem: "apple_red", count: 5,
        reward: { money: 500, xp: 3000,
            item: { id: "potion_mana", name: "Nectar of Understanding", className: "Potion",
                    icon: "🥤", effect: { heal_mana: 100 } } }
    }
};
