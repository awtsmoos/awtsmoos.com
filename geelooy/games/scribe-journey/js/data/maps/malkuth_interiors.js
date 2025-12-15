
// B"H
// js/data/maps/malkuth_interiors.js

export const malkuthInteriorMaps = {
    'scribe_atheneum_main': {
        width: 11,
        baseLayerString: `
🪨🪨🪨🪨🪨🚪🪨🪨🪨🪨🪨
🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨⬜📖⬜⬜🏆⬜⬜📖⬜🪨
🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨🚪⬜⬜⬜👨‍🏫⬜⬜⬜⬜🪨
🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨🪨🪨🪨🚪🪨🪨🪨🪨🪨
        `,
        interactables: {
            'upstairs_door': {type: 'door', emoji: '🚪', targetMap: 'scribe_atheneum_upstairs', targetX: 1, targetY: 4},
            'exit_door': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 5, targetY: 2 },
            'caverns_door': { type: 'door', emoji: '🚪', targetMap: 'mishnah_caverns_1', targetX: 4, targetY: 1, condition: { type: 'hasItem', itemId: 'cavern_key' } },
            'rambam_spirit': { type: 'npc', emoji: '👨‍🏫', dialogue: { start: ["I am the Echo of Maimonides. Find my pages in the caverns below."] } },
            'otzar_pc': { type: 'npc', emoji: '🏆', dialogue: { start: ["Otzar HaNefashot (Treasury of Souls). Manage your team.", {action: 'openOtzar'}] } }
        }
    },
    'scribe_atheneum_upstairs': {
        width: 7,
        baseLayerString: `
🪨🪨🪨🪨🪨🪨🪨
🪨⬜⬜🪟⬜⬜🪨
🪨⬜⬜⬜⬜⬜🚪
🪨🕯️📜⬜⬜⬜🪨
🪨🚪⬜⬜⬜⬜🪨
🪨🪨🪨🪨🪨🪨🪨
        `,
        interactables: {
            'downstairs_door': {type: 'door', emoji: '🚪', targetMap: 'scribe_atheneum_main', targetX: 5, targetY: 1},
            'hod_door': {type: 'door', emoji: '🚪', targetMap: 'hod_library', targetX: 1, targetY: 2 },
            'yud_tet_door': {type: 'door', emoji: '🕯️', targetMap: 'hall_of_mirrors', targetX: 10, targetY: 5 },
            'private_desk': {type: 'npc', emoji: '📜', dialogue: {start: ["(Your private desk. The candle flickers with a strange light... Yud Tet Kislev is approaching)."]}}
        }
    },
    'merchant_house': {
        width: 7,
        baseLayerString: `
🪨🪨🪨🪨🪨🪨🪨
🪨💰⬜📦⬜💰🪨
🪨⬜⬜⬜⬜⬜🪨
🪨⬜🛒⬜⬜⬜🪨
🪨🪨🪨🚪🪨🪨🪨
        `,
        interactables: {
            'exit_door': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 5, targetY: 2 },
            'merchant_shlomo': { type: 'npc', emoji: '🛒', shop: true, dialogue: { start: ["My prices are fair!"]}}
        }
    },
};
