
// B"H
// js/data/maps/hod_academy.js

export const hodAcademyMaps = {
    'hod_library': {
        width: 15,
        baseLayerString: `
📚📚📚📚📚📚📚📚📚📚📚📚📚📚📚
📚⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜📚
⬜📚📚📚📚⬜📚📚📚📚⬜🤔⬜📚
📚⬜📚⬜⬜⬜⬜⬜⬜⬜📚⬜⬜⬜📚
📚⬜📚⬜⬜⬜👨‍🔬⬜⬜⬜📚⬜⬜⬜📚
📚⬜📚⬜⬜⬜⬜⬜⬜⬜📚⬜⬜⬜📚
📚⬜📚📚📚📚⬜📚📚📚📚⬜⬜⬜📚
📚⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜📚
📚📚📚📚📚📚📚📚📚📚📚📚📚📚
        `,
        encounters: {
            '⬜': [ 
                { id: 'silent_syllogism', levelRange: [18, 22], chance: 0.3 },
                { id: 'recursive_loop', levelRange: [15, 20], chance: 0.2 }
            ]
        },
        interactables: {
            'to_atheneum': {type: 'door', uu: '\ue401', visual: '🚪', emoji: '🚪', x: 0, y: 2, targetMap: 'scribe_atheneum_upstairs', targetX: 5, targetY: 2},
            'to_lab': {type: 'door', uu: '\ue402', visual: '🔬', emoji: '🔬', x: 11, y: 8, targetMap: 'hod_laboratory', targetX: 1, targetY: 4},
        }
    },
    'hod_laboratory': {
        width: 11,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜⚗️⬜⚙️⬜⚗️⬜⚙️⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
⬜📐⬜⬜🤖⬜⬜📐⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        encounters: {
            '⬜': [
                { id: 'automaton_guard', levelRange: [22, 26], chance: 0.4 },
                { id: 'glass_beaker', levelRange: [20, 24], chance: 0.3 }
            ]
        },
        interactables: {
            'to_library': {type: 'door', uu: '\ue411', visual: '🚪', emoji: '🚪', x: 0, y: 4, targetMap: 'hod_library', targetX: 12, targetY: 8},
        }
    }
};
