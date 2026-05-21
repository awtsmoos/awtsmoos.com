
// B"H
// js/data/maps/tribes/judah_camp.js

export const judahCampMaps = {
    'camp_judah_entrance': {
        width: 20,
        baseLayerString: `
⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺
⛺⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⛺
⛺⬜⛺⛺⛺⛺⛺⬜⛺⛺⛺⛺⛺⬜⛺⛺⛺⬜⛺
⛺⬜⛺⛺⬜⬜⬜⛺⛺⬜⬜⬜⛺⛺⬜⛺
⛺⬜⛺⛺⛺⬜⬜⬜⛺⛺⛺⬜⬜⬜⛺⛺⛺⬜⛺
⛺⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⛺
⛺⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⛺
⛺⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⛺
⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺
        `,
        encounters: {
            '⬜': [
                { id: 'lion_cub', levelRange: [30, 35], chance: 0.4 },
                { id: 'donkey_of_burden', levelRange: [32, 36], chance: 0.3 }
            ]
        },
        interactables: {
            'exit': { type: 'door', uu: '\uf201', visual: '🚪', emoji: '🚪', x: 1, y: 1, targetMap: 'tribes_encampment', targetX: 4, targetY: 4 },
            
            // Judah (Kingship)
            'prince_nachshon': { 
                type: 'npc', uu: '\uf203', visual: '🛡️', emoji: '🛡️', x: 2, y: 6, 
                dialogue: { 
                    start: ["I am Nachshon of Judah. We jump into the sea first. Do you have the courage to lead?", {startBattle: [{id: 'royal_lion', level: 45}]}],
                    battle_win: ["You have the heart of a king.", {giveItem: 'stone_nofech'}, {updateQuest: 'tribes_1_stones', objectiveId: 'collect_nofech'}, "end"]
                } 
            },

            // Yissachar (Torah)
            'prince_netanel': {
                type: 'npc', uu: '\uf204', visual: '📜', emoji: '📜', x: 9, y: 6,
                dialogue: {
                    start: ["We bear the yoke of Torah. It is heavy, like the donkey bears its burden. Can you persist?", {startBattle: [{id: 'burden_donkey', level: 42}]}],
                    battle_win: ["You have the endurance of a scholar.", {giveItem: 'stone_sapir'}, {updateQuest: 'tribes_1_stones', objectiveId: 'collect_sapir'}, "end"]
                }
            },

            // Zevulun (Commerce)
            'prince_eliav': {
                type: 'npc', uu: '\uf20c', visual: '💎', emoji: '💎', x: 16, y: 6,
                dialogue: {
                    start: ["We sail the seas to support the scholars. Our wealth is for heaven. Prove your charity.", {choices: [{text: "Give 500 Perutah", action: "give_charity"}, {text: "Refuse", next: "refuse"}]}],
                    give_charity: ["A generous heart receives more than it gives.", {giveItem: 'stone_yahalom'}, {updateQuest: 'tribes_1_stones', objectiveId: 'collect_yahalom'}, "end"],
                    refuse: ["Then you cannot hold the Diamond of Zevulun."]
                }
            },
            'east_exit': { type: 'door', uu: '\uf202', visual: '🚪', emoji: '🚪', x: 17, y: 1, targetMap: 'tribes_encampment', targetX: 4, targetY: 4 },
            'lion_standard_west': { type: 'npc', uu: '\uf205', visual: '🦁', emoji: '🦁', x: 3, y: 1, dialogue: { start: ["The lion standard teaches leadership through first action."] } },
            'lion_standard_midwest': { type: 'npc', uu: '\uf206', visual: '🦁', emoji: '🦁', x: 7, y: 1, dialogue: { start: ["Judah walks first so others can discover the road."] } },
            'lion_standard_mideast': { type: 'npc', uu: '\uf207', visual: '🦁', emoji: '🦁', x: 11, y: 1, dialogue: { start: ["A king does not guess his people; he names each banner."] } },
            'lion_standard_east': { type: 'npc', uu: '\uf208', visual: '🦁', emoji: '🦁', x: 15, y: 1, dialogue: { start: ["The fourth lion guards the exit so courage does not become chaos."] } },
            'lion_inner': { type: 'npc', uu: '\uf209', visual: '🦁', emoji: '🦁', x: 3, y: 3, dialogue: { start: ["Inner kingship is quieter than the banner."] } },
            'torah_tent': { type: 'npc', uu: '\uf20a', visual: '📚', emoji: '📚', x: 9, y: 3, dialogue: { start: ["Yissachar's tent: endurance in study feeds the whole camp."] } },
            'commerce_anchor': { type: 'npc', uu: '\uf20b', visual: '⚓', emoji: '⚓', x: 15, y: 3, dialogue: { start: ["Zevulun's anchor: commerce becomes holy when it carries Torah."] } }
        }
    }
};
