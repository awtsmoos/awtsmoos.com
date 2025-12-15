
// B"H
// js/data/maps/tanya/kedushah.js

export const tanyaKedushahMaps = {
    'right_ventricle_1': {
        width: 15,
        baseLayerString: `
☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️
☁️🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🚪☁️
☁️⬜✨⬜✨⬜✨⬜✨⬜✨⬜✨⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜📜⬜📜⬜🧠⬜📜⬜📜⬜🧠⬜☁️
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
            'exit': { type: 'door', emoji: '🚪', targetMap: 'tanya_entrance', targetX: 11, targetY: 4 },
            'to_deep_kedushah': { type: 'door', emoji: '🚪', targetMap: 'right_ventricle_2', targetX: 1, targetY: 4 },
            'mochin_guide': { type: 'npc', emoji: '🧠', dialogue: { start: ["This is the abode of the Godly Soul. Here, the mind rules the heart."] } }
        }
    },
    'right_ventricle_2': {
         width: 12,
         baseLayerString: `
☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜🔥⬜⬜🕯️⬜⬜🔥⬜⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜⬜⬜⬜🧘⬜⬜⬜⬜⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜🔥⬜⬜🕯️⬜⬜🔥⬜⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️🚪⬜⬜⬜⬜⬜⬜⬜⬜🚪☁️
☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️
         `,
         encounters: {
             '⬜': [
                 { id: 'silent_aleph', levelRange: [55, 65], chance: 0.3 }
             ]
         },
         interactables: {
             'exit': { type: 'door', emoji: '🚪', targetMap: 'right_ventricle_1', targetX: 1, targetY: 4 },
             'meditation_spot': { type: 'npc', emoji: '🧘', dialogue: { start: ["(A place of intense focus. The light of the soul shines here.)", {action: 'meditate'}] } }
         }
    }
};
