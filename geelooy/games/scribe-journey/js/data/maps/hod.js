
// B"H
// js/data/maps/hod.js

export const hodMaps = {
    'hod_library': {
        width: 15,
        baseLayerString: `
📚📚📚📚📚📚📚📚📚📚📚📚📚📚📚
📚⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜📚
🚪⬜📚📚📚📚⬜📚📚📚📚⬜🤔⬜📚
📚⬜📚⬜⬜⬜⬜⬜⬜⬜📚⬜⬜⬜📚
📚⬜📚⬜⬜⬜👨‍🔬⬜⬜⬜📚⬜⬜⬜📚
📚⬜📚⬜⬜⬜⬜⬜⬜⬜📚⬜⬜⬜📚
📚⬜📚📚📚📚⬜📚📚📚📚⬜⬜⬜📚
📚⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜📚
📚📚📚📚📚📚📚📚📚📚📚🔬📚📚📚
        `,
        encounters: {
            '⬜': [ 
                { id: 'silent_syllogism', levelRange: [18, 22], chance: 0.3 },
                { id: 'recursive_loop', levelRange: [15, 20], chance: 0.2 }
            ]
        },
        interactables: {
            'to_atheneum': {type: 'door', emoji: '🚪', targetMap: 'scribe_atheneum_upstairs', targetX: 5, targetY: 2},
            'to_lab': {type: 'door', emoji: '🔬', targetMap: 'hod_laboratory', targetX: 1, targetY: 4},
            'silent_scholar': {type: 'npc', emoji: '👨‍🔬', dialogue: {start: ["(The scholar does not speak. He merely points to a line in an open sefer:) 'In Hod, there is no need for sound. Logic is the only voice, and structure is the only truth.'"]}},
            'hidden_boss': {type: 'npc', emoji: '🤔', dialogue: {start: ["A concept of pure, unwavering logic stands before you. It does not challenge you with malice, but with the simple, irrefutable fact of its own existence.", {startBattle: [{id: 'silent_syllogism', level: 25}]}]}},
        }
    },
    'hod_laboratory': {
        width: 11,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜⚗️⬜⚙️⬜⚗️⬜⚙️⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🚪⬜📐⬜⬜🤖⬜⬜📐⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        encounters: {
            '⬜': [
                { id: 'cold_logic', levelRange: [22, 26], chance: 0.4 },
                { id: 'echo_chamber', levelRange: [20, 24], chance: 0.3 }
            ]
        },
        interactables: {
            'to_library': {type: 'door', emoji: '🚪', targetMap: 'hod_library', targetX: 12, targetY: 8},
            'automaton': {type: 'npc', emoji: '🤖', dialogue: {start: ["INPUT: QUESTION. OUTPUT: DEFINITION.", {startBattle: [{id: 'cold_logic', level: 30}]}]}}
        }
    }
};
