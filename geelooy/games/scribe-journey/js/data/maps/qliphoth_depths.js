
// B"H
// js/data/maps/qliphoth_depths.js

export const qliphothMaps = {
    'qliphoth_entrance': {
        width: 20,
        baseLayerString: `
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
⬛🚪⬜🕷️⬜⬜⬜🕷️⬜⬜⬜🕷️⬜⬜⬜🕷️⬜🚪⬛
⬛⬜🕸️🕸️🕸️🕸️🕸️⬜🕸️🕸️🕸️🕸️🕸️⬜🕸️🕸️🕸️⬜⬛
⬛⬜🕸️⬜⬜⬜🕸️⬜🕸️⬜⬜⬜🕸️⬜🕸️⬜⬜⬜⬛
⬛⬜🕷️⬜🐍⬜🕷️⬜🕷️⬜💀⬜🕷️⬜🕷️⬜🐍⬜⬛
⬛⬜🕸️⬜⬜⬜🕸️⬜🕸️⬜⬜⬜🕸️⬜🕸️⬜⬜⬜⬛
⬛⬜🕸️🕸️🕸️🕸️🕸️⬜🕸️🕸️🕸️🕸️🕸️⬜🕸️🕸️🕸️⬜⬛
⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
⬛⬜🕸️🕸️🕸️🕸️🕸️⬜🕸️🕸️🕸️🕸️🕸️⬜🕸️🕸️🕸️⬜⬛
⬛⬜🕸️⬜⬜⬜🕸️⬜🕸️⬜⬜⬜🕸️⬜🕸️⬜⬜⬜⬛
⬛⬜🕷️⬜🐍⬜🕷️⬜🕷️⬜💀⬜🕷️⬜🕷️⬜🐍⬜⬛
⬛⬜🕸️⬜⬜⬜🕸️⬜🕸️⬜⬜⬜🕸️⬜🕸️⬜⬜⬜⬛
⬛⬜🕸️🕸️🕸️🕸️🕸️⬜🕸️🕸️🕸️🕸️🕸️⬜🕸️🕸️🕸️⬜⬛
⬛🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🚪⬛
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
        `,
        encounters: {
            '🕸️': [
                { id: 'broken_vessel', levelRange: [40, 50], chance: 0.4 },
                { id: 'snake_of_doubt', levelRange: [45, 55], chance: 0.3 }
            ],
             '⬛': [
                { id: 'hollow_crown', levelRange: [50, 60], chance: 0.1 }
             ]
        },
        interactables: {
            'to_malkuth': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 10, targetY: 10 },
            'to_abyss': { type: 'door', emoji: '🚪', targetMap: 'qliphoth_abyss', targetX: 1, targetY: 5 },
            'doubt_whisper': { type: 'npc', emoji: '💀', dialogue: { start: ["Why do you struggle? It is easier to fall.", {startBattle: [{id: 'hollow_crown', level: 50}]}] } },
        }
    },
    'qliphoth_abyss': {
        width: 15,
        baseLayerString: `
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
⬛⬜🏺⬜⬜⬜🤢⬜⬜⬜🏺⬜⬜⬜⬛
⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
⬛⬜⬜⬜⬜⬜👑⬜⬜⬜⬜⬜⬜⬜⬛
⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
⬛🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🚪⬛
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
        `,
        encounters: {
            '⬜': [{ id: 'stagnant_mire', levelRange: [48, 58], chance: 0.5 }]
        },
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'qliphoth_entrance', targetX: 18, targetY: 13 },
            'false_king': { type: 'npc', emoji: '👑', dialogue: { start: ["I am the King of Nothing. Bow to me!", {startBattle: [{id: 'false_god', level: 65}]}] } }
        }
    }
};
