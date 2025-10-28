// B"H
// js/data/maps.js

export const maps = {
    // --- WORLD 1: MALKUTH (KINGDOM) ---
    'malkuth_village': {
        baseLayer: [
            ['🌳','🌳','🌳','🌳','🌳','🌳','🌳','🌳','🌳','🌳','🌳','🌳'],
            ['🌳','🏠','🏠','⬜','⬜','⬜','📜','⬜','⬜','⬜','🌳','🌳'],
            ['🌳','⬜','⬜','⬜','🌳','🌳','⬜','⬜','⬜','⬜','⬜','🌳'],
            ['🌳','👨','🌳','🌳','🌳','🔥','🌳','🌳','⬜','⬜','⬜','🌳'],
            ['🌳','⬜','⬜','⬜','⬜','⬜','⬜','🌳','⬜','⬜','⬜','🌳'],
            ['🌳','👨‍🌾','⬜','💧','⬜','🌿','⬜','🌳','⬜','⬜','⬜','🚪'],
            ['🌳','⬜','⬜','⬜','⬜','🌿','⬜','🌳','⬜','⬜','⬜','🌳'],
            ['🌳','🐂','🌳','🌳','🌳','🌳','🌳','🌳','🐂','⬜','⬜','🌳'],
            ['🌳','⬜','⬜','🌾','🌾','⬜','⬜','⬜','⬜','🛒','⬜','🌳'],
            ['🌳','🌳','🌳','🌳','🌳','🌳','🌳','🌳','🌳','🌳','🌳','🌳'],
        ],
        overlayLayer: Array(10).fill(0).map(() => Array(12).fill('')),
        interactables: {
            'start_sequence': { dialogue: { start: ["The world feels... fractured, Scribe.", "The Great Sefer is shattered. Its concepts now roam wild as Musagim.", "You must journey through the Sefirot. Find the fragments. Rectify Creation.", "Take this satchel. May your ink flow true.", "end"] } },
            '1,1': { type: 'door', emoji: '🏠', targetMap: 'scholar_house', targetX: 4, targetY: 6, },
            '2,1': { type: 'door', emoji: '🏠', targetMap: 'merchant_house', targetX: 4, targetY: 4, },
            '6,1': { type: 'npc', emoji: '📜', id: 'elder_scribe', x: 6, y: 1, questGiver: 'main_quest_1', dialogue: { start: ["The path to Yesod lies through the shimmering door to the east. Be wary, its nature is illusion."], completed: ["You have the first fragment! The path forward will be harder, but you have proven your worth."] } },
            '11,5': { type: 'door', emoji: '🚪', targetMap: 'yesod_shore', targetX: 1, targetY: 4 },
            '1,3': { type: 'npc', emoji: '👨', id: 'reuven', x: 1, y: 3, questGiver: 'nizkei_mamon_1_goring_ox', dialogue: { start: ["Scribe, thank heavens! My prize ox... gored by Shimon's beast! Shimon claims it was an accident, but I am ruined! Please, can you find the just path? The sage in the old house might know the ancient laws."], in_progress: ["Please, speak to the Echo of Rambam. I must know what is just."], learned_law: ["You have spoken to the sage? Please, tell us what the Halacha is!", {choices: [{text: "Shimon must pay half the damages from the value of his ox.", next: "mediate_correct"}, {text: "Shimon must pay for all the damages.", next: "mediate_incorrect"}]}], mediate_correct: ["Half the value... from the ox itself. It is a hard ruling, but it is just. Thank you for bringing clarity.", {finalizeQuest: 'nizkei_mamon_1_goring_ox'}], mediate_incorrect: ["Full damages? Shimon says that is not what the sage taught... I am confused."]}},
            '8,7': { type: 'npc', emoji: '🐂', id: 'shimon', x: 8, y: 7, dialogue: {start: ["Shimon stands here, looking worried.", {choices:[{text: "(Speak to Shimon)", next: "talk"}]}], talk: ["My ox... it has never gored before. It is a Tam, an innocent one! I cannot afford to pay for Reuven's entire animal. It would ruin me. If only someone knew the true law..."]}},
            '1,5': { type: 'npc', emoji: '👨‍🌾', id: 'farmer_dan', x: 1, y: 5, dialogue: { start: ["Shalom. The world groans, but the earth still gives. Remember your foundation."] } },
            '9,8': { type: 'npc', emoji: '🛒', id: 'trader_levi', x: 9, y: 8, dialogue: { start: ["Goods from across the realms! Care for a look?", {choices: [{text: "Buy"}, {text: "Sell"}, {text: "Leave"}]}] } },
        }
    },
    'scholar_house': {
        baseLayer: [ ['🪨','🪨','🪨','🪨','🪨','🪨','🪨','🪨'], ['🪨','⬜','⬜','📚','📚','⬜','⬜','🪨'], ['🪨','⬜','⬜','⬜','⬜','⬜','⬜','🪨'], ['🪨','⬜','👨‍🏫','⬜','⬜','📖','⬜','🪨'], ['🪨','⬜','⬜','⬜','⬜','⬜','⬜','🪨'], ['🪨','⬜','⬜','🕳️','⬜','⬜','⬜','🪨'], ['🪨','🪨','🪨','⬜','🚪','⬜','🪨','🪨'], ],
        overlayLayer: Array(7).fill(0).map(() => Array(8).fill('')),
        interactables: {
            '4,6': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 1, targetY: 2 },
            '2,3': { type: 'npc', emoji: '👨‍🏫', id: 'rambam_spirit', x:2, y:3, questGiver: 'rambam_quest_1', dialogue: { 
                start: ["I am but an echo of Moshe ben Maimon. My Mishneh Torah, my 'Code of Law,' has been shattered like the world itself. Its pages are lost in the depths below.", "These are not mere words, but the very structure of a just and holy reality. If you seek understanding, descend into the caverns and restore my work. Each page you find will clarify a law of creation.", {giveItem: "cavern_key"}, "Do you have a specific query for me?", {choices: [{text:"Ask about the Goring Ox.", next: "nizkei_mamon"}, {text: "I must go.", next:"end"}]}], 
                in_progress: ["The foundations of Torah are the foundations of the world. Please, find my pages."], 
                completed: ["You have done it! You have restored the foundation. Knowledge is the truest Tikkun."],
                nizkei_mamon: ["You ask of damages? A weighty topic. The Torah states in Exodus 21:35, 'When a person’s ox will gore an ox...'", "If the animal is a 'Tam' - one not known to be prone to this act - the owner pays only half the damages, and only from the value of the animal itself. This is a fine, a warning for the owner to be more careful.", "However, if the animal has gored three times and the owner was warned, it becomes a 'Mu'ad' - a forewarned danger. From then on, the owner pays for all damages from his best property.", "Go now, and apply this wisdom.", {updateQuest: "nizkei_mamon_1_goring_ox", objectiveId: "learn_law"}, "end"]
            }},
            '3,5': { type: 'door', emoji: '🕳️', targetMap: 'mishnah_caverns_1', targetX: 4, targetY: 1 },
        }
    },
    'merchant_house': {
        baseLayer: [ ['🪨','🪨','🪨','🪨','🪨','🪨'], ['🪨','💰','⬜','📦','⬜','🪨'], ['🪨','⬜','⬜','⬜','⬜','🪨'], ['🪨','⬜','🛒','⬜','⬜','🪨'], ['🪨','🪨','🪨','🚪','🪨','🪨'] ],
        overlayLayer: Array(5).fill(0).map(() => Array(6).fill('')),
        interactables: {
            '3,4': { type: 'door', targetMap: 'malkuth_village', targetX: 2, targetY: 2 },
        }
    },
    'mishnah_caverns_1': {
        baseLayer: [
            ['🪨','🪨','🪨','🪨','🕳️','🪨','🪨','🪨'],
            ['🪨','⬜','⬜','⬜','⬜','⬜','⬜','🪨'],
            ['🪨','⬜','🪨','🪨','⬜','🪨','⬜','🪨'],
            ['🪨','⬜','⬜','👤','⬜','🪨','⬜','🚪'],
            ['🪨','🪨','⬜','🪨','🪨','🪨','⬜','🪨'],
            ['🪨','📄','⬜','⬜','⬜','⬜','⬜','🪨'],
            ['🪨','🪨','🪨','🪨','🪨','🪨','🪨','🪨'],
        ],
        overlayLayer: Array(7).fill(0).map(() => Array(8).fill('')),
        interactables: {
            '4,0': { type: 'door', emoji: '🕳️', targetMap: 'scholar_house', targetX: 3, targetY: 4 },
            '7,3': { type: 'door', emoji: '🚪', targetMap: 'chamber_of_pure_waters', targetX: 1, targetY: 4 },
            '1,5': { type: 'npc', emoji: '📄', id: 'page_damages_node', x:1, y:5, dialogue: { start: ["You found a weathered page from the Mishneh Torah! It details the laws of damages.", {giveItem: "rambam_page_damages"}, "end"]}}
        }
    },
    'chamber_of_pure_waters': {
        baseLayer: [
            ['🪨','🪨','🪨','🪨','🪨','🪨','🪨'],
            ['🪨','💧','💧','🌊','💧','💧','🪨'],
            ['🪨','💧','💧','🌊','💧','💧','🪨'],
            ['🪨','💧','💧','🌊','💧','💧','🪨'],
            ['🚪','⬜','⬜','🌊','⬜','⬜','🪨'],
            ['🪨','🪨','🪨','🌊','🪨','🪨','🪨'],
        ],
        overlayLayer: Array(6).fill(0).map(() => Array(7).fill('')),
        interactables: {
             '0,4': { type: 'door', emoji: '🚪', targetMap: 'mishnah_caverns_1', targetX: 6, targetY: 3 },
        }
    },
    'yesod_shore': {
        baseLayer: [ ['🌊','🌊','🌊','🌊','🌊','🌊','🌊','🌊'], ['🌊','💧','⬜','⬜','💎','⬜','💧','🌊'], ['🌊','⬜','⬜','👥','⬜','⬜','⬜','🌊'], ['🌊','💧','⬜','⬜','💎','⬜','💧','🌊'], ['🚪','⬜','⬜','⬜','⬜','⬜','⬜','🚪'], ['🌊','💧','⬜','⬜','💎','⬜','💧','🌊'], ['🌊','🌊','🌊','🌊','🌊','🌊','🌊','🌊'] ],
        overlayLayer: Array(7).fill(0).map(() => Array(8).fill('')),
        interactables: {
            '0,4': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 10, targetY: 5 },
            '7,4': { type: 'door', emoji: '🚪', targetMap: 'gevurah_volcano', targetX: 1, targetY: 4 },
            '3,2': { type: 'npc', emoji: '👥', id: 'yesod_guardian', x:3, y:2, dialogue: { start: ["To find what is real, you must debate your own reflection.", {startBattle: [{id: 'doppelganger', level: 8}]}], battle_win: ["You have proven you are not an illusion. The fragment is yours.", {updateQuest: "main_quest_1", objectiveId: "find_fragment"}, "end"] } }
        }
    },
    'gevurah_volcano': {
        baseLayer: [ ['🌋','🌋','🌋','🌋','🌋'], ['🚪','⬜','🔥','⬜','🌋'], ['🌋','⬜','⚖️','⬜','🌋'], ['🌋','⬜','🔥','⬜','🌋'], ['🌋','🌋','🌋','🌋','🌋'] ],
        overlayLayer: Array(5).fill(0).map(() => Array(5).fill('')),
        interactables: {
            '0,1': {type: 'door', targetMap: 'yesod_shore', targetX: 6, targetY: 4}
        }
    },
};
    
    // --- INITIAL GAME STATE ---
    return {
        mode: 'main-menu', player: {
            x: 5, y: 8, pixelX: 5 * TILE_SIZE, pixelY: 8 * TILE_SIZE, direction: 'up', emoji: '✍️',
            isMoving: false, moveStartTime: 0, startX: 5, startY: 8, targetX: 5, targetY: 8,
            money: { perutah: 150 }, inventory: [], team: [{ id: 'clay_golem', level: 5 }],
            activeQuests: [],
        },
        currentMapId: 'malkuth_village',
        maps: maps, db: { musagim, moves, items, quests },
        dialogue: { active: false }, battle: { active: false },
    };
}