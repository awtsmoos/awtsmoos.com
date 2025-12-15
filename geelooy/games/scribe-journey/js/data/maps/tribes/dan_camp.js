
// B"H
// js/data/maps/tribes/dan_camp.js

export const danCampMaps = {
    'camp_dan_entrance': {
        width: 20,
        baseLayerString: `
⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺
⛺🚪⬜🐍⬜⬜⬜🦌⬜⬜⬜🌳⬜⬜⬜🐍⬜🚪⛺
⛺⬜⛺⛺⛺⛺⛺⬜⛺⛺⛺⛺⛺⬜⛺⛺⛺⬜⛺
⛺⬜⛺🐍⛺⬜⬜⬜⛺🦌⛺⬜⬜⬜⛺🌳⛺⬜⛺
⛺⬜⛺⛺⛺⬜⬜⬜⛺⛺⛺⬜⬜⬜⛺⛺⛺⬜⛺
⛺⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⛺
⛺⬜⚖️⬜⬜⬜⬜⬜⬜🍞⬜⬜⬜⬜⬜⬜🏃⬜⛺
⛺⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⛺
⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺
        `,
        encounters: {
            '⬜': [
                { id: 'horned_viper', levelRange: [38, 42], chance: 0.4 },
                { id: 'swift_gazelle', levelRange: [35, 40], chance: 0.3 }
            ]
        },
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'tribes_encampment', targetX: 20, targetY: 4 },
            
            // Dan (Judgment/Snake)
            'prince_achiezer': { 
                type: 'npc', emoji: '⚖️', 
                dialogue: { 
                    start: ["Dan judges his people. We are the rearguard, collecting what is lost. But the snake bites the heel.", {startBattle: [{id: 'judge_viper', level: 48}]}],
                    battle_win: ["You have overcome the venom.", {giveItem: 'stone_leshem'}, {updateQuest: 'tribes_1_stones', objectiveId: 'collect_leshem'}, "end"]
                } 
            },

            // Asher (Olive Oil/Bread)
            'prince_pagiel': {
                type: 'npc', emoji: '🍞',
                dialogue: {
                    start: ["Asher's bread is rich. We provide oil for the Menorah. Do you have the Pure Oil?", {condition: {type: 'hasItem', itemId: 'pure_oil'}, success: ["You do. Take the stone.", {giveItem: 'stone_tarshish'}, {updateQuest: 'tribes_1_stones', objectiveId: 'collect_tarshish'}, "end"], fail: ["You lack the oil. Search the groves."]}]
                }
            },

            // Naftali (Speed/Deer)
            'prince_ahira': {
                type: 'npc', emoji: '🏃',
                dialogue: {
                    start: ["Naftali is a hind let loose. He delivers beautiful words. Catch me if you can!", {startBattle: [{id: 'running_stag', level: 46}]}],
                    battle_win: ["You are swift indeed.", {giveItem: 'stone_shvo'}, {updateQuest: 'tribes_1_stones', objectiveId: 'collect_shvo'}, "end"]
                }
            }
        }
    }
};
