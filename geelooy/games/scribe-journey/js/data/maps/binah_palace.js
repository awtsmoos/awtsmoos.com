
// B"H
// js/data/maps/binah_palace.js

export const binahMaps = {
    'binah_entrance': {
        width: 18,
        baseLayerString: `
🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️
🌫️🚪⬜💎⬜⬜⬜💎⬜⬜⬜💎⬜⬜⬜💎⬜🚪🌫️
🌫️⬜🧊🧊🧊🧊🧊⬜🧊🧊🧊🧊🧊⬜🧊🧊🧊⬜🌫️
🌫️⬜🧊⬜⬜⬜🧊⬜🧊⬜⬜⬜🧊⬜🧊⬜⬜⬜🌫️
🌫️⬜💎⬜🤱⬜💎⬜💎⬜🧠⬜💎⬜💎⬜🤱⬜🌫️
🌫️⬜🧊⬜⬜⬜🧊⬜🧊⬜⬜⬜🧊⬜🧊⬜⬜⬜🌫️
🌫️⬜🧊🧊🧊🧊🧊⬜🧊🧊🧊🧊🧊⬜🧊🧊🧊⬜🌫️
🌫️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌫️
🌫️⬜🧊🧊🧊🧊🧊⬜🧊🧊🧊🧊🧊⬜🧊🧊🧊⬜🌫️
🌫️⬜🧊⬜⬜⬜🧊⬜🧊⬜⬜⬜🧊⬜🧊⬜⬜⬜🌫️
🌫️⬜💎⬜🤱⬜💎⬜💎⬜🤱⬜💎⬜💎⬜🧠⬜🌫️
🌫️⬜🧊⬜⬜⬜🧊⬜🧊⬜⬜⬜🧊⬜🧊⬜⬜⬜🌫️
🌫️⬜🧊🧊🧊🧊🧊⬜🧊🧊🧊🧊🧊⬜🧊🧊🧊⬜🌫️
🌫️🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🚪🌫️
🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️
        `,
        encounters: {
            '🧊': [
                { id: 'structural_limit', levelRange: [30, 40], chance: 0.4 },
                { id: 'deductive_reasoning', levelRange: [35, 45], chance: 0.3 }
            ]
        },
        interactables: {
            'to_hod': { type: 'door', emoji: '🚪', targetMap: 'hod_library', targetX: 7, targetY: 2 },
            'to_upper_binah': { type: 'door', emoji: '🚪', targetMap: 'binah_upper', targetX: 1, targetY: 5 },
            'mother_npc': { type: 'npc', emoji: '🤱', dialogue: { start: ["I give form to the flash of wisdom. Without me, there is only potential, no existence."] } },
            'mind_guardian': { type: 'npc', emoji: '🧠', dialogue: { start: ["Deduce the path. Not all doors lead where they seem.", {startBattle: [{id: 'river_of_understanding', level: 40}]}] } },
        }
    },
    'binah_upper': {
         width: 12,
         baseLayerString: `
⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜
⬜🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️⬜
⬜🌫️📉⬜⬜🧱⬜⬜📉⬜🌫️⬜
⬜🌫️⬜⬜⬜⬜⬜⬜⬜⬜🌫️⬜
⬜🌫️⬜🤱⬜⬜🔮⬜⬜🤱🌫️⬜
⬜🌫️⬜⬜⬜⬜⬜⬜⬜⬜🌫️⬜
⬜🌫️📉⬜⬜🧱⬜⬜📉⬜🌫️⬜
⬜🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️⬜
⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🚪⬜
         `,
         encounters: {
             '⬜': [
                 { id: 'mother_of_form', levelRange: [40, 50], chance: 0.5 },
                 { id: 'river_of_understanding', levelRange: [38, 48], chance: 0.3 }
             ]
         },
         interactables: {
             'exit': { type: 'door', emoji: '🚪', targetMap: 'binah_entrance', targetX: 16, targetY: 13 },
             'oracle': { type: 'npc', emoji: '🔮', dialogue: { start: ["You seek the Crown (Keter)? You must first cross the abyss where the Shells (Qliphoth) wait."] } }
         }
    }
};
