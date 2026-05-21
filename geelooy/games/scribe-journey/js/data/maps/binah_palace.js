
// B"H
// js/data/maps/binah_palace.js

export const binahMaps = {
    'binah_entrance': {
        width: 18,
        baseLayerString: `
🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️
🌫️⬜💎⬜⬜⬜💎⬜⬜⬜💎⬜⬜⬜💎⬜🌫️
🌫️⬜🧊🧊🧊🧊🧊⬜🧊🧊🧊🧊🧊⬜🧊🧊🧊⬜🌫️
🌫️⬜🧊⬜⬜⬜🧊⬜🧊⬜⬜⬜🧊⬜🧊⬜⬜⬜🌫️
🌫️⬜💎⬜⬜💎⬜💎⬜⬜💎⬜💎⬜⬜🌫️
🌫️⬜🧊⬜⬜⬜🧊⬜🧊⬜⬜⬜🧊⬜🧊⬜⬜⬜🌫️
🌫️⬜🧊🧊🧊🧊🧊⬜🧊🧊🧊🧊🧊⬜🧊🧊🧊⬜🌫️
🌫️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌫️
🌫️⬜🧊🧊🧊🧊🧊⬜🧊🧊🧊🧊🧊⬜🧊🧊🧊⬜🌫️
🌫️⬜🧊⬜⬜⬜🧊⬜🧊⬜⬜⬜🧊⬜🧊⬜⬜⬜🌫️
🌫️⬜💎⬜⬜💎⬜💎⬜⬜💎⬜💎⬜⬜🌫️
🌫️⬜🧊⬜⬜⬜🧊⬜🧊⬜⬜⬜🧊⬜🧊⬜⬜⬜🌫️
🌫️⬜🧊🧊🧊🧊🧊⬜🧊🧊🧊🧊🧊⬜🧊🧊🧊⬜🌫️
🌫️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌫️
🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️
        `,
        encounters: {
            '🧊': [
                { id: 'structural_limit', levelRange: [30, 40], chance: 0.4 },
                { id: 'deductive_reasoning', levelRange: [35, 45], chance: 0.3 }
            ]
        },
        interactables: {
            'to_hod': { type: 'door', uu: '\ue801', visual: '🚪', emoji: '🚪', x: 1, y: 1, targetMap: 'hod_library', targetX: 7, targetY: 2 },
            'to_upper_binah': { type: 'door', uu: '\ue802', visual: '🚪', emoji: '🚪', x: 17, y: 1, targetMap: 'binah_upper', targetX: 1, targetY: 5 },
            'mother_npc': { type: 'npc', uu: '\ue805', visual: '🤱', emoji: '🤱', x: 4, y: 4, dialogue: { start: ["I give form to the flash of wisdom. Without me, there is only potential, no existence."] } },
            'mind_guardian': { type: 'npc', uu: '\ue807', visual: '🧠', emoji: '🧠', x: 10, y: 4, dialogue: { start: ["Deduce the path. Not all doors lead where they seem.", {startBattle: [{id: 'river_of_understanding', level: 40}]}] } },
            'to_tiferet': { type: 'door', uu: '\ue803', visual: '🚪', emoji: '🚪', x: 1, y: 13, targetMap: 'tiferet_garden', targetX: 14, targetY: 4 },
            'to_gate_one': { type: 'door', uu: '\ue804', visual: '🚪', emoji: '🚪', x: 17, y: 13, targetMap: 'binah_gate_1', targetX: 1, targetY: 4 },
            'mother_left_upper': { type: 'npc', uu: '\ue806', visual: '🤱', emoji: '🤱', x: 16, y: 4, dialogue: { start: ["Understanding gives the flash a vessel. A vessel must be exact, or the light spills."] } },
            'mother_lower_west': { type: 'npc', uu: '\ue808', visual: '🤱', emoji: '🤱', x: 4, y: 10, dialogue: { start: ["Every detail has a mother-root. Even a door must know its own name."] } },
            'mother_lower_center': { type: 'npc', uu: '\ue809', visual: '🤱', emoji: '🤱', x: 10, y: 10, dialogue: { start: ["Do not generate the world when it must be taught. Hand-author the vessel."] } },
            'mind_guardian_lower': { type: 'npc', uu: '\ue80a', visual: '🧠', emoji: '🧠', x: 16, y: 10, dialogue: { start: ["A map that guesses is a mind without Binah. A map that names is a mind with form."] } },
        }
    },
    'binah_upper': {
         width: 12,
         baseLayerString: `
⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜
⬜🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️⬜
⬜🌫️📉⬜⬜🧱⬜⬜📉⬜🌫️⬜
⬜🌫️⬜⬜⬜⬜⬜⬜⬜⬜🌫️⬜
⬜🌫️⬜⬜⬜⬜⬜🌫️⬜
⬜🌫️⬜⬜⬜⬜⬜⬜⬜⬜🌫️⬜
⬜🌫️📉⬜⬜🧱⬜⬜📉⬜🌫️⬜
⬜🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️⬜
⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜
         `,
         encounters: {
             '⬜': [
                 { id: 'mother_of_form', levelRange: [40, 50], chance: 0.5 },
                 { id: 'river_of_understanding', levelRange: [38, 48], chance: 0.3 }
             ]
         },
         interactables: {
             'exit': { type: 'door', uu: '\ue811', visual: '🚪', emoji: '🚪', x: 10, y: 8, targetMap: 'binah_entrance', targetX: 16, targetY: 13 },
             'oracle': { type: 'npc', uu: '\ue813', visual: '🔮', emoji: '🔮', x: 6, y: 4, dialogue: { start: ["You seek the Crown (Keter)? You must first cross the abyss where the Shells (Qliphoth) wait."] } },
             'mother_oracle_west': { type: 'npc', uu: '\ue812', visual: '🤱', emoji: '🤱', x: 3, y: 4, dialogue: { start: ["The upper chamber receives what the lower chamber formed."] } },
             'mother_oracle_east': { type: 'npc', uu: '\ue814', visual: '🤱', emoji: '🤱', x: 9, y: 4, dialogue: { start: ["Return with understanding, then the Crown will not blind you."] } }
         }
    }
};
