/**
 * B"H
 * @file northern_forest.js
 * @description ⚔️ REFINEMENT MISSIONS — Kelipa Combat ⚔️
 */

export const refinement_missions = {
    "refine_klipa_1": {
        id: "refine_klipa_1", name: "Clearing the Thorns",
        description: "Refine 5 Ground-type Kelipos in the northern forest.",
        task: "refine", targetType: "kelipa", targetSubtype: "GROUND", count: 5,
        reward: { money: 1000, xp: 5000,
            item: { id: "garment_shirt_gold", name: "Gold Shirt of Chochmah", className: "Apparel",
                    meshName: "outer-shirt", color: "#ffd700", stats: { chochmah: 50, defense: 20 } } }
    },
    "refine_klipa_fire": {
        id: "refine_klipa_fire", name: "Cooling the Arrogance",
        description: "Refine 3 Fire-type Kelipos haunting the blacksmith.",
        task: "refine", targetType: "kelipa", targetSubtype: "FIRE", count: 3,
        reward: { money: 800, xp: 4000,
            item: { id: "weapon_flame_staff", name: "Staff of Holy Fire", className: "Weapon",
                    stats: { attack: 40, binah: 15 } } }
    },
    "refine_klipa_water": {
        id: "refine_klipa_water", name: "Draining the Indulgence",
        description: "Refine 4 Water-type Kelipos near the river.",
        task: "refine", targetType: "kelipa", targetSubtype: "WATER", count: 4,
        reward: { money: 900, xp: 4500,
            item: { id: "garment_jacket_ocean", name: "Ocean Kapota", className: "Apparel",
                    meshName: "jacket", color: "#006699", stats: { binah: 35, defense: 25, health: 100 } } }
    },
    "refine_klipa_air": {
        id: "refine_klipa_air", name: "Grounding the Vanity",
        description: "Refine 6 Air-type Kelipos on the hilltops.",
        task: "refine", targetType: "kelipa", targetSubtype: "AIR", count: 6,
        reward: { money: 1200, xp: 6000,
            item: { id: "gem_opal", name: "Opal of Atzilus", className: "Gem",
                    stats: { daas: 60, chochmah: 30 } } }
    },
    "refine_10_any": {
        id: "refine_10_any", name: "The Great Purification",
        description: "Refine 10 Kelipos of any type.",
        task: "refine", targetType: "kelipa", count: 10,
        reward: { money: 2000, xp: 8000,
            item: { id: "garment_crown_keser", name: "Crown of Keser", className: "Apparel",
                    meshName: "top-hat", color: "#ffd700", stats: { chochmah: 40, binah: 40, daas: 40, defense: 30 } } }
    },
    "refine_elite_3": {
        id: "refine_elite_3", name: "Shadow of the Elite",
        description: "Defeat 3 Elite Kelipos in the far wilderness.",
        task: "refine", targetType: "kelipa", targetSubtype: "elite", count: 3,
        reward: { money: 3000, xp: 12000,
            verse: { id: "zohar_pala_1", name: "Scroll of Hidden Light", book: "ZOHAR",
                     stats: { daas: 80, special: "hidden_light_aura" } } }
    }
};
