// B"H
/**
 * @module ShlichusManifest
 * @description THE PATHS OF THE SOUL'S MISSION
 * Elaborate quest lines that lead the Chossid through the levels of refinement.
 */

export const SHLICHUS_MANIFEST = {
    "gather_emerald_wood": {
        id: "gather_emerald_wood",
        title: "Gather Wood for the Emerald Homes",
        description: "The street does not stop. Collect 6 pieces of wood/etz/lumber so real houses can receive warm doors, firm stairs, and vessels fit for mitzvos.",
        shortObjective: "Collect 6 Wood.",
        steps: [
            { type: "collect", target: "Wood", itemId: "Wood", amount: 6, description: "Collect 6 pieces of wood from the Emerald Void street." },
            { type: "talk", npcId: "npc_reb_yosei", description: "Return to Reb Yosei, the quest NPC with the exclamation marker." }
        ],
        rewards: { xp: 250, items: [{ itemId: "Wood", amount: 3 }, { itemId: "book_chumash_bereishis", amount: 1 }] }
    },
    "gather_emerald_wood": {
        id: "gather_emerald_wood",
        title: "Gather Wood for the Emerald Homes",
        description: "The street does not stop. Collect 6 pieces of wood/etz/lumber so real houses can receive warm doors, firm stairs, and vessels fit for mitzvos.",
        shortObjective: "Collect 6 Wood.",
        steps: [
            { type: "collect", target: "Wood", itemId: "Wood", amount: 6, description: "Collect 6 pieces of wood from the Emerald Void street." },
            { type: "talk", npcId: "npc_reb_yosei", description: "Return to Reb Yosei, the quest NPC with the exclamation marker." }
        ],
        rewards: { xp: 250, items: [{ itemId: "Wood", amount: 3 }, { itemId: "book_chumash_bereishis", amount: 1 }] }
    },
    "refining_the_dust": {
        id: "refining_the_dust",
        title: "The Refinement of the Dust",
        description: "The wilderness is choked with the Dust Mazikim of Asiyah. They are the physical manifestations of laziness and heavy materiality. You must use the 'Shema Yisrael' to shatter their hold on the physical realm.",
        shortObjective: "Refine 10 Dust Mazikim.",
        steps: [
            { type: "kill", target: "dust", amount: 10, description: "Refine the Dust Mazikim with Pshat." },
            { type: "talk", npcId: "npc_blacksmith", description: "Talk to Yosef the Blacksmith about the Rusty Key." },
            { type: "find", itemId: "key_storage", description: "Retrieve the Storage Key from the Hidden Cave." }
        ],
        rewards: { xp: 500, items: [{ itemId: "key_storage", amount: 1 }] }
    },
    "fire_of_diligence": {
        id: "fire_of_diligence",
        title: "The Fire of Diligence",
        description: "The Fire Mazikim of Beriah represent the heat of destructive anger. Only the holy heat of 'Esh Dos' can transform this fire into a light of diligence and passion for Torah.",
        shortObjective: "Refine 5 Fire Mazikim.",
        steps: [
            { type: "kill", target: "fire", amount: 5, description: "Consume the Fire Mazikim with Drush." },
            { type: "talk", npcId: "npc_gabbai", description: "Consult the Gabbai about the Sanctuary's secrets." },
            { type: "unlock", doorId: "synagogue_secret_door", description: "Unlock the Secret Library in the Synagogue." }
        ],
        rewards: { xp: 1000, skills: ["torah_fire"] }
    },
    "waters_of_kindness": {
        id: "waters_of_kindness",
        title: "The Waters of Kindness",
        description: "The Water Mazikim of Yetzirah are the fluid emotions gone cold. You must bring the warmth of 'V'ahavta' to these frozen hearts to melt them back into the service of the Creator.",
        shortObjective: "Heal 3 Frozen Souls (Water Mazikim).",
        steps: [
            { type: "kill", target: "water", amount: 8, description: "Melt the Water Mazikim with Remez." },
            { type: "collect", itemId: "scroll_torah", amount: 3, description: "Collect 3 Ancient Scrolls from the riverbanks." }
        ],
        rewards: { xp: 750, items: [{ itemId: "book_tehillim", amount: 1 }] }
    }
};
