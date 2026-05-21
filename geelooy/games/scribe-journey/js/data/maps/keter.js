
// B"H
// js/data/maps/keter.js

export const keterMaps = {
    'keter_heights': {
        width: 15,
        baseLayerString: `
☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜✨⬜⬜⬜✨⬜✨⬜⬜⬜✨⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜✨⬜⬜⬜✨⬜✨⬜⬜⬜✨⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
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
            'to_binah': { type: 'door', uu: '\uea01', visual: '🚪', emoji: '🚪', x: 1, y: 8, targetMap: 'binah_upper', targetX: 10, targetY: 7 },
            'will_guardian': { type: 'npc', uu: '\uea03', visual: '👑', emoji: '👑', x: 7, y: 1, dialogue: { start: ["This is the Will that precedes Thought. Are you ready to annul your ego?", {startBattle: [{id: 'crown_of_will', level: 70}]}] } },
            'to_dirah_gate': { type: 'door', uu: '\uea02', visual: '🚪', emoji: '🚪', x: 13, y: 8, targetMap: '770_main_hall', targetX: 7, targetY: 6 },
            'scroll_naaseh': { type: 'npc', uu: '\uea04', visual: '📜', emoji: '📜', x: 2, y: 4, dialogue: { start: ["נעשה: the deed comes first. The angels understand only after the body acts.", {setFlag: 'naaseh_scroll_read'}] } },
            'scroll_nishma': { type: 'npc', uu: '\uea05', visual: '📜', emoji: '📜', x: 12, y: 4, dialogue: { start: ["נשמע: understanding descends after commitment, giving form to the action.", {setFlag: 'nishma_scroll_read'}] } },
            'silent_left': { type: 'npc', uu: '\uea06', visual: '🤫', emoji: '🤫', x: 6, y: 4, dialogue: { start: ["The soul song is not heard by ordinary prophecy, yet it lifts worlds."] } },
            'silent_right': { type: 'npc', uu: '\uea07', visual: '🤫', emoji: '🤫', x: 8, y: 4, dialogue: { start: ["The highest answer is not louder. It is lower, embodied, and exact."] } }
        }
    }
};
