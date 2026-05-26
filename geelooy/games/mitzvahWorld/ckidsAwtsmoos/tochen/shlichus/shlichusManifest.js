// B"H
/**
 * @module ShlichusManifest
 * @description
 * The Emerald shlichus ledger: wood, herbs, roofs, sparks, coins, klipos,
 * and learning missions. Each key is unique so no mission is silently erased.
 */

export const SHLICHUS_MANIFEST = {
    gather_emerald_wood: {
        id: "gather_emerald_wood",
        title: "Gather Wood for the Emerald Homes",
        description: "Collect wood/etz/lumber so real houses can receive warm doors, firm stairs, and vessels fit for mitzvos.",
        shortObjective: "Collect 6 Wood.",
        steps: [
            { type: "collect", target: "Wood", itemId: "Wood", amount: 6, description: "Collect 6 pieces of wood from the Emerald Void street." },
            { type: "talk", npcId: "npc_reb_yosei", description: "Return to Reb Yosei, the quest NPC with the exclamation marker." }
        ],
        rewards: { xp: 250, items: [{ itemId: "Wood", amount: 3 }, { itemId: "book_chumash_bereishis", amount: 1 }] }
    },
    refine_klipa_1: {
        id: "refine_klipa_1",
        title: "Clear the Northern Dust",
        description: "Yitzchak asks you to refine the dust klipos near the northern path.",
        shortObjective: "Refine 4 Dust Mazikim.",
        steps: [
            { type: "kill", target: "dust", amount: 4, description: "Refine Dust Mazikim with steady pshat." },
            { type: "talk", npcId: "w1", description: "Report back to Yitzchak the Researcher." }
        ],
        rewards: { xp: 160, items: [{ itemId: "TorahPassage", amount: 1 }] }
    },
    collect_perutahs: {
        id: "collect_perutahs",
        title: "Perutahs for the Mikvah",
        description: "Chana is raising holy coins for a new Mikvah.",
        shortObjective: "Collect 100 Perutahs.",
        steps: [
            { type: "collect", target: "Perutah", itemId: "Perutah", amount: 100, description: "Gather coins from battles and street finds." },
            { type: "talk", npcId: "w2", description: "Return the coins to Chana." }
        ],
        rewards: { xp: 120, items: [{ itemId: "simple_lamp", amount: 1 }] }
    },
    debate_elder: {
        id: "debate_elder",
        title: "Debate Zalman the Elder",
        description: "A mixed mission: learn, debate, and prove the Chumash passage is alive.",
        shortObjective: "Win one Torah debate.",
        steps: [
            { type: "learn", target: "bereishis_1_1", description: "Read Bereishis 1:1 with all PaRDeS lenses." },
            { type: "debate", target: "chumash_bereishis_opening", npcId: "w3", amount: 1, description: "Win the opening Torah debate." }
        ],
        rewards: { xp: 300, items: [{ itemId: "passage_shemos_20_2", amount: 1 }] }
    },
    collect_sparks: {
        id: "collect_sparks",
        title: "Sparks for the Menorah",
        description: "Rivka the Devout asks for sparks released from refined kelipos.",
        shortObjective: "Collect 20 Sparks.",
        steps: [
            { type: "collect", target: "Spark", itemId: "Spark", amount: 20, description: "Gather holy sparks from refined enemies." },
            { type: "talk", npcId: "w4", description: "Bring the sparks to Rivka." }
        ],
        rewards: { xp: 180, items: [{ itemId: "small_lamp", amount: 1 }] }
    },
    refine_klipa_fire: {
        id: "refine_klipa_fire",
        title: "Fire at the Forge",
        description: "Baruch the Builder needs help refining fiery anger into Torah warmth.",
        shortObjective: "Refine 3 Fire Mazikim.",
        steps: [
            { type: "kill", target: "fire", amount: 3, description: "Refine fire mazikim near the forge." },
            { type: "talk", npcId: "w5", description: "Return to Baruch for the crafted reward." }
        ],
        rewards: { xp: 220, items: [{ itemId: "simple_hammer", amount: 1 }] }
    },
    gather_healing_herbs: {
        id: "gather_healing_herbs",
        title: "Healing Herbs for the Street",
        description: "Rivka the Herbalist Merchant teaches that even commerce can become kindness.",
        shortObjective: "Collect 5 Healing Herbs.",
        steps: [
            { type: "collect", target: "healing_herb", itemId: "healing_herb", amount: 5, description: "Gather herbs from yard gardens." },
            { type: "shop", npcId: "w14", description: "Open Rivka's shop and trade one herb for a lamp." }
        ],
        rewards: { xp: 140, items: [{ itemId: "small_lamp", amount: 1 }] }
    },
    repair_village_roofs: {
        id: "repair_village_roofs",
        title: "Repair the Village Roofs",
        description: "Noach needs wood and courage so every home can shelter its story.",
        shortObjective: "Bring 3 Wood to Noach.",
        steps: [
            { type: "collect", target: "Wood", itemId: "Wood", amount: 3, description: "Collect roof beams from fallen logs." },
            { type: "talk", npcId: "w15", description: "Give the beams to Noach the Builder." }
        ],
        rewards: { xp: 130, items: [{ itemId: "simple_hammer", amount: 1 }] }
    }
};

export default SHLICHUS_MANIFEST;
