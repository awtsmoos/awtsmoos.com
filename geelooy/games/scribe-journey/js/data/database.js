// B"H
// js/data/database.js

// --- Game Constants (Exported for use in other modules) ---
export const TILE_SIZE = 40;
export const PLAYER_SPEED = 200; // Milliseconds per tile

const COINAGE = {
    perutah: { value: 1, plural: 'Perutahs' },
    isar: { value: 8, plural: 'Isars' },
    dinar: { value: 192, plural: 'Dinars' },
    sela: { value: 768, plural: 'Selas' },
};
export const COINAGE_ORDER = ['sela', 'dinar', 'isar', 'perutah'];

export function formatMoney(money) {
    if (!money || Object.keys(money).length === 0) return '0 Perutahs';
    return COINAGE_ORDER
        .map(unit => money[unit] ? `${money[unit]} ${money[unit] > 1 ? COINAGE[unit].plural : unit}` : null)
        .filter(Boolean).join(', ');
}

// --- CORE GAME DATA ---
export function createDefaultGameState() {
    // --- DATABASE ---
    const musagim = {
        // Malkuth (Physical) Musagim
        'clay_golem': { name: "Clay Golem", emoji: '🗿', type: 'Physical', baseStats: { hp: 55, attack: 12, defense: 15, diligence: 5 }, moves: ['Pummel', 'Harden'], xpYield: 15, moneyYield: { perutah: 10 } },
        'whispering_grass': { name: "Whispering Grass", emoji: '🌾', type: 'Netzach', baseStats: { hp: 35, attack: 8, defense: 8, diligence: 12 }, moves: ['Sway', 'Root_Bind'], xpYield: 12, moneyYield: { perutah: 5 } },
        
        // Yesod (Ethereal) Musagim
        'doppelganger': { name: "Doppelganger", emoji: '👥', type: 'Mystical', baseStats: { hp: 60, attack: 15, defense: 10, diligence: 18 }, moves: ['Mirror_Image', 'Shift'], xpYield: 30 },
        'phantasm': { name: "Phantasm", emoji: '👻', type: 'Mystical', baseStats: { hp: 45, attack: 20, defense: 5, diligence: 22 }, moves: ['Ethereal_Strike', 'Fade'], xpYield: 28 },

        // Gevurah (Severity) Musagim
        'axiom_of_judgment': { name: "Axiom of Judgment", emoji: '⚖️', type: 'Gevurah', baseStats: { hp: 70, attack: 18, defense: 25, diligence: 10 }, moves: ['Pummel', 'Gevurah_Rebuke'], xpYield: 50 },
        'volcanic_shard': { name: "Volcanic Shard", emoji: '🌋', type: 'Gevurah', baseStats: { hp: 50, attack: 25, defense: 15, diligence: 15 }, moves: ['Eruption', 'Harden'], xpYield: 45 },

        // Chesed (Kindness) Musagim
        'benevolent_stream': { name: "Benevolent Stream", emoji: '💧', type: 'Chesed', baseStats: { hp: 80, attack: 10, defense: 20, diligence: 14 }, moves: ['Soothing_Mist', 'Flow'], xpYield: 40 },
        'empathy_echo': { name: "Empathy Echo", emoji: '🌀', type: 'Chesed', baseStats: { hp: 60, attack: 15, defense: 15, diligence: 20 }, moves: ['Tikkun', 'Shared_Burden'], xpYield: 42 },

        // Higher Realm Musagim
        'first_thought': { name: "First Thought", emoji: '💡', type: 'Chochmah', baseStats: { hp: 100, attack: 25, defense: 25, diligence: 30 }, moves: ['Gematria', 'Ein_Sof_Flash'], xpYield: 150 },
        'silent_question': { name: "Silent Question", emoji: '❓', type: 'Binah', baseStats: { hp: 90, attack: 20, defense: 40, diligence: 25 }, moves: ['Paradox', 'Alephs_Silence'], xpYield: 140 },
    };

    const moves = {
        // Physical & Basic
        'Pummel': { name: 'Pummel', power: 40, cost: 0, type: 'Physical', desc: 'A straightforward physical blow.' },
        'Harden': { name: 'Harden', power: 0, cost: 5, type: 'Status', effect: { target: 'self', stat: 'defense', amount: 1 }, desc: 'Solidify one\'s form, increasing defense.' },
        'Sway': { name: 'Sway', power: 20, cost: 0, type: 'Netzach', desc: 'A light, evasive strike.' },
        'Root_Bind': { name: 'Root Bind', power: 0, cost: 8, type: 'Netzach', effect: { target: 'opponent', stat: 'diligence', amount: -1 }, desc: 'Entangle the opponent, reducing diligence.' },
        
        // Mystical & Sefirotic
        'Mirror_Image': { name: 'Mirror Image', power: 0, cost: 10, type: 'Mystical', effect: { target: 'self', stat: 'diligence', amount: 2 }, desc: 'Create illusions, sharply raising diligence.' },
        'Ethereal_Strike': { name: 'Ethereal Strike', power: 55, cost: 12, type: 'Mystical', desc: 'A blow that strikes the concept directly.' },
        'Fade': { name: 'Fade', power: 0, cost: 15, type: 'Status', effect: { target: 'self', stat: 'invulnerable', turns: 1 }, desc: 'Become briefly untouchable.' },
        'Gevurah_Rebuke': { name: 'Gevurah\'s Rebuke', power: 60, cost: 15, type: 'Gevurah', desc: 'A powerful strike of pure judgment.' },
        'Eruption': { name: 'Eruption', power: 70, cost: 20, type: 'Gevurah', desc: 'An explosive release of raw power.' },
        'Soothing_Mist': { name: 'Soothing Mist', power: 0, cost: 12, type: 'Chesed', effect: { target: 'self', stat: 'heal', amount: 40 }, desc: 'A gentle mist that restores conceptual integrity.' },
        'Flow': { name: 'Flow', power: 50, cost: 10, type: 'Chesed', desc: 'A yielding but powerful strike.' },
        'Shared_Burden': { name: 'Shared Burden', power: 0, cost: 20, type: 'Chesed', effect: { target: 'opponent', stat: 'attack', amount: -2 }, desc: 'Share the opponent\'s burden, lowering their attack.' },
        
        // Logic & Higher Concepts
        'Tikkun': { name: 'Tikkun', power: 0, cost: 18, type: 'Mystical', effect: { target: 'self', stat: 'heal', amount: 60 }, desc: 'The act of cosmic rectification, a powerful heal.' },
        'Gematria': { name: 'Gematria', power: 80, cost: 25, type: 'Logic', desc: 'A profound attack based on the numerical soul of concepts.' },
        'Paradox': { name: 'Paradox', power: 0, cost: 22, type: 'Binah', effect: { target: 'opponent', stat: 'confuse', turns: 3 }, desc: 'Confront the opponent with an unsolvable riddle, causing confusion.' },
        'Alephs_Silence': { name: 'Aleph\'s Silence', power: 0, cost: 30, type: 'Keter', effect: { target: 'opponent', stat: 'silence', turns: 2 }, desc: 'Impose the primordial silence, preventing the use of moves.' },
        'Ein_Sof_Flash': { name: 'Ein Sof Flash', power: 120, cost: 40, type: 'Keter', desc: 'A blinding flash from beyond creation, immensely powerful.' },
    };

    const items = {
        'manna_dew': { id: 'manna_dew', name: 'Manna Dew', desc: 'A single drop of heavenly dew. Restores 30 HP.', type: 'consumable', effect: { stat: 'hp', amount: 30 }, sellValue: 15 },
        'ink_of_potential': { id: 'ink_of_potential', name: 'Ink of Potential', desc: 'Potent ink that restores 20 Kavanah.', type: 'consumable', effect: { stat: 'kavanah', amount: 20 }, sellValue: 25 },
        'kli_of_malkuth': { id: 'kli_of_malkuth', name: 'Kli of Malkuth', desc: 'A clay vessel to capture physical concepts.', type: 'kli', captureRate: 0.5, sellValue: 50 },
        'sefer_fragment_alpha': { id: 'sefer_fragment_alpha', name: 'Sefer Fragment (Aleph)', desc: 'The first shattered piece of the Great Sefer. It hums with nascent power.', type: 'key_item', isQuestItem: true },
        'sefer_fragment_bet': { id: 'sefer_fragment_bet', name: 'Sefer Fragment (Bet)', desc: 'The second piece of the Great Sefer, containing the blueprint of duality.', type: 'key_item', isQuestItem: true },
    };
    
    const quests = {
        'main_quest_1': {
            id: 'main_quest_1', name: "The Shattered Sefer", desc: "The Elder Scribe has tasked you with finding the first fragment of the Great Sefer, which is said to resonate with the foundational energy of Yesod.",
            objectives: [ { id: 'find_fragment', text: 'Find the Sefer Fragment in the Realm of Yesod', completed: false } ],
            rewards: {},
        },
        'side_quest_farmer': {
            id: 'side_quest_farmer', name: "A Farmer's Plight", desc: "A farmer in Malkuth is being troubled by wild Whispering Grass that has become aggressive.",
            objectives: [ { id: 'defeat_grass', text: 'Defeat 3 Whispering Grass', target: { type: 'defeat', musagId: 'whispering_grass', count: 3 }, current: 0, completed: false } ],
            rewards: { money: { isar: 2 }, items: ['manna_dew'] },
        }
    };

    // --- MAPS & INTERACTABLES ---
    const maps = {
        'malkuth_village': {
            baseLayer: [
                ['🌳','🌳','🌳','🌳','🌳','🌳','🌳','🌳','🌳','🌳'],
                ['🌳','🏠','🏠','⬜','⬜','⬜','📜','⬜','🌳','🌳'],
                ['🌳','⬜','⬜','⬜','🌳','🌳','⬜','⬜','⬜','🌳'],
                ['🌳','⬜','🌳','🌳','🌳','🔥','🌳','🌳','⬜','🌳'],
                ['🌳','⬜','⬜','⬜','⬜','⬜','⬜','🌳','⬜','🌳'],
                ['🌳','👨','⬜','💧','⬜','🌿','⬜','🌳','⬜','🚪'],
                ['🌳','⬜','⬜','⬜','⬜','🌿','⬜','🌳','⬜','🌳'],
                ['🌳','⬜','🌳','🌳','🌳','🌳','🌳','🌳','⬜','🌳'],
                ['🌳','⬜','⬜','🌾','🌾','⬜','⬜','⬜','⬜','🌳'],
                ['🌳','🌳','🌳','🌳','🌳','🌳','🌳','🌳','🌳','🌳'],
            ],
            overlayLayer: Array(10).fill(0).map(() => Array(10).fill('')),
            interactables: {
                'start_sequence': { dialogue: { start: ["The world feels... fractured, Scribe.", "The Great Sefer is shattered. Its concepts now roam wild as Musagim.", "You must journey through the Sefirot, starting with the dream-realm of Yesod. Find the fragments. Rectify Creation.", "Take this satchel. May your ink flow true.", "end"] } },
                '6,1': { type: 'npc', emoji: '📜', id: 'elder_scribe', questGiver: 'main_quest_1', dialogue: { start: ["The path to Yesod lies through the shimmering door. Be wary, its nature is illusion."], completed: ["You have the first fragment! The path forward will be harder, but you have proven your worth."] } },
                '5,9': { type: 'door', targetMap: 'yesod_shore', targetX: 1, targetY: 5 },
                '1,5': { type: 'npc', emoji: '👨', id: 'farmer_dan', questGiver: 'side_quest_farmer', dialogue: { start: ["My crops... the Whispering Grass has turned wild! Please, help me!"], in_progress: ["Have you dealt with them yet? My family is hungry."], completed: ["You've saved my farm! Please, take this for your trouble."] } }
            }
        },
        'yesod_shore': {
            baseLayer: [
                ['🌊','🌊','🌊','🌊','🌊','🌊','🌊','🌊','🌊','🌊'],
                ['🌊','💧','💧','💧','⬜','⬜','💧','💧','💧','🌊'],
                ['🌊','💧','💎','💧','⬜','💎','💧','💎','💧','🌊'],
                ['🌊','💧','💧','⬜','⬜','⬜','⬜','💧','💧','🌊'],
                ['🚪','⬜','⬜','⬜','👥','⬜','⬜','⬜','⬜','🚪'],
                ['🌊','💧','💧','⬜','⬜','⬜','⬜','💧','💧','🌊'],
                ['🌊','💧','💎','💧','⬜','💎','💧','💎','💧','🌊'],
                ['🌊','💧','💧','💧','⬜','⬜','💧','💧','💧','🌊'],
                ['🌊','🌊','🌊','🌊','🌊','🌊','🌊','🌊','🌊','🌊'],
            ],
            overlayLayer: Array(10).fill(0).map(() => Array(10).fill('')),
            interactables: {
                '0,4': { type: 'door', targetMap: 'malkuth_village', targetX: 8, targetY: 5 },
                '4,4': { type: 'npc', emoji: '👥', id: 'yesod_guardian', dialogue: { start: ["To find what is real, you must debate your own reflection.", {startBattle: [{id: 'doppelganger', level: 8}]}], battle_win: ["You have proven you are not an illusion. The fragment is yours.", {giveItem: 'sefer_fragment_alpha'}, "end"] } }
            }
        }
    };
    
    // --- INITIAL GAME STATE ---
    return {
        mode: 'main-menu', // Start at the main menu
        player: {
            x: 3, y: 5, pixelX: 3 * TILE_SIZE, pixelY: 5 * TILE_SIZE,
            direction: 'down', emoji: '✍️', isMoving: false,
            money: { perutah: 50 },
            inventory: [],
            team: [{ id: 'clay_golem', level: 5, currentHp: 55, currentKavanah: 20 }],
            activeQuests: [],
        },
        currentMapId: 'malkuth_village',
        maps: maps,
        db: { musagim, moves, items, quests },
        dialogue: { active: false, text: '', choices: [] },
        battle: { active: false },
    };
}