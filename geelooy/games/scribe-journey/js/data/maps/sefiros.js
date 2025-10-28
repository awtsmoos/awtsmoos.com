// B"H
// js/data/maps/sefirot.js

export const sefirotMaps = {
    'yesod_shore': {
        width: 10,
        baseLayerString: `
🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊
🌊💧⬜⬜💎⬜⬜💧🌊
🌊⬜⬜👥⬜⬜⬜⬜🌊
🌊💧⬜⬜💎⬜⬜💧🌊
🚪⬜⬜⬜⬜⬜⬜⬜🚪
🌊💧⬜⬜💎⬜⬜💧🌊
🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊
        `,
        interactables: {
            '0,4': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 11, targetY: 5 },
            '8,4': { type: 'door', emoji: '🚪', targetMap: 'gevurah_volcano', targetX: 1, targetY: 4 },
            '3,2': { type: 'npc', emoji: '👥', id: 'yesod_guardian', dialogue: { start: ["To find what is real, you must debate your own reflection.", {startBattle: [{id: 'doppelganger', level: 8}]}], battle_win: ["You have proven you are not an illusion. The fragment is yours.", {giveItem: 'sefer_fragment_aleph'}, {updateQuest: "main_quest_1", objectiveId: "find_fragment"}, "end"] } }
        }
    },
    'gevurah_volcano': {
        width: 9,
        baseLayerString: `
🌋🌋🌋🌋🌋🌋🌋🌋🌋
🌋⬜⬜🔥⬜⬜🔥⬜🌋
🌋⬜🪨🪨🪨🪨🪨⬜🌋
🌋⬜🪨⚖️🪨⚖️🪨⬜🌋
🚪⬜🪨🪨🪨🪨🪨⬜🚪
🌋⬜⬜🔥⬜⬜🔥⬜🌋
🌋🌋🌋🌋🌋🌋🌋🌋🌋
        `,
        interactables: {
            '0,4': {type: 'door', emoji: '🚪', targetMap: 'yesod_shore', targetX: 7, targetY: 4},
            '8,4': {type: 'door', emoji: '🚪', targetMap: 'chesed_springs', targetX: 1, targetY: 3, flagRequired: 'gevurah_trial_complete'},
            '3,3': {type: 'npc', emoji: '⚖️', id: 'gevurah_axiom_1', dialogue: {start: ["This is the path of Gevurah - Judgment. To pass, you must demonstrate your understanding of its strict principles.", {startBattle: [{id: 'axiom_of_judgment', level: 15}], context: {flagOnWin: 'axiom_1_defeated'}}, "end"]}},
            '5,3': {type: 'npc', emoji: '⚖️', id: 'gevurah_axiom_2', dialogue: {start: ["Discipline is the vessel for kindness. Show me you have the strength to contain it.", {startBattle: [{id: 'axiom_of_judgment', level: 15}], context: {flagOnWin: 'axiom_2_defeated'}}, "end"]}},
        }
    },
    'chesed_springs': {
        width: 9,
        baseLayerString: `
💧💧💧💧💧💧💧💧💧
💧⬜⬜⬜🌊⬜⬜⬜💧
💧⬜⬜🌊🌊🌊⬜⬜💧
🚪⬜🌊🌊💧🌊🌊⬜🚪
💧⬜⬜🌊🌊🌊⬜⬜💧
💧⬜⬜⬜🌊⬜⬜⬜💧
💧💧💧💧💧💧💧💧💧
        `,
        interactables: {
            '0,3': {type: 'door', emoji: '🚪', targetMap: 'gevurah_volcano', targetX: 7, targetY: 4},
            '8,3': {type: 'door', emoji: '🚪', targetMap: 'tiferet_garden', targetX: 1, targetY: 4},
            '4,3': {type: 'npc', emoji: '💧', id: 'chesed_baal_shem', dialogue: {start: ["Do not be discouraged by severity (Gevurah), little scribe. Every judgment is ultimately an expression of a deeper love (Chesed). Find the balance, and you will find beauty (Tiferet)."]}}
        }
    },
    'tiferet_garden': {
        width: 15,
        baseLayerString: `
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
🌳⬜⬜🌺🌼⬜⬜⬜⬜⬜⬜🌹🌸⬜⬜🌳
🌳⬜🌺⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌸⬜🌳
🌳🌼⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌳
🚪⬜⬜⬜⬜⬜⬜👑⬜⬜⬜⬜⬜⬜⬜🚪
🌳🌼⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳⬜🌺⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌸⬜🌳
🌳⬜⬜🌺🌼⬜⬜⬜⬜⬜⬜🌹🌸⬜⬜🌳
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
        `,
        interactables: {
             '0,4': {type: 'door', emoji: '🚪', targetMap: 'chesed_springs', targetX: 7, targetY: 3},
        }
    }
};