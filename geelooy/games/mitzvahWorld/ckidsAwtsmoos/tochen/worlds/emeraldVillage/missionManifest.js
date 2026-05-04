// B"H
/**
 * @module missionManifest
 * @description THE FIFTEEN SHLICHUYOS — Escalating missions for the Emerald Village
 * Collection quests, boss hunts, crafting, delivery, and epic chains.
 */
export const MISSION_MANIFEST = [
    // ═══ TIER 1: SIMPLE FETCH ═══
    { id: "s_apple", title: "The Apple Brocha", shaym: "Apple Brocha",
      description: "Rabbi Levi needs a red apple from his yard to make a Brocha!",
      giverId: "npc_rabbi_levi", returnToId: "npc_rabbi_levi",
      requirements: { "apple_red": 1 },
      rewards: [{ id: "coin_gold", name: "Golden Shekel", type: "currency", amount: 25 }, { id: "challah", name: "Challah Bread", type: "food", amount: 1 }],
      priority: 1 },
    { id: "s_ink", title: "The Sacred Ink", shaym: "Ink Recovery",
      description: "Shmuel's ink fell behind his study. Find it for Torah scrolls!",
      giverId: "npc_shmuel_scribe", returnToId: "npc_shmuel_scribe",
      requirements: { "ink_bottle": 1 },
      rewards: [{ id: "coin_gold", name: "Golden Shekel", type: "currency", amount: 40 }, { id: "quill_silver", name: "Silver Quill", type: "tool", amount: 1 }],
      priority: 1 },
    { id: "s_harp", title: "The Golden String", shaym: "Harp Repair",
      description: "Dovid lost his golden harp string in his garden!",
      giverId: "npc_dovid_musician", returnToId: "npc_dovid_musician",
      requirements: { "harp_string": 1 },
      rewards: [{ id: "coin_gold", name: "Golden Shekel", type: "currency", amount: 35 }, { id: "music_scroll", name: "Scroll of Tehillim", type: "resource", amount: 1 }],
      priority: 1 },

    // ═══ TIER 2: MULTI-ITEM GATHERING ═══
    { id: "s_wheat", title: "Flour for the Baker", shaym: "Wheat Gathering",
      description: "Sarah needs 3 wheat bundles for Challah!",
      giverId: "npc_sarah_baker", returnToId: "npc_sarah_baker",
      requirements: { "wheat_bundle": 3 },
      rewards: [{ id: "coin_gold", name: "Golden Shekel", type: "currency", amount: 30 }, { id: "challah_special", name: "Special Challah", type: "food", amount: 2 }],
      priority: 2 },
    { id: "s_silver", title: "Tzedakah Collection", shaym: "Silver Collection",
      description: "The Gabbai needs 5 silver shekels for Tzedakah!",
      giverId: "npc_gabbai", returnToId: "npc_gabbai",
      requirements: { "coin_silver": 5 },
      rewards: [{ id: "coin_gold", name: "Golden Shekel", type: "currency", amount: 50 }, { id: "teffilin_bag", name: "Teffilin Bag", type: "resource", amount: 1 }],
      priority: 2 },
    { id: "s_oil", title: "Healing Salves", shaym: "Oil Gathering",
      description: "Miriam needs 2 olive oils for healing salves!",
      giverId: "npc_healer", returnToId: "npc_healer",
      requirements: { "oil_olive": 2 },
      rewards: [{ id: "coin_gold", name: "Golden Shekel", type: "currency", amount: 45 }, { id: "potion_health", name: "Health Potion", type: "tool", amount: 3 }],
      priority: 2 },

    // ═══ TIER 3: RESOURCE CHAINS ═══
    { id: "s_wood", title: "Village Builder", shaym: "Community Effort",
      description: "Moshe needs wood planks! Chop trees with an axe and bring 9 planks!",
      giverId: "npc_moshe_merchant", returnToId: "npc_moshe_merchant",
      requirements: { "wood_plank": 9 },
      rewards: [{ id: "coin_gold", name: "Golden Shekel", type: "currency", amount: 75 }, { id: "blueprint_house", name: "House Blueprint", type: "tool", amount: 1 }],
      priority: 3 },
    { id: "s_scroll", title: "Torah Fragments", shaym: "Scroll Recovery",
      description: "Shlomo needs 3 Torah Scroll Fragments from the wilderness!",
      giverId: "npc_gemDealer", returnToId: "npc_gemDealer",
      requirements: { "scroll_torah": 3 },
      rewards: [{ id: "coin_gold", name: "Golden Shekel", type: "currency", amount: 100 }, { id: "gem_sapphire", name: "Sapphire Gem", type: "resource", amount: 1 }],
      priority: 3 },
    { id: "s_parchment", title: "Mezuzah Restoration", shaym: "Parchment Hunt",
      description: "Shmuel needs 2 mezuzah parchments scattered across the village!",
      giverId: "npc_shmuel_scribe", returnToId: "npc_shmuel_scribe",
      requirements: { "parchment": 2 },
      rewards: [{ id: "coin_gold", name: "Golden Shekel", type: "currency", amount: 60 }, { id: "mezuzah_gold", name: "Golden Mezuzah", type: "resource", amount: 1 }],
      priority: 3 },

    // ═══ TIER 4: EPIC QUESTS ═══
    { id: "s_gems", title: "Sword of Emunah", shaym: "Legendary Forging",
      description: "Yosef needs 5 emerald gems to forge the legendary Sword of Emunah!",
      giverId: "npc_blacksmith", returnToId: "npc_blacksmith",
      requirements: { "gem_emerald": 5 },
      rewards: [{ id: "sword_emunah", name: "Sword of Emunah", type: "tool", amount: 1 }, { id: "coin_gold", name: "Golden Shekel", type: "currency", amount: 200 }],
      priority: 4 },
    { id: "s_lumber_empire", title: "The Lumber Empire", shaym: "Lumber Baron",
      description: "Baruch wants to expand! Bring 15 wood planks from chopped trees!",
      giverId: "npc_lumber", returnToId: "npc_lumber",
      requirements: { "wood_plank": 15 },
      rewards: [{ id: "coin_gold", name: "Golden Shekel", type: "currency", amount: 150 }, { id: "axe_golden", name: "Golden Axe", type: "tool", amount: 1 }],
      priority: 4 },
    { id: "s_apples_feast", title: "The Great Feast", shaym: "Apple Feast",
      description: "Rabbi Levi is hosting a feast! Bring 5 red apples from across the village!",
      giverId: "npc_rabbi_levi", returnToId: "npc_rabbi_levi",
      requirements: { "apple_red": 5 },
      rewards: [{ id: "coin_gold", name: "Golden Shekel", type: "currency", amount: 80 }, { id: "wine_kiddush", name: "Kiddush Wine", type: "food", amount: 3 }],
      priority: 4 },

    // ═══ TIER 5: BOSS HUNTS ═══
    { id: "s_boss_doubt", title: "Vanquish the Shadow of Doubt", shaym: "Shadow Slaying",
      description: "A dark Mazik lurks in the north forest! Defeat it and bring proof!",
      giverId: "npc_gabbai", returnToId: "npc_gabbai",
      requirements: { "gem_emerald": 2 },
      rewards: [{ id: "coin_gold", name: "Golden Shekel", type: "currency", amount: 120 }, { id: "armor_leather", name: "Leather Armor", type: "resource", amount: 1 }],
      priority: 5 },
    { id: "s_boss_void", title: "Face the Void of Despair", shaym: "Void Confrontation",
      description: "The most powerful Mazik hides in the northwest! Only the bravest dare!",
      giverId: "npc_blacksmith", returnToId: "npc_blacksmith",
      requirements: { "gem_sapphire": 2 },
      rewards: [{ id: "coin_gold", name: "Golden Shekel", type: "currency", amount: 300 }, { id: "crown_moshiach", name: "Crown of Moshiach", type: "resource", amount: 1 }],
      priority: 5 },

    // ═══ TIER 6: THE SHATTERED VESSELS (LABYRINTH) ═══
    { id: "s_labyrinth_tohu", title: "The Labyrinth of Tohu", shaym: "Shattered Vessels",
      description: "Far to the southeast (200, 200) lies the dark Labyrinth of Tohu. Find 3 Shards of Tohu to elevate the fallen sparks!",
      giverId: "npc_gabbai", returnToId: "npc_gabbai",
      requirements: { "shard_tohu": 3 },
      rewards: [{ id: "coin_gold", name: "Golden Shekel", type: "currency", amount: 500 }, { id: "sword_light", name: "Sword of Infinite Light", type: "tool", amount: 1 }],
      priority: 6 },
    { id: "s_minotaur_chaos", title: "The Minotaur of Confusion", shaym: "Minotaur Slaying",
      description: "Deep in the Labyrinth resides the Minotaur of Confusion. Slay it to restore order to the realm!",
      giverId: "w7", // Pinchas the Zealot
      returnToId: "w7",
      requirements: { "shard_tohu": 1 }, // He asks for proof of entry
      rewards: [{ id: "coin_gold", name: "Golden Shekel", type: "currency", amount: 600 }, { id: "armor_gold", name: "Golden Armor", type: "resource", amount: 1 }],
      priority: 6 },

    // ═══ TIER 7: THE HEAVENLY ASCENSION (SKY PALACE) ═══
    { id: "s_sky_ascension", title: "Ascent to Binah", shaym: "Heavenly Ascension",
      description: "Far to the northwest (-200, -200) lies a stairway to the Palace of Understanding, 200 feet in the sky. Climb it and retrieve the Crown of Understanding!",
      giverId: "npc_shmuel_scribe", returnToId: "npc_shmuel_scribe",
      requirements: { "crown_binah": 1 },
      rewards: [{ id: "scroll_secrets", name: "Scroll of Heavenly Secrets", type: "resource", amount: 1 }, { id: "cloud_mount", name: "Cloud Mount", type: "tool", amount: 1 }],
      priority: 7 },
    { id: "s_seraph_awe", title: "The Seraph of Awe", shaym: "Angelic Confrontation",
      description: "The Seraph of Awe guards the Sky Palace. Defeat it to prove your spiritual strength!",
      giverId: "w11", // Eliyahu the Mysterious
      returnToId: "w11",
      requirements: { "crown_binah": 1 }, // Proof
      rewards: [{ id: "coin_gold", name: "Golden Shekel", type: "currency", amount: 1000 }, { id: "staff_miracles", name: "Staff of Miracles", type: "tool", amount: 1 }],
      priority: 7 },

    // ═══ TIER 8: THE DESCENT INTO THE KELIPOS ═══
    { id: "s_void_descent", title: "Descent into the Kelipos", shaym: "Void Descent",
      description: "Far to the east (400, -400) lies the Void of the Kelipos. Descend 100 feet into the absolute darkness and retrieve the 3 Lost Sparks of Creation.",
      giverId: "npc_gabbai", returnToId: "npc_gabbai",
      requirements: { "spark_of_creation": 3 },
      rewards: [{ id: "coin_gold", name: "Golden Shekel", type: "currency", amount: 2000 }, { id: "cloak_invisibility", name: "Cloak of the Hidden", type: "apparel", amount: 1 }],
      priority: 8 },
    { id: "s_leviathan_abyss", title: "The Leviathan of the Abyss", shaym: "Leviathan Slaying",
      description: "In the depths of the Void slumbers the Leviathan of the Abyss (1000 HP). Slay it to free the trapped sparks!",
      giverId: "w12", // Yehuda the Guard
      returnToId: "w12",
      requirements: { "spark_of_creation": 1 }, // Proof of entry
      rewards: [{ id: "sword_truth", name: "Sword of Ultimate Truth", type: "tool", amount: 1 }],
      priority: 8 },

    // ═══ TIER 9: THE RESTORATION OF THE RUINS ═══
    { id: "s_temple_restoration", title: "The Temple Restoration", shaym: "Ruins Restoration",
      description: "Far to the west (-400, 400), the Hidden Temple Ruins wait underground. Retrieve the Pure Menorah and the Golden Table.",
      giverId: "npc_rabbi", returnToId: "npc_rabbi",
      requirements: { "menorah_gold": 1, "shulchan_gold": 1 },
      rewards: [{ id: "crown_torah", name: "The Crown of Torah", type: "resource", amount: 1 }, { id: "chariot_fire", name: "Chariot of Fire", type: "vehicle", amount: 1 }],
      priority: 9 }
];
