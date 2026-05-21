
// B"H
// js/data/maps/qliphoth_depths.js

export const qliphothMaps = {
    'qliphoth_entrance': {
        width: 20,
        baseLayerString: `
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
⬛⬜🕷️⬜⬜⬜🕷️⬜⬜⬜🕷️⬜⬜⬜🕷️⬜⬛
⬛⬜🕸️🕸️🕸️🕸️🕸️⬜🕸️🕸️🕸️🕸️🕸️⬜🕸️🕸️🕸️⬜⬛
⬛⬜🕸️⬜⬜⬜🕸️⬜🕸️⬜⬜⬜🕸️⬜🕸️⬜⬜⬜⬛
⬛⬜🕷️⬜⬜🕷️⬜🕷️⬜⬜🕷️⬜🕷️⬜⬜⬛
⬛⬜🕸️⬜⬜⬜🕸️⬜🕸️⬜⬜⬜🕸️⬜🕸️⬜⬜⬜⬛
⬛⬜🕸️🕸️🕸️🕸️🕸️⬜🕸️🕸️🕸️🕸️🕸️⬜🕸️🕸️🕸️⬜⬛
⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
⬛⬜🕸️🕸️🕸️🕸️🕸️⬜🕸️🕸️🕸️🕸️🕸️⬜🕸️🕸️🕸️⬜⬛
⬛⬜🕸️⬜⬜⬜🕸️⬜🕸️⬜⬜⬜🕸️⬜🕸️⬜⬜⬜⬛
⬛⬜🕷️⬜🐍⬜🕷️⬜🕷️⬜💀⬜🕷️⬜🕷️⬜🐍⬜⬛
⬛⬜🕸️⬜⬜⬜🕸️⬜🕸️⬜⬜⬜🕸️⬜🕸️⬜⬜⬜⬛
⬛⬜🕸️🕸️🕸️🕸️🕸️⬜🕸️🕸️🕸️🕸️🕸️⬜🕸️🕸️🕸️⬜⬛
⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
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
            'to_malkuth': { type: 'door', uu: '\ue901', visual: '🚪', emoji: '🚪', x: 1, y: 1, targetMap: 'malkuth_village', targetX: 10, targetY: 10 },
            'to_abyss': { type: 'door', uu: '\ue902', visual: '🚪', emoji: '🚪', x: 17, y: 1, targetMap: 'qliphoth_abyss', targetX: 1, targetY: 5 },
            'doubt_whisper': { type: 'npc', uu: '\ue907', visual: '💀', emoji: '💀', x: 10, y: 4, dialogue: { start: ["Why do you struggle? It is easier to fall.", {startBattle: [{id: 'hollow_crown', level: 50}]}] } },
            'lower_malkuth_gate': { type: 'door', uu: '\ue903', visual: '🚪', emoji: '🚪', x: 1, y: 13, targetMap: 'malkuth_village', targetX: 10, targetY: 10 },
            'lower_abyss_gate': { type: 'door', uu: '\ue904', visual: '🚪', emoji: '🚪', x: 17, y: 13, targetMap: 'qliphoth_abyss', targetX: 13, targetY: 6 },
            'snake_west': { type: 'npc', uu: '\ue905', visual: '🐍', emoji: '🐍', x: 4, y: 4, dialogue: { start: ["A doubt coils here: maybe the body cannot be holy. Prove otherwise.", {startBattle: [{id: 'snake_of_doubt', level: 45}]}] } },
            'snake_east': { type: 'npc', uu: '\ue906', visual: '🐍', emoji: '🐍', x: 16, y: 4, dialogue: { start: ["Another doubt hisses: maybe action is only external. Answer with a deed.", {startBattle: [{id: 'snake_of_doubt', level: 47}]}] } },
            'snake_lower_west': { type: 'npc', uu: '\ue908', visual: '🐍', emoji: '🐍', x: 4, y: 10, dialogue: { start: ["The lower road tests whether joy survives concealment.", {startBattle: [{id: 'snake_of_doubt', level: 49}]}] } },
            'snake_lower_east': { type: 'npc', uu: '\ue909', visual: '🐍', emoji: '🐍', x: 16, y: 10, dialogue: { start: ["Even this shell has a spark waiting to be lifted.", {startBattle: [{id: 'snake_of_doubt', level: 51}]}] } },
            'deep_doubt_whisper': { type: 'npc', uu: '\ue90a', visual: '💀', emoji: '💀', x: 10, y: 10, dialogue: { start: ["If you name me exactly, I cannot steal another voice.", {startBattle: [{id: 'hollow_crown', level: 52}]}] } },
        }
    },
    'qliphoth_abyss': {
        width: 15,
        baseLayerString: `
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
⬛⬜🏺⬜⬜⬜🤢⬜⬜⬜🏺⬜⬜⬜⬛
⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
        `,
        encounters: {
            '⬜': [{ id: 'stagnant_mire', levelRange: [48, 58], chance: 0.5 }]
        },
        interactables: {
            'exit': { type: 'door', uu: '\ue911', visual: '🚪', emoji: '🚪', x: 1, y: 6, targetMap: 'qliphoth_entrance', targetX: 18, targetY: 13 },
            'false_king': { type: 'npc', uu: '\ue912', visual: '👑', emoji: '👑', x: 6, y: 4, dialogue: { start: ["I am the King of Nothing. Bow to me!", {startBattle: [{id: 'false_god', level: 65}]}] } },
            'abyss_east_exit': { type: 'door', uu: '\ue913', visual: '🚪', emoji: '🚪', x: 13, y: 6, targetMap: 'keter_heights', targetX: 1, targetY: 4 }
        }
    }
};
