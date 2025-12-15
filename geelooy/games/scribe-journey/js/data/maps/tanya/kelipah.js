
// B"H
// js/data/maps/tanya/kelipah.js

export const tanyaKelipahMaps = {
    'left_ventricle_1': {
        width: 20,
        baseLayerString: `
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
⬛🚪⬜🦍⬜⬜⬜🦊⬜⬜⬜🦁⬜⬜⬜🦍⬜🚪⬛
⬛⬜🌫️🌫️🌫️🌫️🌫️⬜🌫️🌫️🌫️🌫️🌫️⬜🌫️🌫️🌫️⬜⬛
⬛⬜🌫️⬜⬜⬜🌫️⬜🌫️⬜⬜⬜🌫️⬜🌫️⬜⬜⬜⬛
⬛⬜🦍⬜🤬⬜🦍⬜🦍⬜🤢⬜🦍⬜🦍⬜🤬⬜⬛
⬛⬜🌫️⬜⬜⬜🌫️⬜🌫️⬜⬜⬜🌫️⬜🌫️⬜⬜⬜⬛
⬛⬜🌫️🌫️🌫️🌫️🌫️⬜🌫️🌫️🌫️🌫️🌫️⬜🌫️🌫️🌫️⬜⬛
⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
⬛⬜🌫️🌫️🌫️🌫️🌫️⬜🌫️🌫️🌫️🌫️🌫️⬜🌫️🌫️🌫️⬜⬛
⬛⬜🌫️⬜⬜⬜🌫️⬜🌫️⬜⬜⬜🌫️⬜🌫️⬜⬜⬜⬛
⬛⬜🦍⬜🤬⬜🦍⬜🦍⬜🤢⬜🦍⬜🦍⬜🤬⬜⬛
⬛⬜🌫️⬜⬜⬜🌫️⬜🌫️⬜⬜⬜🌫️⬜🌫️⬜⬜⬜⬛
⬛⬜🌫️🌫️🌫️🌫️🌫️⬜🌫️🌫️🌫️🌫️🌫️⬜🌫️🌫️🌫️⬜⬛
⬛🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🚪⬛
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
        `,
        encounters: {
            '🌫️': [
                { id: 'arrogance_spirit', levelRange: [40, 45], chance: 0.4 },
                { id: 'depression_cloud', levelRange: [42, 48], chance: 0.3 }
            ],
            '⬛': [
                { id: 'gross_pride', levelRange: [50, 55], chance: 0.1 }
            ]
        },
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'tanya_entrance', targetX: 3, targetY: 4 },
            'to_deep_kelipah': { type: 'door', emoji: '🚪', targetMap: 'left_ventricle_2', targetX: 1, targetY: 10 },
            'anger_manifest': { type: 'npc', emoji: '🤬', dialogue: { start: ["Anger is idolatry! I control you!", {startBattle: [{id: 'gross_pride', level: 55}]}] } },
        }
    },
    'left_ventricle_2': {
        width: 15,
        baseLayerString: `
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
⬛⬜🐲⬜⬜⬜🤡⬜⬜⬜🐲⬜⬜⬜⬛
⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
⬛⬜⬜⬜⬜⬜🐗⬜⬜⬜⬜⬜⬜⬜⬛
⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
⬛🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🚪⬛
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
        `,
        encounters: {
            '⬜': [{ id: 'kelipat_nogah_beast', levelRange: [55, 60], chance: 0.5 }]
        },
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'left_ventricle_1', targetX: 10, targetY: 10 },
            'kelipah_boss': { type: 'npc', emoji: '🐗', dialogue: { start: ["I am the Selfishness that blocks the light. Subdue me, or become me.", {startBattle: [{id: 'kelipat_nogah_beast', level: 65}]}] } }
        }
    }
};
