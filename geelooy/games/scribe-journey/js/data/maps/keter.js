
// B"H
// js/data/maps/keter.js

export const keterMaps = {
    'keter_heights': {
        width: 15,
        baseLayerString: `
☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️
☁️⬜⬜⬜⬜⬜⬜👑⬜⬜⬜⬜⬜⬜☁️
☁️⬜✨⬜⬜⬜✨⬜✨⬜⬜⬜✨⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜📜⬜⬜⬜🤫⬜🤫⬜⬜⬜📜⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜✨⬜⬜⬜✨⬜✨⬜⬜⬜✨⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🚪☁️
☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️
        `,
        encounters: {
            '✨': [
                { id: 'infinite_light', levelRange: [50, 60], chance: 0.2 },
                { id: 'silent_aleph', levelRange: [55, 65], chance: 0.2 }
            ],
            '⬜': [
                 { id: 'primordial_torah', levelRange: [50, 60], chance: 0.1 }
            ]
        },
        interactables: {
            'to_binah': { type: 'door', emoji: '🚪', targetMap: 'binah_upper', targetX: 10, targetY: 7 },
            'will_guardian': { type: 'npc', emoji: '👑', dialogue: { start: ["This is the Will that precedes Thought. Are you ready to annul your ego?", {startBattle: [{id: 'crown_of_will', level: 70}]}] } }
        }
    }
};
