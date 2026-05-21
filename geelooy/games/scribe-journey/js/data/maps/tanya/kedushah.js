
// B"H
// js/data/maps/tanya/kedushah.js

export const tanyaKedushahMaps = {
    'right_ventricle_1': {
        width: 15,
        baseLayerString: `
☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜✨⬜✨⬜✨⬜✨⬜✨⬜✨⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜✨⬜✨⬜✨⬜✨⬜✨⬜✨⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🚪☁️
☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️
        `,
        encounters: {
            '✨': [
                { id: 'spark_of_insight', levelRange: [40, 50], chance: 0.3 },
                { id: 'burning_love', levelRange: [45, 55], chance: 0.3 }
            ]
        },
        interactables: {
            'exit': { type: 'door', uu: '\uef51', visual: '🚪', emoji: '🚪', x: 1, y: 1, targetMap: 'tanya_entrance', targetX: 11, targetY: 4 },
            'to_deep_kedushah': { type: 'door', uu: '\uef52', visual: '🚪', emoji: '🚪', x: 13, y: 1, targetMap: 'right_ventricle_2', targetX: 1, targetY: 4 },
            'mochin_guide': { type: 'npc', uu: '\uef57', visual: '🧠', emoji: '🧠', x: 6, y: 4, dialogue: { start: ["This is the abode of the Godly Soul. Here, the mind rules the heart."] } },
            'lower_exit': { type: 'door', uu: '\uef53', visual: '🚪', emoji: '🚪', x: 1, y: 8, targetMap: 'tanya_entrance', targetX: 10, targetY: 6 },
            'lower_deep_kedushah': { type: 'door', uu: '\uef54', visual: '🚪', emoji: '🚪', x: 13, y: 8, targetMap: 'right_ventricle_2', targetX: 10, targetY: 8 },
            'scroll_west': { type: 'npc', uu: '\uef55', visual: '📜', emoji: '📜', x: 2, y: 4, dialogue: { start: ["The Godly soul descends not for itself, but to rule action."] } },
            'scroll_midwest': { type: 'npc', uu: '\uef56', visual: '📜', emoji: '📜', x: 4, y: 4, dialogue: { start: ["The mind is a city gate; what enters the heart must pass here."] } },
            'scroll_mideast': { type: 'npc', uu: '\uef58', visual: '📜', emoji: '📜', x: 8, y: 4, dialogue: { start: ["A thought repeated becomes a road. Choose the road upward."] } },
            'scroll_east': { type: 'npc', uu: '\uef59', visual: '📜', emoji: '📜', x: 10, y: 4, dialogue: { start: ["The Beinoni wins through garments: thought, speech, and deed."] } },
            'mochin_guide_east': { type: 'npc', uu: '\uef5a', visual: '🧠', emoji: '🧠', x: 12, y: 4, dialogue: { start: ["A second guide does not steal the first voice; both are named."] } }
        }
    },
    'right_ventricle_2': {
         width: 12,
         baseLayerString: `
☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜🔥⬜⬜🕯️⬜⬜🔥⬜⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️
         `,
         encounters: {
             '⬜': [
                 { id: 'silent_aleph', levelRange: [55, 65], chance: 0.3 }
             ]
         },
         interactables: {
             'exit': { type: 'door', uu: '\uef61', visual: '🚪', emoji: '🚪', x: 1, y: 8, targetMap: 'right_ventricle_1', targetX: 1, targetY: 4 },
             'meditation_spot': { type: 'npc', uu: '\uef63', visual: '🧘', emoji: '🧘', x: 5, y: 4, dialogue: { start: ["(A place of intense focus. The light of the soul shines here.)", {action: 'meditate'}] } },
             'right_exit': { type: 'door', uu: '\uef62', visual: '🚪', emoji: '🚪', x: 10, y: 8, targetMap: 'right_ventricle_1', targetX: 13, targetY: 8 },
             'fire_west': { type: 'npc', uu: '\uef65', visual: '🔥', emoji: '🔥', x: 2, y: 2, dialogue: { start: ["Love burns upward when the mind feeds it truth."] } },
             'candle_west': { type: 'npc', uu: '\uef66', visual: '🕯️', emoji: '🕯️', x: 5, y: 2, dialogue: { start: ["A small candle can govern a dark chamber."] } },
             'fire_east': { type: 'npc', uu: '\uef67', visual: '🔥', emoji: '🔥', x: 8, y: 2, dialogue: { start: ["Fire without bittul consumes; fire with bittul illuminates."] } },
             'fire_lower_west': { type: 'npc', uu: '\uef68', visual: '🔥', emoji: '🔥', x: 2, y: 6, dialogue: { start: ["Lower fire rises when action gives it a vessel."] } },
             'candle_lower': { type: 'npc', uu: '\uef69', visual: '🕯️', emoji: '🕯️', x: 5, y: 6, dialogue: { start: ["The candle of Hashem is the soul of man."] } },
             'fire_lower_east': { type: 'npc', uu: '\uef6a', visual: '🔥', emoji: '🔥', x: 8, y: 6, dialogue: { start: ["The heart burns cleanly when its map is exact."] } }
         }
    }
};
