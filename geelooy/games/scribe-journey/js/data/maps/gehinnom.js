
// B"H
// js/data/maps/gehinnom.js

export const gehinnomMaps = {
    'gehinnom_gate': {
        width: 15,
        baseLayerString: `
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
⬛🚪⬜🌑⬜🌑⬜🌑⬜🌑⬜🌑⬜🚪⬛
⬛⬜🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️⬜⬛
⬛⬜🌫️💀⬜🌫️💀⬜💀🌫️⬜💀🌫️⬜⬛
⬛⬜🌫️⬜⬜⬜⬜⬜⬜⬜⬜⬜🌫️⬜⬛
⬛⬜🌫️⛓️⬜⛓️⬜🦇⬜⛓️⬜⛓️🌫️⬜⬛
⬛⬜🌫️⬜⬜⬜⬜⬜⬜⬜⬜⬜🌫️⬜⬛
⬛⬜🌑⬜🌑⬜🌑⬜🌑⬜🌑⬜🌑⬜⬛
⬛🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🚪⬛
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
        `,
        encounters: {
            '🌫️': [
                { id: 'guilt_heavy', levelRange: [40, 50], chance: 0.4 },
                { id: 'shame_hot', levelRange: [40, 50], chance: 0.3 }
            ]
        },
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 12, targetY: 11 },
            'dumah_angel': { type: 'npc', emoji: '🦇', dialogue: { start: ["I am Dumah. I guard the silence of the grave. Are you ready to scream your sins?"] } },
            'to_level_1': { type: 'door', emoji: '⛓️', targetMap: 'gehinnom_1_bor_shaon', targetX: 1, targetY: 4 }
        }
    },
    'gehinnom_1_bor_shaon': {
        width: 12,
        baseLayerString: `
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
🪨🚪⬜📢⬜⬜🔊⬜⬜📢⬜🪨
🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨⬜🌪️⬜🙉⬜🌪️⬜🙉⬜⬜🪨
🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨⬜📢⬜⬜🔊⬜⬜📢⬜⬜🪨
🪨🪨🪨🪨🪨🪨🚪🪨🪨🪨🪨🪨🪨
        `,
        encounters: {
            '⬜': [{ id: 'noise_of_distraction', levelRange: [45, 55], chance: 0.5 }]
        },
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'gehinnom_gate', targetX: 5, targetY: 5 },
            'next': { type: 'door', emoji: '🚪', targetMap: 'gehinnom_2_tit_hayaven', targetX: 1, targetY: 1 }
        }
    },
    'gehinnom_2_tit_hayaven': {
        width: 12,
        baseLayerString: `
💩💩💩💩💩💩💩💩💩💩💩💩
💩🚪⬜🕸️⬜⬜🕸️⬜⬜🕸️⬜💩
💩⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜💩
💩⬜🐌⬜🐌⬜🦥⬜🐌⬜🐌⬜💩
💩⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜💩
💩⬜🕸️⬜⬜🕸️⬜⬜🕸️⬜⬜💩
💩💩💩💩💩💩🚪💩💩💩💩💩💩
        `,
        encounters: {
            '⬜': [{ id: 'sticky_laziness', levelRange: [50, 60], chance: 0.5 }]
        },
        interactables: {
            'prev': { type: 'door', emoji: '🚪', targetMap: 'gehinnom_1_bor_shaon', targetX: 6, targetY: 6 },
            'next': { type: 'door', emoji: '🚪', targetMap: 'nahar_dinur_shore', targetX: 1, targetY: 4 }
        }
    },
    'nahar_dinur_shore': {
        width: 20,
        baseLayerString: `
🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋
🌋🚪⬜🔥⬜🔥⬜🔥⬜🔥⬜🔥⬜🔥⬜🚪🌋
🌋⬜🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥⬜🌋
🌋⬜🔥👺⬜🔥👺⬜🔥👺⬜🔥👺⬜🌋
🌋⬜🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥⬜🌋
🌋⬜🔥⬜🔥⬜🔥⬜🔥⬜🔥⬜🔥⬜🌋
🌋🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🚪🌋
🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋🌋
        `,
        encounters: {
            '🔥': [{ id: 'fiery_perspiration', levelRange: [60, 70], chance: 0.6 }]
        },
        interactables: {
            'prev': { type: 'door', emoji: '🚪', targetMap: 'gehinnom_2_tit_hayaven', targetX: 6, targetY: 6 },
            'yurkami_angel': { type: 'npc', emoji: '👺', dialogue: { start: ["I am Yurkami, Prince of Hail. I cool the souls who burn too hot with passion for the wrong things.", {startBattle: [{id: 'angel_of_hail', level: 66}]}] } }
        }
    }
};
