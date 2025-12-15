
// B"H
// js/data/maps/malkuth_main.js

export const malkuthMainMaps = {
    'malkuth_village': {
        width: 25,
        baseLayerString: `
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
🌳⬜⬜⬜⬜⬜⬜⬜⬜⬜📜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳⬜🏠⬜🏠⬜⬜⬜⬜🌳⬜🌳⬜⬜⬜⬜⬜🌳🌳🌳🌳🌳⬜🌳
🌳⬜⬜⬜⬜⬜🌳🌳🌳🌳⬜🌳🌳🌳👨⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳🌳🌳⬜🌳🌳⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳🍞⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳⬜⬜⬜🔥⬜⬜⬜⬜⬜⬜⬜🌳🌳🌳⬜🚪⬜🌳🌳🌳⬜⬜🌳
🌳👨‍🌾⬜💧⬜⬜🌿⬜⬜⬜⬜⬜🌳⬜⬜⬜⬜⬜🌳🌳🌳⬜⬜🌳
🌳⬜🌱🌱🌱⬜🌿⬜⬜⬜👨🐂⬜⬜⬜⬜⬜🌳🌳🌳🏜️⬜🌳
🌳🌳🌳🌳🌳🌳🌳🌳🌳⬜⬜⬜⬜⬜⬜⬜🌳🌳🌳🌳🌳⬜🌳
🌳⬜⚖️⬜🌾🌾⬜⬜⬜⬜⬜🛒⬜⬜🏦⬜⬜⬜⬜⬜⬜⬜🌳
🌳🚪⬜⬜🌾🌾⬜⬜⬜⬜⬜⬜⬜⬜⬜🌀⬜⬜⬜☁️⬜⛰️🌳
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🅰️🌳🌳🌳🗿🌳🌳🌳🌀🌳🌳🌳
        `,
        encounters: {
            '🌾': [
                { id: 'dust_mite', levelRange: [2, 4], chance: 0.5 },
                { id: 'stray_cat', levelRange: [3, 5], chance: 0.3 },
                { id: 'field_mouse', levelRange: [1, 3], chance: 0.4 },
                { id: 'lazy_dog', levelRange: [2, 5], chance: 0.2 },
                { id: 'lashon_hara_snake', levelRange: [5, 10], chance: 0.05 } 
            ]
        },
        interactables: {
            'elder_scribe': { type: 'npc', emoji: '📜', questGiver: 'main_quest_1', dialogue: { start: ["The path to the upper realms lies through the shimmering door to the east.", "But first, explore the village. You may find tasks that need doing."] } },
            'house_1': { type: 'door', emoji: '🏠', targetMap: 'scribe_atheneum_main', targetX: 5, targetY: 6 },
            'house_2': { type: 'door', emoji: '🏠', targetMap: 'merchant_house', targetX: 3, targetY: 3 },
            'yesod_door': { type: 'door', emoji: '🚪', targetMap: 'yesod_shore', targetX: 1, targetY: 4 },
            'fields_door': { type: 'door', emoji: '🚪', targetMap: 'malkuth_fields', targetX: 1, targetY: 5 },
            'netzach_door': { type: 'door', emoji: '🚪', targetMap: 'netzach_wilds_entrance', targetX: 18, targetY: 14 },
            'chanukah_door': { type: 'door', emoji: '⛰️', targetMap: 'maccabee_caves', targetX: 2, targetY: 4 },
            'gan_eden_door': { type: 'door', emoji: '☁️', targetMap: 'gan_eden_gate', targetX: 10, targetY: 8, dialogue: {start: ["You see a ladder of light ascending into the clouds..."]} },
            
            'court_door': { type: 'door', emoji: '⚖️', targetMap: 'court_of_guardians', targetX: 7, targetY: 6 },
            'vineyard_door': { type: 'door', emoji: '🍇', targetMap: 'vineyard_of_labor', targetX: 1, targetY: 5 }, 
            'gehinnom_pit': { type: 'door', emoji: '🔥', targetMap: 'gehinnom_gate', targetX: 7, targetY: 2, dialogue: {start: ["(A heat radiates from this fissure. It smells of sulfur and... cleansing?)"]} },
            'tractate_portal': { type: 'door', emoji: '🌀', targetMap: 'procedural_tractate', condition: { type: 'hasItem', itemId: 'tractate_key' } },
            'tower_portal': { type: 'door', emoji: '🅰️', targetMap: 'tower_aleph', targetX: 7, targetY: 6, dialogue: {start: ["The Tower of Letters. Enter to master the Aleph-Bet."]} },
            
            // Added 1234 Tower Entrance
            'tower_1234_entrance': { type: 'door', emoji: '🆙', targetMap: 'tower_lobby', targetX: 7, targetY: 6, x: 23, y: 1 },

            // ADDED 55 CHAOS DIMENSIONS ENTRANCE
            'chaos_portal': { type: 'door', emoji: '🌀', targetMap: 'insanity_level_1', targetX: 1, targetY: 1, x: 1, y: 12, dialogue: {start: ["(This swirling vortex hurts to look at. It whispers 55 names of nothingness).", "Enter the Chaos?"]} },

            // ADDED 677 IDOL HALL ENTRANCE
            'idol_hall_door': { type: 'door', emoji: '🗿', targetMap: 'hall_of_idols', targetX: 20, targetY: 38, dialogue: {start: ["(The Hall of 677 Idols. Only a Maccabee can clear this place.)"]} },

            // --- NEW: LABYRINTH OF 67 ---
            'labyrinth_67_door': { 
                type: 'door', emoji: '🌀', targetMap: 'labyrinth_1', targetX: 7, targetY: 7, x: 22, y: 12, 
                dialogue: {start: ["(A Gateway of Extreme Complexity. 67 layers of reality shift before your eyes.)", "Enter the Labyrinth of 67?"]} 
            },

            'bakery_door': { type: 'door', emoji: '🍞', targetMap: 'bakery_interior', targetX: 5, targetY: 5 },
            'mikveh_door': { type: 'door', emoji: '💧', targetMap: 'mikveh_entrance', targetX: 5, targetY: 5 },
            'midbar_door': { type: 'door', emoji: '🏜️', targetMap: 'midbar_entrance', targetX: 1, targetY: 5, dialogue: {start: ["(A dry wind blows from the south. The Wilderness of Wandering lies ahead.)"]} },
            
            'temple_path': { type: 'door', emoji: '🏛️', targetMap: 'temple_mount_entrance', targetX: 10, targetY: 10, x: 23, y: 3 }, 
            'refuge_path': { type: 'door', emoji: '🏃', targetMap: 'city_of_refuge', targetX: 10, targetY: 5, x: 1, y: 1 },
            
            'reuven': { type: 'npc', emoji: '👨', questGiver: 'nizkei_mamon_1_goring_ox', dialogue: { 
                start: ["Scribe, thank heavens! My prize ox... gored by Shimon's beast!", {acceptQuest: 'nizkei_mamon_1_goring_ox'}] 
            }},
            
            'trader_levi': { type: 'npc', emoji: '🛒', shop: true, dialogue: { start: ["Kelim for sale! I also found this strange Key...", {giveItem: 'tractate_key'}, {giveItem: 'golden_dreidel'}] } },
            'yente': { type: 'npc', emoji: '👵', questGiver: 'quest_good_match', dialogue: { start: ["Matchmaker, matchmaker, make me a match!", {acceptQuest: 'quest_good_match'}] } },
            
            'gemach_manager': { 
                type: 'npc', emoji: '🏦', 
                dialogue: { 
                    start: ["Welcome to the Gemach of Loving Kindness. Here, money does not sleep; it works.", {action: 'openGemach'}]
                } 
            },
            
            'village_soil_1': { type: 'farm_soil', state: 'empty', x: 2, y: 8 },
            'village_soil_2': { type: 'farm_soil', state: 'empty', x: 3, y: 8 },
            'village_soil_3': { type: 'farm_soil', state: 'empty', x: 4, y: 8 },
        }
    },
    'malkuth_fields': {
        width: 20,
        baseLayerString: `
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
🌳🚪⬜🌾🌾🌾🌾🌾🌾🌾🌾🌾🌾🌾🌾🌾⬜🌳
🌳⬜⬜🌾🌾🌾🐗🌾🌾🌾🌾🌾🌾🌾🌾🌾⬜🌳
🌳⬜⬜🌾🌾🌾🌾🌾🌾🌾🌾🌾🌾🌾🌾🌾⬜🌳
🌳⬜⬜🟫🟫🟫🟫🟫🌾🌾🌾🌾🌾🌾🌾🌾⬜🌳
🌳⬜⬜🟫🟫🟫🟫🟫🌾🌾🌾🌾🌾🌾🌾🌾⬜🌳
🌳⬜⬜🌾🌾🌾🌾🌾🌾💧🌾🌾🌾🌾🌾🌾⬜🌳
🌳⬜⬜🌾🌾🌾🌾🌾🌾🌾🌾🌾🌾🌾🌾🌾⬜🌳
🌳⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
        `,
        encounters: {
            '🌾': [
                { id: 'wild_boar', levelRange: [4, 7], chance: 0.4 },
                { id: 'tam_ox', levelRange: [5, 8], chance: 0.2 },
                { id: 'clay_golem', levelRange: [3, 6], chance: 0.3 },
                { id: 'field_mouse', levelRange: [2, 4], chance: 0.3 },
                { id: 'amalek_raider', levelRange: [5, 10], chance: 0.1 } 
            ]
        },
        interactables: {
            'to_village': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 2, targetY: 11 },
            'secret_tunnel_ent': { type: 'door', emoji: '🕳️', targetMap: 'secret_tunnel', targetX: 2, targetY: 2, x: 18, y: 2 },
            'reflective_pool': { 
                type: 'npc', emoji: '💧', 
                dialogue: { 
                    start: [
                        "You look into the water. The reflection looks... different.", 
                        "It smiles when you frown. It holds a weapon you do not have.",
                        {startBattle: [{id: 'yetzer_hara', level: 10}], context: {flagOnWin: 'defeated_reflection'}}
                    ],
                    battle_win: ["The reflection shatters. You realize the enemy was never external.", "You found the 'Wheat Seeds' left behind.", {giveItem: 'wheat_seeds'}]
                } 
            },
            'field_soil_1': { type: 'farm_soil', state: 'empty', x: 4, y: 4 },
            'field_soil_2': { type: 'farm_soil', state: 'empty', x: 5, y: 4 },
            'field_soil_3': { type: 'farm_soil', state: 'empty', x: 6, y: 4 },
            'field_soil_4': { type: 'farm_soil', state: 'empty', x: 7, y: 4 },
            'field_soil_5': { type: 'farm_soil', state: 'empty', x: 8, y: 4 },
            'field_soil_6': { type: 'farm_soil', state: 'empty', x: 4, y: 5 },
            'field_soil_7': { type: 'farm_soil', state: 'empty', x: 5, y: 5 },
            'field_soil_8': { type: 'farm_soil', state: 'empty', x: 6, y: 5 },
            'field_soil_9': { type: 'farm_soil', state: 'empty', x: 7, y: 5 },
            'field_soil_10': { type: 'farm_soil', state: 'empty', x: 8, y: 5 },
        }
    }
};
