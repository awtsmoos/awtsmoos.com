
// B"H
// js/data/maps/gehinnom.js

export const gehinnomMaps = {
    'gehinnom_gate': {
        width: 15,
        baseLayerString: `
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
⬛⬜🌑⬜🌑⬜🌑⬜🌑⬜🌑⬜⬛
⬛⬜🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️⬜⬛
⬛⬜🌫️💀⬜🌫️💀⬜💀🌫️⬜💀🌫️⬜⬛
⬛⬜🌫️⬜⬜⬜⬜⬜⬜⬜⬜⬜🌫️⬜⬛
⬛⬜🌫️⬜⬜⬜⬜🌫️⬜⬛
⬛⬜🌫️⬜⬜⬜⬜⬜⬜⬜⬜⬜🌫️⬜⬛
⬛⬜🌑⬜🌑⬜🌑⬜🌑⬜🌑⬜🌑⬜⬛
⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
        `,
        encounters: {
            '🌫️': [
                { id: 'guilt_heavy', levelRange: [40, 50], chance: 0.4 },
                { id: 'shame_hot', levelRange: [40, 50], chance: 0.3 }
            ]
        },
        interactables: {
            'exit': { type: 'door', uu: '\uf701', visual: '🚪', emoji: '🚪', x: 1, y: 1, targetMap: 'malkuth_village', targetX: 12, targetY: 11 },
            'dumah_angel': { type: 'npc', uu: '\uf702', visual: '🦇', emoji: '🦇', x: 7, y: 5, dialogue: { start: ["I am Dumah. I guard the silence of the grave. Are you ready to scream your sins?"] } },
            'to_level_1': { type: 'door', uu: '\uf703', visual: '⛓️', emoji: '⛓️', x: 3, y: 5, targetMap: 'gehinnom_1_bor_shaon', targetX: 1, targetY: 4 },
            'upper_right_exit': { type: 'door', uu: '\uf704', visual: '🚪', emoji: '🚪', x: 13, y: 1, targetMap: 'malkuth_village', targetX: 12, targetY: 11 },
            'chain_midwest': { type: 'door', uu: '\uf705', visual: '⛓️', emoji: '⛓️', x: 5, y: 5, targetMap: 'gehinnom_1_bor_shaon', targetX: 1, targetY: 4 },
            'chain_mideast': { type: 'door', uu: '\uf706', visual: '⛓️', emoji: '⛓️', x: 9, y: 5, targetMap: 'gehinnom_1_bor_shaon', targetX: 1, targetY: 4 },
            'chain_east': { type: 'door', uu: '\uf707', visual: '⛓️', emoji: '⛓️', x: 11, y: 5, targetMap: 'gehinnom_1_bor_shaon', targetX: 1, targetY: 4 },
            'lower_left_exit': { type: 'door', uu: '\uf708', visual: '🚪', emoji: '🚪', x: 1, y: 8, targetMap: 'malkuth_village', targetX: 12, targetY: 11 },
            'lower_right_exit': { type: 'door', uu: '\uf709', visual: '🚪', emoji: '🚪', x: 13, y: 8, targetMap: 'gehinnom_1_bor_shaon', targetX: 1, targetY: 4 }
        }
    },
    'gehinnom_1_bor_shaon': {
        width: 12,
        baseLayerString: `
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
🪨⬜⬜⬜⬜⬜⬜🪨
🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨⬜⬜⬜⬜⬜⬜🪨
🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨⬜⬜⬜⬜⬜⬜⬜🪨
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
        `,
        encounters: {
            '⬜': [{ id: 'noise_of_distraction', levelRange: [45, 55], chance: 0.5 }]
        },
        interactables: {
            'exit': { type: 'door', uu: '\uf711', visual: '🚪', emoji: '🚪', x: 1, y: 1, targetMap: 'gehinnom_gate', targetX: 5, targetY: 5 },
            'next': { type: 'door', uu: '\uf712', visual: '🚪', emoji: '🚪', x: 6, y: 6, targetMap: 'gehinnom_2_tit_hayaven', targetX: 1, targetY: 1 },
            'noise_left': { type: 'npc', uu: '\uf713', visual: '📢', emoji: '📢', x: 3, y: 1, dialogue: { start: ["Noise demands attention; silence demands truth."] } },
            'noise_center': { type: 'npc', uu: '\uf714', visual: '🔊', emoji: '🔊', x: 6, y: 1, dialogue: { start: ["A loud thought can still be empty."] } },
            'noise_right': { type: 'npc', uu: '\uf715', visual: '📢', emoji: '📢', x: 9, y: 1, dialogue: { start: ["The pit echoes until you name the voice."] } }
        }
    },
    'gehinnom_2_tit_hayaven': {
        width: 12,
        baseLayerString: `
💩💩💩💩💩💩💩💩💩💩💩💩
💩⬜🕸️⬜⬜🕸️⬜⬜🕸️⬜💩
💩⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜💩
💩⬜⬜⬜⬜⬜⬜💩
💩⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜💩
💩⬜🕸️⬜⬜🕸️⬜⬜🕸️⬜⬜💩
💩💩💩💩💩💩💩💩💩💩💩💩
        `,
        encounters: {
            '⬜': [{ id: 'sticky_laziness', levelRange: [50, 60], chance: 0.5 }]
        },
        interactables: {
            'prev': { type: 'door', uu: '\uf721', visual: '🚪', emoji: '🚪', x: 1, y: 1, targetMap: 'gehinnom_1_bor_shaon', targetX: 6, targetY: 6 },
            'next': { type: 'door', uu: '\uf722', visual: '🚪', emoji: '🚪', x: 6, y: 6, targetMap: 'nahar_dinur_shore', targetX: 1, targetY: 4 },
            'snail_west': { type: 'npc', uu: '\uf723', visual: '🐌', emoji: '🐌', x: 2, y: 3, dialogue: { start: ["Delay becomes mud when it refuses a mission."] } },
            'sloth_center': { type: 'npc', uu: '\uf725', visual: '🦥', emoji: '🦥', x: 6, y: 3, dialogue: { start: ["Laziness is not rest; it is refusal to rise."] } }
        }
    },
    'nahar_dinur_shore': {
        width: 20,
        baseLayerString: `
🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋
🌋⬜🔥⬜🔥⬜🔥⬜🔥⬜🔥⬜🔥⬜🌋
🌋⬜🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥⬜🌋
🌋⬜🔥⬜🔥⬜🔥⬜🔥⬜🌋
🌋⬜🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥⬜🌋
🌋⬜🔥⬜🔥⬜🔥⬜🔥⬜🔥⬜🔥⬜🌋
🌋⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌋
🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋
        `,
        encounters: {
            '🔥': [{ id: 'fiery_perspiration', levelRange: [60, 70], chance: 0.6 }]
        },
        interactables: {
            'prev': { type: 'door', uu: '\uf731', visual: '🚪', emoji: '🚪', x: 1, y: 1, targetMap: 'gehinnom_2_tit_hayaven', targetX: 6, targetY: 6 },
            'yurkami_angel': { type: 'npc', uu: '\uf732', visual: '👺', emoji: '👺', x: 3, y: 3, dialogue: { start: ["I am Yurkami, Prince of Hail. I cool the souls who burn too hot with passion for the wrong things.", {startBattle: [{id: 'angel_of_hail', level: 66}]}] } },
            'right_exit': { type: 'door', uu: '\uf733', visual: '🚪', emoji: '🚪', x: 15, y: 1, targetMap: 'malkuth_village', targetX: 12, targetY: 11 },
            'yurkami_midwest': { type: 'npc', uu: '\uf734', visual: '👺', emoji: '👺', x: 6, y: 3, dialogue: { start: ["Another heat must be cooled without extinguishing holy passion.", {startBattle: [{id: 'angel_of_hail', level: 67}]}] } },
            'yurkami_mideast': { type: 'npc', uu: '\uf735', visual: '👺', emoji: '👺', x: 9, y: 3, dialogue: { start: ["The river of fire purifies direction.", {startBattle: [{id: 'angel_of_hail', level: 68}]}] } },
            'yurkami_east': { type: 'npc', uu: '\uf736', visual: '👺', emoji: '👺', x: 12, y: 3, dialogue: { start: ["When passion serves ego, it burns; when it serves Torah, it shines.", {startBattle: [{id: 'angel_of_hail', level: 69}]}] } },
            'lower_west_exit': { type: 'door', uu: '\uf737', visual: '🚪', emoji: '🚪', x: 1, y: 6, targetMap: 'gehinnom_2_tit_hayaven', targetX: 6, targetY: 6 },
            'lower_east_exit': { type: 'door', uu: '\uf738', visual: '🚪', emoji: '🚪', x: 15, y: 6, targetMap: 'malkuth_village', targetX: 12, targetY: 11 }
        }
    }
};
