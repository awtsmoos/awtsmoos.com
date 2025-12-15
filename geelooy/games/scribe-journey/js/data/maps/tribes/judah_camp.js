
// B"H
// js/data/maps/tribes/judah_camp.js

export const judahCampMaps = {
    'camp_judah_entrance': {
        width: 20,
        baseLayerString: `
⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺
⛺🚪⬜🦁⬜⬜⬜🦁⬜⬜⬜🦁⬜⬜⬜🦁⬜🚪⛺
⛺⬜⛺⛺⛺⛺⛺⬜⛺⛺⛺⛺⛺⬜⛺⛺⛺⬜⛺
⛺⬜⛺🦁⛺⬜⬜⬜⛺📚⛺⬜⬜⬜⛺⚓⛺⬜⛺
⛺⬜⛺⛺⛺⬜⬜⬜⛺⛺⛺⬜⬜⬜⛺⛺⛺⬜⛺
⛺⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⛺
⛺⬜🛡️⬜⬜⬜⬜⬜⬜📜⬜⬜⬜⬜⬜⬜💎⬜⛺
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
            'exit': { type: 'door', emoji: '🚪', targetMap: 'tribes_encampment', targetX: 4, targetY: 4 },
            
            // Judah (Kingship)
            'prince_nachshon': { 
                type: 'npc', emoji: '🛡️', 
                dialogue: { 
                    start: ["I am Nachshon of Judah. We jump into the sea first. Do you have the courage to lead?", {startBattle: [{id: 'royal_lion', level: 45}]}],
                    battle_win: ["You have the heart of a king.", {giveItem: 'stone_nofech'}, {updateQuest: 'tribes_1_stones', objectiveId: 'collect_nofech'}, "end"]
                } 
            },

            // Yissachar (Torah)
            'prince_netanel': {
                type: 'npc', emoji: '📜',
                dialogue: {
                    start: ["We bear the yoke of Torah. It is heavy, like the donkey bears its burden. Can you persist?", {startBattle: [{id: 'burden_donkey', level: 42}]}],
                    battle_win: ["You have the endurance of a scholar.", {giveItem: 'stone_sapir'}, {updateQuest: 'tribes_1_stones', objectiveId: 'collect_sapir'}, "end"]
                }
            },

            // Zevulun (Commerce)
            'prince_eliav': {
                type: 'npc', emoji: '💎',
                dialogue: {
                    start: ["We sail the seas to support the scholars. Our wealth is for heaven. Prove your charity.", {choices: [{text: "Give 500 Perutah", action: "give_charity"}, {text: "Refuse", next: "refuse"}]}],
                    give_charity: ["A generous heart receives more than it gives.", {giveItem: 'stone_yahalom'}, {updateQuest: 'tribes_1_stones', objectiveId: 'collect_yahalom'}, "end"],
                    refuse: ["Then you cannot hold the Diamond of Zevulun."]
                }
            }
        }
    }
};
