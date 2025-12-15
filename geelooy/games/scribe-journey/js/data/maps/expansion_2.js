
// B"H
// js/data/maps/expansion_2.js

export const expansion2Maps = {
    'secret_mikveh': {
        width: 10,
        baseLayerString: `
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
🌳🌿⬜⬜⬜⬜⬜⬜🌿🌳
🌳⬜💧⬜💧⬜💧⬜⬜🌳
🌳⬜💧🧖‍♂️⬜🧖‍♀️💧⬜⬜🌳
🌳⬜💧⬜💧⬜💧⬜⬜🌳
🌳🌿⬜⬜⬜⬜⬜⬜🌿🌳
🌳🌳🌳🌳🚪🌳🌳🌳🌳🌳
        `,
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 18, targetY: 18 },
            'mikveh_pool': { type: 'npc', emoji: '💧', dialogue: { start: ["(A hidden spring of pure water. Immersion here clears the mind.)", {action: 'meditate_ohel'}, {setFlag: 'immersed_mikveh'}] } }
        }
    },
    'babel_ruins': {
        width: 15,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱🧱🧱🧱⬜⬜⬜⬜⬜⬜⬜🧱🧱🧱🧱
🧱🧱⬜⬜⬜🧱⬜⬜⬜🧱⬜⬜⬜🧱🧱
🧱⬜⬜🧱🧱🧱🧱⬜🧱🧱🧱🧱⬜⬜🧱
🧱⬜🧱⬜⬜⬜⬜⬜⬜⬜⬜🧱⬜🧱
🧱⬜🧱⬜🗼⬜⬜⬜⬜⬜🗼⬜🧱⬜🧱
🧱⬜🧱⬜⬜⬜⬜⬜⬜⬜⬜🧱⬜🧱
🧱⬜🧱🧱🧱🧱🧱⬜🧱🧱🧱🧱🧱⬜🧱
🧱🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🚪🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        encounters: {
            '🧱': [{ id: 'market_thief', levelRange: [20, 25], chance: 0.3 }]
        },
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 2, targetY: 15 },
            'ruin_sign': { type: 'npc', emoji: '🗼', dialogue: { start: ["(Ruins of a Great Tower. The languages are mixed here.)"] } }
        }
    },
    'mount_sinai_base': {
        width: 20,
        baseLayerString: `
⛰️⛰️⛰️⛰️⛰️⛰️⛰️⛰️⛰️⛰️⛰️⛰️⛰️⛰️⛰️⛰️⛰️⛰️⛰️⛰️
⛰️🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🚪⛰️
⛰️⬜⬜⬜⬜🌵⬜⬜⬜⬜🌵⬜⬜⬜⬜🌵⬜⬜⬜⛰️
⛰️⬜⬜⛺⬜⛺⬜⛺⬜⛺⬜⛺⬜⛺⬜⛺⬜⬜⬜⛰️
⛰️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⛰️
⛰️⬜⬜⬜⬜⬜🔥⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⛰️
⛰️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⛰️
⛰️⬜⬜🌵⬜⬜⬜⬜🌵⬜⬜⬜⬜🌵⬜⬜⬜⬜⬜⛰️
⛰️⛰️⛰️⛰️⛰️⛰️⛰️⛰️⛰️⛰️⛰️⛰️⛰️⛰️⛰️⛰️⛰️⛰️⛰️⛰️
        `,
        encounters: {
            '🌵': [{ id: 'burning_love', levelRange: [30, 40], chance: 0.4 }]
        },
        interactables: {
            'bush': { type: 'npc', emoji: '🔥', dialogue: { start: ["(A bush that burns but is not consumed.)", "Remove your shoes, for this ground is holy."] } },
            'exit': { type: 'door', emoji: '🚪', targetMap: 'midbar_entrance', targetX: 10, targetY: 10 }
        }
    },
    'red_sea_crossing': {
        width: 25,
        baseLayerString: `
🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊
🌊🐟🌊🐟🌊🐟🌊🐟🌊🐟🌊🐟🌊🐟🌊🐟🌊🐟🌊🐟🌊🐟🌊🐟🌊
🌊⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌊
🌊⬜🥪⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🥪⬜🌊
🌊⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌊
🌊🐟🌊🐟🌊🐟🌊🐟🌊🐟🌊🐟🌊🐟🌊🐟🌊🐟🌊🐟🌊🐟🌊🐟🌊
🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊
        `,
        encounters: {
            '⬜': [{ id: 'silent_fish', levelRange: [25, 35], chance: 0.3 }]
        },
        interactables: {
            'exit_egypt': { type: 'door', emoji: '🥪', targetMap: 'malkuth_village', targetX: 1, targetY: 5 }, // Sandwich emoji as placeholder for walls of water
            'exit_sinai': { type: 'door', emoji: '🥪', targetMap: 'mount_sinai_base', targetX: 1, targetY: 5 }
        }
    },
    'manna_field': {
        width: 15,
        baseLayerString: `
🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️
🏜️🚪⬜❄️⬜❄️⬜❄️⬜❄️⬜❄️⬜🚪🏜️
🏜️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🏜️
🏜️⬜❄️⬜⬜⬜❄️⬜⬜⬜❄️⬜⬜⬜🏜️
🏜️⬜⬜⬜🐍⬜⬜⬜🐍⬜⬜⬜⬜⬜🏜️
🏜️⬜❄️⬜⬜⬜❄️⬜⬜⬜❄️⬜⬜⬜🏜️
🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️
        `,
        encounters: {
            '❄️': [{ id: 'dust_mite', levelRange: [10, 15], chance: 0.5 }]
        },
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'midbar_entrance', targetX: 5, targetY: 5 },
            'collect_manna': { type: 'npc', emoji: '❄️', pickup: 'manna_dew' }
        }
    },
    'cave_machpelah_entrance': {
        width: 12,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱🚪⬜⬜⬜🕯️⬜⬜⬜⬜🚪🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🏺⬜⬜🪦⬜⬜🏺⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🏺⬜⬜🪦⬜⬜🏺⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 5, targetY: 15 },
            'abraham_tomb': { type: 'npc', emoji: '🪦', dialogue: { start: ["(The Tomb of Avraham and Sarah. A profound kindness radiates here.)"] } },
            'isaac_tomb': { type: 'npc', emoji: '🪦', x: 6, y: 5, dialogue: { start: ["(The Tomb of Yitzchak and Rivka. The atmosphere is strict but holy.)"] } }
        }
    },
    'rachel_tomb': {
        width: 10,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱🚪⬜⬜⬜⬜⬜⬜🚪🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🧱🧱🧱🧱🧱🧱⬜🧱
🧱⬜🧱👵⬜🕯️🧱⬜🧱
🧱⬜🧱🧱🧱🧱🧱🧱⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'mama_rachel': { type: 'npc', emoji: '👵', dialogue: { start: ["(A voice is heard on high... Rachel weeping for her children.)", "Refrain your voice from weeping, for there is reward for your work."] } },
            'exit': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 12, targetY: 12 }
        }
    },
    'yeshiva_rooftop': {
        width: 15,
        baseLayerString: `
☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️
☁️🔭⬜⬜⬜📚⬜⬜⬜☕⬜⬜⬜☁️
☁️⬜⬜👬⬜⬜⬜👬⬜⬜⬜🧘⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜⬜⬜📖⬜⬜⬜📖⬜⬜⬜⬜☁️
☁️🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️
        `,
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: '770_main_hall', targetX: 5, targetY: 5 },
            'chavruta': { type: 'npc', emoji: '👬', dialogue: { start: ["We are analyzing the Tosafot. The logic is sharp as a knife."] } }
        }
    },
    'market_alley': {
        width: 8,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱
🧱🚪⬜🛒⬜🛒⬜🧱
🧱⬜⬜⬜⬜⬜⬜🧱
🧱⬜🐈⬜📦⬜🐀🧱
🧱⬜⬜⬜⬜⬜⬜🧱
🧱⬜🛒⬜🛒⬜🚪🧱
🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        encounters: {
            '📦': [{ id: 'market_thief', levelRange: [15, 20], chance: 0.3 }]
        },
        interactables: {
            'vendor_1': { type: 'npc', emoji: '🛒', shop: true, dialogue: { start: ["Spices! Rugs! Pearls!"] } },
            'exit_north': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 10, targetY: 10 },
            'exit_south': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 10, targetY: 12 }
        }
    },
    'gemach_vault': {
        width: 10,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱💰⬜💰⬜💰⬜💰⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🏧⬜📜⬜🏧⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱🚪⬜⬜⬜⬜⬜⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 16, targetY: 10 },
            'ledger': { type: 'npc', emoji: '📜', dialogue: { start: ["(The Great Ledger of Loans. Interest-free, as commanded.)"] } }
        }
    }
};
