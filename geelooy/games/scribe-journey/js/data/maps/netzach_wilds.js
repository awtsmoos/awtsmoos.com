
// B"H
// js/data/maps/netzach_wilds.js

export const netzachWildsMaps = {
    'netzach_wilds_entrance': {
        width: 20,
        baseLayerString: `
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
🌳🚪⬜🌿🌿🌿⬜⬜⬜🌳🌳⬜🌿⬜⬜⬜⬜⬜🌳
🌳🌳🌳🌿🌳🌳🌳🌳⬜🌳🌳⬜🌿🌳🌳🌳🌳⬜🌳
🌳⬜⬜⬜⬜⬜🌿⬜⬜⬜⬜⬜🌿⬜⬜⬜⬜⬜🌳
🌳⬜🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳⬜🌳
🌳⬜🌿⬜⬜⬜⬜⬜⬜🌿⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳🌳🌳⬜🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳⬜🌳
🌳⬜⬜⬜🌿⬜⬜⬜⬜⬜⬜⬜⬜🌿⬜⬜⬜⬜🌳
🌳⬜🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳⬜🌳
🌳⬜🌿⬜⬜⬜⬜⬜⬜🌿⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳🌳🌳⬜🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳⬜🌳
🌳⬜⬜⬜🌿⬜⬜⬜⬜⬜⬜⬜⬜🌿⬜⬜⬜⬜🌳
🌳⬜🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳⬜🌳
🌳⬜🌿⬜⬜⬜⬜⬜⬜🌿⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🚪🌳🌳
        `,
        encounters: {
            '🌿': [
                { id: 'enduring_vine', levelRange: [12, 16], chance: 0.6 },
                { id: 'rhythmic_dancer', levelRange: [14, 18], chance: 0.3 },
                { id: 'blind_zeal', levelRange: [15, 19], chance: 0.1 }
            ]
        },
        interactables: {
            'to_malkuth': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 18, targetY: 5 },
            'to_deep_jungle': { type: 'door', emoji: '🚪', targetMap: 'netzach_deep', targetX: 1, targetY: 1 },
        }
    },
    'netzach_deep': {
        width: 15,
        baseLayerString: `
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
🌳🛡️⬜🌿🌿🌿🌿🌿🌿🌿🌿🌿⬜🥁🌳
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳⬜🌳🌳
🌳🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿⬜🌿🌳
🌳⬜🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳⬜🌳
🌳⬜🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿⬜🌳
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳⬜🌳
🌳🏃⬜🌿🌿🌿🌿🌿🌿🌿🌿🌿⬜🚪🌳
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
        `,
        encounters: {
            '🌿': [
                { id: 'blind_zeal', levelRange: [18, 22], chance: 0.5 },
                { id: 'habitual_force', levelRange: [20, 25], chance: 0.5 },
                { id: 'swarm_of_bees', levelRange: [22, 26], chance: 0.4 }
            ]
        },
        interactables: {
            'to_entrance': { type: 'door', emoji: '🚪', targetMap: 'netzach_wilds_entrance', targetX: 1, targetY: 1 },
            'to_stadium': { type: 'door', emoji: '🏃', targetMap: 'netzach_stadium', targetX: 5, targetY: 8 },
        }
    },
    'netzach_stadium': {
         width: 15,
         baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🐐⬜⬜⬜🐝⬜⬜⬜🏃⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🚪🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
         `,
         encounters: {
             '⬜': [
                 { id: 'leaping_goat', levelRange: [25, 30], chance: 0.5 },
                 { id: 'blind_zeal', levelRange: [25, 30], chance: 0.5 }
             ]
         },
         interactables: {
             'exit': { type: 'door', emoji: '🚪', targetMap: 'netzach_deep', targetX: 2, targetY: 7 },
         }
    }
};
