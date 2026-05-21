
// B"H
// js/data/maps/tribes/dan_camp.js

export const danCampMaps = {
    'camp_dan_entrance': {
        width: 20,
        baseLayerString: `
⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺
⛺⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⛺
⛺⬜⛺⛺⛺⛺⛺⬜⛺⛺⛺⛺⛺⬜⛺⛺⛺⬜⛺
⛺⬜⛺⛺⬜⬜⬜⛺⛺⬜⬜⬜⛺⛺⬜⛺
⛺⬜⛺⛺⛺⬜⬜⬜⛺⛺⛺⬜⬜⬜⛺⛺⛺⬜⛺
⛺⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⛺
⛺⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⛺
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
            'exit': { type: 'door', uu: '\uf301', visual: '🚪', emoji: '🚪', x: 1, y: 1, targetMap: 'tribes_encampment', targetX: 20, targetY: 4 },
            
            // Dan (Judgment/Snake)
            'prince_achiezer': { 
                type: 'npc', uu: '\uf303', visual: '⚖️', emoji: '⚖️', x: 2, y: 6, 
                dialogue: { 
                    start: ["Dan judges his people. We are the rearguard, collecting what is lost. But the snake bites the heel.", {startBattle: [{id: 'judge_viper', level: 48}]}],
                    battle_win: ["You have overcome the venom.", {giveItem: 'stone_leshem'}, {updateQuest: 'tribes_1_stones', objectiveId: 'collect_leshem'}, "end"]
                } 
            },

            // Asher (Olive Oil/Bread)
            'prince_pagiel': {
                type: 'npc', uu: '\uf304', visual: '🍞', emoji: '🍞', x: 9, y: 6,
                dialogue: {
                    start: ["Asher's bread is rich. We provide oil for the Menorah. Do you have the Pure Oil?", {condition: {type: 'hasItem', itemId: 'pure_oil'}, success: ["You do. Take the stone.", {giveItem: 'stone_tarshish'}, {updateQuest: 'tribes_1_stones', objectiveId: 'collect_tarshish'}, "end"], fail: ["You lack the oil. Search the groves."]}]
                }
            },

            // Naftali (Speed/Deer)
            'prince_ahira': {
                type: 'npc', uu: '\uf30c', visual: '🏃', emoji: '🏃', x: 16, y: 6,
                dialogue: {
                    start: ["Naftali is a hind let loose. He delivers beautiful words. Catch me if you can!", {startBattle: [{id: 'running_stag', level: 46}]}],
                    battle_win: ["You are swift indeed.", {giveItem: 'stone_shvo'}, {updateQuest: 'tribes_1_stones', objectiveId: 'collect_shvo'}, "end"]
                }
            },
            'east_exit': { type: 'door', uu: '\uf302', visual: '🚪', emoji: '🚪', x: 17, y: 1, targetMap: 'tribes_encampment', targetX: 20, targetY: 4 },
            'snake_standard_west': { type: 'npc', uu: '\uf305', visual: '🐍', emoji: '🐍', x: 3, y: 1, dialogue: { start: ["Dan's snake teaches careful judgment at the heel."] } },
            'deer_standard': { type: 'npc', uu: '\uf306', visual: '🦌', emoji: '🦌', x: 7, y: 1, dialogue: { start: ["Naftali's speed carries good words to distant roads."] } },
            'asher_tree': { type: 'npc', uu: '\uf307', visual: '🌳', emoji: '🌳', x: 11, y: 1, dialogue: { start: ["Asher's oil begins in rooted blessing."] } },
            'snake_standard_east': { type: 'npc', uu: '\uf308', visual: '🐍', emoji: '🐍', x: 15, y: 1, dialogue: { start: ["The second snake does not steal the first; each bite is named."] } },
            'inner_snake': { type: 'npc', uu: '\uf309', visual: '🐍', emoji: '🐍', x: 3, y: 3, dialogue: { start: ["Inner judgment guards the camp's rear."] } },
            'inner_deer': { type: 'npc', uu: '\uf30a', visual: '🦌', emoji: '🦌', x: 9, y: 3, dialogue: { start: ["Speed must serve mission, not escape."] } },
            'inner_tree': { type: 'npc', uu: '\uf30b', visual: '🌳', emoji: '🌳', x: 15, y: 3, dialogue: { start: ["Oil-rich roots feed the Menorah."] } }
        }
    }
};
