
// B"H
// js/data/maps/malkuth_interiors.js

export const malkuthInteriorMaps = {
    'scribe_atheneum_main': {
        width: 11,
        baseLayerString: `
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨⬜📖⬜⬜⬜⬜📖⬜🪨
🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨⬜⬜⬜⬜⬜⬜⬜🪨
🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨🪨🪨🪨🪨🪨🪨🪨🪨
        `,
        interactables: {
            'upstairs_door': {type: 'door', uu: '\ue101', visual: '🚪', emoji: '🚪', x: 5, y: 0, targetMap: 'scribe_atheneum_upstairs', targetX: 1, targetY: 4},
            'exit_door': { type: 'door', uu: '\ue102', visual: '🚪', emoji: '🚪', x: 1, y: 4, targetMap: 'malkuth_village', targetX: 5, targetY: 2 },
            'caverns_door': { type: 'door', uu: '\ue103', visual: '🚪', emoji: '🚪', x: 4, y: 6, targetMap: 'mishnah_caverns_1', targetX: 4, targetY: 1, condition: { type: 'hasItem', itemId: 'cavern_key' } },
            'rambam_spirit': { type: 'npc', uu: '\ue104', visual: '👨‍🏫', emoji: '👨‍🏫', x: 5, y: 4, dialogue: { start: ["I am the Echo of Maimonides. Find my pages in the caverns below."] } },
            'otzar_pc': { type: 'npc', uu: '\ue105', visual: '🏆', emoji: '🏆', x: 5, y: 2, dialogue: { start: ["Otzar HaNefashot (Treasury of Souls). Manage your team.", {action: 'openOtzar'}] } }
        }
    },
    'scribe_atheneum_upstairs': {
        width: 7,
        baseLayerString: `
🪨🪨🪨🪨🪨🪨🪨
🪨⬜⬜🪟⬜⬜🪨
🪨⬜⬜⬜⬜⬜
🪨⬜⬜⬜🪨
🪨⬜⬜⬜⬜🪨
🪨🪨🪨🪨🪨🪨🪨
        `,
        interactables: {
            'downstairs_door': {type: 'door', uu: '\ue111', visual: '🚪', emoji: '🚪', x: 1, y: 4, targetMap: 'scribe_atheneum_main', targetX: 5, targetY: 1},
            'hod_door': {type: 'door', uu: '\ue112', visual: '🚪', emoji: '🚪', x: 6, y: 2, targetMap: 'hod_library', targetX: 1, targetY: 2 },
            'yud_tet_door': {type: 'door', uu: '\ue113', visual: '🕯️', emoji: '🕯️', x: 1, y: 3, targetMap: 'hall_of_mirrors', targetX: 10, targetY: 5 },
            'private_desk': {type: 'npc', uu: '\ue114', visual: '📜', emoji: '📜', x: 2, y: 3, dialogue: {start: ["(Your private desk. The candle flickers with a strange light... Yud Tet Kislev is approaching)."]}}
        }
    },
    'merchant_house': {
        width: 7,
        baseLayerString: `
🪨🪨🪨🪨🪨🪨🪨
🪨💰⬜📦⬜💰🪨
🪨⬜⬜⬜⬜⬜🪨
🪨⬜⬜⬜⬜🪨
🪨🪨🪨🪨🪨🪨
        `,
        interactables: {
            'exit_door': { type: 'door', uu: '\ue121', visual: '🚪', emoji: '🚪', x: 3, y: 4, targetMap: 'malkuth_village', targetX: 5, targetY: 2 },
            'merchant_shlomo': { type: 'npc', uu: '\ue122', visual: '🛒', emoji: '🛒', x: 2, y: 3, shop: true, dialogue: { start: ["My prices are fair!"]}}
        }
    },
};
