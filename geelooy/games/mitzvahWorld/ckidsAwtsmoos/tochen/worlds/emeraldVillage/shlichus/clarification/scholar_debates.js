/**
 * B"H
 * @file scholar_debates.js
 * @description 🗣️ CLARIFICATION MISSIONS — Torah Debates 🗣️
 */

export const scholar_debate_missions = {
    "debate_scholars_1": {
        id: "debate_scholars_1", name: "The Great Debate",
        description: "Challenge and win Torah debates against 7 wandering scholars.",
        task: "debate", targetType: "npc", count: 7,
        reward: { money: 2500, xp: 7500,
            item: { id: "verse_scroll_bava", name: "Bava Metzia Logic Scroll", className: "Weapon",
                    stats: { daas: 40, attack: 30 } } }
    },
    "debate_elder": {
        id: "debate_elder", name: "Wisdom of the Elders",
        description: "Defeat Zalman the Elder in a debate about the Tanya.",
        task: "debate", targetId: "w3", count: 1,
        reward: { money: 3500, xp: 10000,
            item: { id: "tanya_sod_scroll", name: "Tanya Secret Scroll", className: "Weapon",
                    stats: { binah: 60, special: "internal_balance" } } }
    },
    "debate_3_masters": {
        id: "debate_3_masters", name: "The Triple Pillar",
        description: "Defeat 3 Debate Masters (Level 3+) in the village square.",
        task: "debate", targetType: "npc", targetLevel: 3, count: 3,
        reward: { money: 4000, xp: 12000,
            item: { id: "garment_jacket_rabbi", name: "Rabbinic Kapota", className: "Apparel",
                    meshName: "jacket", color: "#000000", stats: { defense: 40, daas: 50, binah: 30 } } }
    },
    "clarify_doubt": {
        id: "clarify_doubt", name: "Dissolving Doubt",
        description: "Win a debate against the 'Skeptic' NPC near the library.",
        task: "debate", targetId: "npc_skeptic", count: 1,
        reward: { money: 1500, xp: 5500,
            item: { id: "potion_wisdom", name: "Elixir of Certainty", className: "Potion",
                    icon: "🧪", effect: { buff: { daas: 100, duration: 300 } } } }
    }
};
