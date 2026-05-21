
// B"H
// js/data/maps/seven_seventy.js

export const sevenSeventyMaps = {
    'eastern_parkway_exterior': {
        width: 30,
        baseLayerString: `
🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️
🏙️🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🏙️
🏙️🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🏙️
🏙️🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🧱🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🧱🏙️
🏙️🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️
        `,
        interactables: {
            '770_entrance': { type: 'door', uu: '\uf508', visual: '🚪', emoji: '🚪', x: 9, y: 3, targetMap: 'shul_downstairs', targetX: 10, targetY: 18, dialogue: { start: ["(The Three Triangular Windows above look down upon you. You enter the House of Sages)."] } },
            'mivtzoim_tank': { type: 'npc', uu: '\uf512', visual: '🚍', emoji: '🚍', x: 2, y: 8, dialogue: { start: ["Need supplies for the campaign?", {shop: true, stock: ['tefillin_pair', 'shabbat_candles', 'tzedakah_pennies']}] } },
            'exit_to_crown': { type: 'door', uu: '\uf503', visual: '🏙️', emoji: '🏙️', x: 9, y: 2, targetMap: 'kingston_ave', targetX: 5, targetY: 5 },
            'mivtzoim_tank_east': { type: 'npc', uu: '\uf518', visual: '🚍', emoji: '🚍', x: 16, y: 8, dialogue: { start: ["A second mitzvah tank waits for the next route."] } },
            'dancer': { type: 'npc', uu: '\uf50c', visual: '🕺', emoji: '🕺', x: 9, y: 4, dialogue: { start: ["Joy breaks public-space concealment."] } },
            'bus_west': { type: 'npc', uu: '\uf50b', visual: '🚌', emoji: '🚌', x: 6, y: 4, dialogue: { start: ["A bus full of students heads to mivtzoim."] } },
            'bus_east': { type: 'npc', uu: '\uf50d', visual: '🚌', emoji: '🚌', x: 12, y: 4, dialogue: { start: ["A second bus carries another route."] } },
            'ambulance_west': { type: 'npc', uu: '\uf509', visual: '🚑', emoji: '🚑', x: 2, y: 4, dialogue: { start: ["A refuah mission waits here."] } },
            'ambulance_east': { type: 'npc', uu: '\uf510', visual: '🚑', emoji: '🚑', x: 18, y: 4, dialogue: { start: ["Healing is also shlichus."] } }
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
🧱📚📚📚📚📚📚📚📚📚📚📚📚📚📚📚📚🧱
🧱📚⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜📚🧱
🧱📚⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜📚🧱
🧱📚⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜📚🧱
🧱📚⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜📚🧱
🧱📚⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜📚🧱
🧱📚⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜📚🧱
🧱📚⬜⬜⬜⬜⬜⬜⬜🧱⬜⬜⬜⬜⬜⬜⬜📚🧱
🧱📚📚📚📚📚📚📚📚📚📚📚📚📚📚📚📚🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', uu: '\uf521', visual: '🚪', emoji: '🚪', x: 9, y: 9, targetMap: 'eastern_parkway_exterior', targetX: 12, targetY: 3 },
            'rebbe_chair': { type: 'npc', uu: '\uf522', visual: '🤴', emoji: '🤴', x: 9, y: 1, dialogue: { start: ["(The place of the Nasi. A red velvet chair. You feel an overwhelming urge to increase in goodness).", {action: 'meditate'}] } },
            'bimah': { type: 'npc', uu: '\uf523', visual: '📖', emoji: '📖', x: 8, y: 5, dialogue: { start: ["(The Torah reading platform.)", {action: 'read_parsha'}] } },
            'ark': { type: 'npc', uu: '\uf524', visual: '📜', emoji: '📜', x: 9, y: 3, dialogue: { start: ["(The Holy Ark. It contains the Scrolls of Law.)", "The letters fly in the air."] } },
            'farbrengen': { type: 'npc', uu: '\uf525', visual: '🧔', emoji: '🧔', x: 3, y: 3, dialogue: { start: ["L'chaim! The bench is crowded, but there's room for one more soul.", {action: 'farbrengen_heal'}] } },
            'upstairs_door': { type: 'door', uu: '\uf52f', visual: '📚', emoji: '📚', x: 8, y: 10, targetMap: 'library_infinite', targetX: 1, targetY: 1 },
            'farbrengen_east': { type: 'npc', uu: '\uf528', visual: '🧔', emoji: '🧔', x: 15, y: 3, dialogue: { start: ["Another farbrengen: the same fire, another vessel."] } },
            'lower_farbrengen_west': { type: 'npc', uu: '\uf52b', visual: '🧔', emoji: '🧔', x: 3, y: 7, dialogue: { start: ["The lower table turns inspiration into a hachlata."] } },
            'lower_farbrengen_east': { type: 'npc', uu: '\uf52e', visual: '🧔', emoji: '🧔', x: 15, y: 7, dialogue: { start: ["The final lchaim sends you back to the road."] } },
            'study_group_a': { type: 'npc', uu: '\uf526', visual: '👬', emoji: '👬', x: 5, y: 3, dialogue: { start: ["A pair learns Tanya before going out."] } },
            'study_group_b': { type: 'npc', uu: '\uf527', visual: '👬', emoji: '👬', x: 13, y: 3, dialogue: { start: ["A pair learns the daily Rambam."] } },
            'study_group_c': { type: 'npc', uu: '\uf529', visual: '👬', emoji: '👬', x: 3, y: 5, dialogue: { start: ["A pair maps the city roads."] } },
            'study_group_d': { type: 'npc', uu: '\uf52a', visual: '👬', emoji: '👬', x: 14, y: 5, dialogue: { start: ["A pair reviews the master Rabbi gates."] } },
            'study_group_e': { type: 'npc', uu: '\uf52c', visual: '👬', emoji: '👬', x: 5, y: 7, dialogue: { start: ["A pair debates body and soul."] } },
            'study_group_f': { type: 'npc', uu: '\uf52d', visual: '👬', emoji: '👬', x: 12, y: 7, dialogue: { start: ["A pair prepares a shlichus route."] } }
        }
    },
    'library_infinite': {
        width: 15,
        baseLayerString: `
📚📚📚📚📚📚📚📚📚📚📚📚📚📚📚
📚⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜📚
📚⬜⬜⬜⬜⬜⬜⬜📚
📚⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜📚
📚⬜⬜⬜⬜⬜⬜⬜📚
📚⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜📚
📚⬜📕⬜📗⬜📘⬜📙⬜📕⬜📗⬜📚
📚⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜📚
📚📚📚📚📚📚📚📚📚📚📚📚📚📚
        `,
        interactables: {
            'exit': { type: 'door', uu: '\uf531', visual: '🚪', emoji: '🚪', x: 7, y: 8, targetMap: 'shul_downstairs', targetX: 2, targetY: 2 },
            // Procedurally generated book loots
            'book_shelf_1': { type: 'npc', uu: '\uf535', visual: '📕', emoji: '📕', x: 2, y: 2, dialogue: { start: ["You pull a random volume...", {giveRandomItem: 'seforim_pool'}] } },
            'book_shelf_2': { type: 'npc', uu: '\uf536', visual: '📗', emoji: '📗', x: 4, y: 2, dialogue: { start: ["You pull a random volume...", {giveRandomItem: 'seforim_pool'}] } },
            'book_shelf_3': { type: 'npc', uu: '\uf537', visual: '📘', emoji: '📘', x: 6, y: 2, dialogue: { start: ["You see a spark hiding behind the books...", {giveRandomItem: 'spark_pool'}] } },
            'book_shelf_4': { type: 'npc', uu: '\uf538', visual: '📙', emoji: '📙', x: 8, y: 2, dialogue: { start: ["You pull a random volume...", {giveRandomItem: 'seforim_pool'}] } },
            'book_shelf_5': { type: 'npc', uu: '\uf539', visual: '📕', emoji: '📕', x: 10, y: 2, dialogue: { start: ["You pull a named volume from the infinite library.", {giveRandomItem: 'seforim_pool'}] } },
            'book_shelf_6': { type: 'npc', uu: '\uf53a', visual: '📗', emoji: '📗', x: 12, y: 2, dialogue: { start: ["You pull a named volume from the infinite library.", {giveRandomItem: 'seforim_pool'}] } },
            'book_shelf_7': { type: 'npc', uu: '\uf53b', visual: '📘', emoji: '📘', x: 2, y: 4, dialogue: { start: ["You pull a named volume from the infinite library.", {giveRandomItem: 'seforim_pool'}] } },
            'book_shelf_8': { type: 'npc', uu: '\uf53c', visual: '📙', emoji: '📙', x: 4, y: 4, dialogue: { start: ["You pull a named volume from the infinite library.", {giveRandomItem: 'seforim_pool'}] } },
            'book_shelf_9': { type: 'npc', uu: '\uf53d', visual: '📕', emoji: '📕', x: 6, y: 4, dialogue: { start: ["You pull a named volume from the infinite library.", {giveRandomItem: 'seforim_pool'}] } },
            'book_shelf_10': { type: 'npc', uu: '\uf53e', visual: '📗', emoji: '📗', x: 8, y: 4, dialogue: { start: ["You pull a named volume from the infinite library.", {giveRandomItem: 'seforim_pool'}] } },
            'book_shelf_11': { type: 'npc', uu: '\uf53f', visual: '📘', emoji: '📘', x: 10, y: 4, dialogue: { start: ["You pull a named volume from the infinite library.", {giveRandomItem: 'seforim_pool'}] } },
            'book_shelf_12': { type: 'npc', uu: '\uf540', visual: '📙', emoji: '📙', x: 12, y: 4, dialogue: { start: ["You pull a named volume from the infinite library.", {giveRandomItem: 'seforim_pool'}] } },
            'book_shelf_13': { type: 'npc', uu: '\uf541', visual: '📕', emoji: '📕', x: 2, y: 6, dialogue: { start: ["You pull a named volume from the infinite library.", {giveRandomItem: 'seforim_pool'}] } },
            'book_shelf_14': { type: 'npc', uu: '\uf542', visual: '📗', emoji: '📗', x: 4, y: 6, dialogue: { start: ["You pull a named volume from the infinite library.", {giveRandomItem: 'seforim_pool'}] } },
            'book_shelf_15': { type: 'npc', uu: '\uf543', visual: '📘', emoji: '📘', x: 6, y: 6, dialogue: { start: ["You pull a named volume from the infinite library.", {giveRandomItem: 'seforim_pool'}] } },
            'book_shelf_16': { type: 'npc', uu: '\uf544', visual: '📙', emoji: '📙', x: 8, y: 6, dialogue: { start: ["You pull a named volume from the infinite library.", {giveRandomItem: 'seforim_pool'}] } },
            'book_shelf_17': { type: 'npc', uu: '\uf545', visual: '📕', emoji: '📕', x: 10, y: 6, dialogue: { start: ["You pull a named volume from the infinite library.", {giveRandomItem: 'seforim_pool'}] } },
            'book_shelf_18': { type: 'npc', uu: '\uf546', visual: '📗', emoji: '📗', x: 12, y: 6, dialogue: { start: ["You pull a named volume from the infinite library.", {giveRandomItem: 'seforim_pool'}] } },
        }
    }
};
