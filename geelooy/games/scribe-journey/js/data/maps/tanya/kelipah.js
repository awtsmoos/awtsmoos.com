
// B"H
// js/data/maps/tanya/kelipah.js

export const tanyaKelipahMaps = {
    'left_ventricle_1': {
        width: 20,
        baseLayerString: `
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
⬛⬜🦍⬜⬜⬜🦊⬜⬜⬜🦁⬜⬜⬜🦍⬜⬛
⬛⬜🌫️🌫️🌫️🌫️🌫️⬜🌫️🌫️🌫️🌫️🌫️⬜🌫️🌫️🌫️⬜⬛
⬛⬜🌫️⬜⬜⬜🌫️⬜🌫️⬜⬜⬜🌫️⬜🌫️⬜⬜⬜⬛
⬛⬜🦍⬜⬜🦍⬜🦍⬜⬜🦍⬜🦍⬜⬜⬛
⬛⬜🌫️⬜⬜⬜🌫️⬜🌫️⬜⬜⬜🌫️⬜🌫️⬜⬜⬜⬛
⬛⬜🌫️🌫️🌫️🌫️🌫️⬜🌫️🌫️🌫️🌫️🌫️⬜🌫️🌫️🌫️⬜⬛
⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
⬛⬜🌫️🌫️🌫️🌫️🌫️⬜🌫️🌫️🌫️🌫️🌫️⬜🌫️🌫️🌫️⬜⬛
⬛⬜🌫️⬜⬜⬜🌫️⬜🌫️⬜⬜⬜🌫️⬜🌫️⬜⬜⬜⬛
⬛⬜🦍⬜🤬⬜🦍⬜🦍⬜🤢⬜🦍⬜🦍⬜🤬⬜⬛
⬛⬜🌫️⬜⬜⬜🌫️⬜🌫️⬜⬜⬜🌫️⬜🌫️⬜⬜⬜⬛
⬛⬜🌫️🌫️🌫️🌫️🌫️⬜🌫️🌫️🌫️🌫️🌫️⬜🌫️🌫️🌫️⬜⬛
⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
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
            'exit': { type: 'door', uu: '\uef21', visual: '🚪', emoji: '🚪', x: 1, y: 1, targetMap: 'tanya_entrance', targetX: 3, targetY: 4 },
            'to_deep_kelipah': { type: 'door', uu: '\uef22', visual: '🚪', emoji: '🚪', x: 17, y: 1, targetMap: 'left_ventricle_2', targetX: 1, targetY: 10 },
            'anger_manifest': { type: 'npc', uu: '\uef25', visual: '🤬', emoji: '🤬', x: 4, y: 4, dialogue: { start: ["Anger is idolatry! I control you!", {startBattle: [{id: 'gross_pride', level: 55}]}] } },
            'lower_exit': { type: 'door', uu: '\uef23', visual: '🚪', emoji: '🚪', x: 1, y: 13, targetMap: 'tanya_entrance', targetX: 3, targetY: 6 },
            'lower_deep_kelipah': { type: 'door', uu: '\uef24', visual: '🚪', emoji: '🚪', x: 17, y: 13, targetMap: 'left_ventricle_2', targetX: 13, targetY: 6 },
            'anger_manifest_east': { type: 'npc', uu: '\uef26', visual: '🤬', emoji: '🤬', x: 16, y: 4, dialogue: { start: ["Anger borrows a second face, but now it is named.", {startBattle: [{id: 'gross_pride', level: 56}]}] } },
            'anger_manifest_lower_west': { type: 'npc', uu: '\uef27', visual: '🤬', emoji: '🤬', x: 4, y: 10, dialogue: { start: ["The Beinoni can feel fire and still refuse its command.", {startBattle: [{id: 'gross_pride', level: 57}]}] } },
            'nausea_of_kelipah': { type: 'npc', uu: '\uef28', visual: '🤢', emoji: '🤢', x: 10, y: 4, dialogue: { start: ["Coarse desire clouds the mind; clarify it through action.", {startBattle: [{id: 'kelipat_nogah_beast', level: 54}]}] } },
            'nausea_of_kelipah_lower': { type: 'npc', uu: '\uef29', visual: '🤢', emoji: '🤢', x: 10, y: 10, dialogue: { start: ["Even nausea can become a sign to turn toward holiness.", {startBattle: [{id: 'kelipat_nogah_beast', level: 55}]}] } },
            'anger_manifest_lower_east': { type: 'npc', uu: '\uef2a', visual: '🤬', emoji: '🤬', x: 16, y: 10, dialogue: { start: ["Victory is not never feeling anger. Victory is never serving it.", {startBattle: [{id: 'gross_pride', level: 58}]}] } },
        }
    },
    'left_ventricle_2': {
        width: 15,
        baseLayerString: `
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
⬛⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬛
⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
        `,
        encounters: {
            '⬜': [{ id: 'kelipat_nogah_beast', levelRange: [55, 60], chance: 0.5 }]
        },
        interactables: {
            'exit': { type: 'door', uu: '\uef31', visual: '🚪', emoji: '🚪', x: 1, y: 6, targetMap: 'left_ventricle_1', targetX: 10, targetY: 10 },
            'kelipah_boss': { type: 'npc', uu: '\uef33', visual: '🐗', emoji: '🐗', x: 6, y: 4, dialogue: { start: ["I am the Selfishness that blocks the light. Subdue me, or become me.", {startBattle: [{id: 'kelipat_nogah_beast', level: 65}]}] } },
            'right_exit': { type: 'door', uu: '\uef32', visual: '🚪', emoji: '🚪', x: 13, y: 6, targetMap: 'tanya_entrance', targetX: 10, targetY: 6 },
            'dragon_west': { type: 'npc', uu: '\uef35', visual: '🐲', emoji: '🐲', x: 2, y: 2, dialogue: { start: ["Imagination becomes monstrous when it crowns itself.", {startBattle: [{id: 'kelipat_nogah_beast', level: 60}]}] } },
            'mockery_clown': { type: 'npc', uu: '\uef36', visual: '🤡', emoji: '🤡', x: 6, y: 2, dialogue: { start: ["Mockery is the gatekeeper of numbness. Laugh it down, then act.", {startBattle: [{id: 'kelipat_nogah_beast', level: 61}]}] } },
            'dragon_east': { type: 'npc', uu: '\uef37', visual: '🐲', emoji: '🐲', x: 10, y: 2, dialogue: { start: ["A second dragon means the fantasy was never unique. Only truth is one.", {startBattle: [{id: 'kelipat_nogah_beast', level: 62}]}] } }
        }
    }
};
