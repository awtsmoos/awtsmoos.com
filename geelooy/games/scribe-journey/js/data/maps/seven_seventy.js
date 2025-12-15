
// B"H
// js/data/maps/seven_seventy.js

export const sevenSeventyMaps = {
    'eastern_parkway_exterior': {
        width: 30,
        baseLayerString: `
🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️
🏙️🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🏙️
🏙️🧱🧱🏠🧱🧱🏠🧱🧱🕍🧱🧱🏠🧱🧱🏠🧱🧱🏠🧱🧱🏠🧱🧱🏙️
🏙️🧱⬜⬜⬜⬜⬜⬜⬜🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🧱🚑⬜🚶⬜🚌⬜⬜🕺⬜⬜🚌⬜🚶⬜🚶⬜🚑⬜🚶⬜⬜⬜🧱🏙️
🏙️🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🧱🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🧱🏙️
🏙️🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🧱🚍⬜🚶⬜🚖⬜⬜🚶⬜⬜🚖⬜🚶⬜🚍⬜🚶⬜🚖⬜⬜⬜🧱🏙️
🏙️🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️
        `,
        interactables: {
            '770_entrance': { type: 'door', emoji: '🚪', targetMap: 'shul_downstairs', targetX: 10, targetY: 18, dialogue: { start: ["(The Three Triangular Windows above look down upon you. You enter the House of Sages)."] } },
            'mivtzoim_tank': { type: 'npc', emoji: '🚍', dialogue: { start: ["Need supplies for the campaign?", {shop: true, stock: ['tefillin_pair', 'shabbat_candles', 'tzedakah_pennies']}] } },
            'exit_to_crown': { type: 'door', emoji: '🏙️', targetMap: 'kingston_ave', targetX: 5, targetY: 5 }
        },
        encounters: {
            '🚶': [
                { id: 'lost_soul', levelRange: [1, 50], chance: 0.5 }, // Mivtzoim target
                { id: 'cynical_pedestrian', levelRange: [30, 40], chance: 0.3 }
            ]
        }
    },
    'shul_downstairs': {
        width: 20,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱📚📚📚📚📚📚📚📚🤴📚📚📚📚📚📚📚📚🧱
🧱📚⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜📚🧱
🧱📚⬜🧔⬜👬⬜⬜⬜📜⬜⬜⬜👬⬜🧔⬜📚🧱
🧱📚⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜📚🧱
🧱📚⬜👬⬜⬜⬜⬜📖⬜⬜⬜⬜⬜👬⬜📚🧱
🧱📚⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜📚🧱
🧱📚⬜🧔⬜👬⬜⬜⬜⬜⬜⬜👬⬜🧔⬜📚🧱
🧱📚⬜⬜⬜⬜⬜⬜⬜🧱⬜⬜⬜⬜⬜⬜⬜📚🧱
🧱📚📚📚📚📚📚📚📚🚪📚📚📚📚📚📚📚📚🧱
🧱🧱🧱🧱🧱🧱🧱🧱🚪🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'eastern_parkway_exterior', targetX: 12, targetY: 3 },
            'rebbe_chair': { type: 'npc', emoji: '🤴', dialogue: { start: ["(The place of the Nasi. A red velvet chair. You feel an overwhelming urge to increase in goodness).", {action: 'meditate'}] } },
            'bimah': { type: 'npc', emoji: '📖', dialogue: { start: ["(The Torah reading platform.)", {action: 'read_parsha'}] } },
            'ark': { type: 'npc', emoji: '📜', dialogue: { start: ["(The Holy Ark. It contains the Scrolls of Law.)", "The letters fly in the air."] } },
            'farbrengen': { type: 'npc', emoji: '🧔', dialogue: { start: ["L'chaim! The bench is crowded, but there's room for one more soul.", {action: 'farbrengen_heal'}] } },
            'upstairs_door': { type: 'door', emoji: '📚', targetMap: 'library_infinite', targetX: 1, targetY: 1 }
        }
    },
    'library_infinite': {
        width: 15,
        baseLayerString: `
📚📚📚📚📚📚📚📚📚📚📚📚📚📚📚
📚⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜📚
📚⬜📕⬜📗⬜📘⬜📙⬜📕⬜📗⬜📚
📚⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜📚
📚⬜📘⬜📙⬜📕⬜📗⬜📘⬜📙⬜📚
📚⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜📚
📚⬜📕⬜📗⬜📘⬜📙⬜📕⬜📗⬜📚
📚⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜📚
📚📚📚📚📚📚📚🚪📚📚📚📚📚📚📚
        `,
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'shul_downstairs', targetX: 2, targetY: 2 },
            // Procedurally generated book loots
            'book_shelf_1': { type: 'npc', emoji: '📕', dialogue: { start: ["You pull a random volume...", {giveRandomItem: 'seforim_pool'}] } },
            'book_shelf_2': { type: 'npc', emoji: '📗', dialogue: { start: ["You pull a random volume...", {giveRandomItem: 'seforim_pool'}] } },
            'book_shelf_3': { type: 'npc', emoji: '📘', dialogue: { start: ["You see a spark hiding behind the books...", {giveRandomItem: 'spark_pool'}] } },
            'book_shelf_4': { type: 'npc', emoji: '📙', dialogue: { start: ["You pull a random volume...", {giveRandomItem: 'seforim_pool'}] } },
        }
    }
};
