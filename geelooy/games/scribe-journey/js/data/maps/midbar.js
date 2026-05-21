
// B"H
// js/data/maps/midbar.js

export const midbarMaps = {
    'midbar_entrance': {
        width: 25,
        baseLayerString: `
🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️
🏜️⬜🌵⬜⬜⬜🌵⬜⬜⬜🌵⬜⬜⬜🌵⬜⬜⬜🌵⬜🏜️
🏜️⬜🟨🟨🟨🟨🟨⬜🟨🟨🟨🟨🟨⬜🟨🟨🟨⬜🏜️
🏜️⬜🟨⬜⬜⬜🟨⬜🟨⬜⬜⬜🟨⬜🟨⬜⬜⬜🏜️
🏜️⬜🌵⬜⬜🌵⬜🌵⬜⬜🌵⬜🌵⬜⬜🏜️
🏜️⬜🟨⬜⬜⬜🟨⬜🟨⬜⬜⬜🟨⬜🟨⬜⬜⬜🏜️
🏜️⬜🟨🟨🟨🟨🟨⬜🟨🟨🟨🟨🟨⬜🟨🟨🟨⬜🏜️
🏜️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🏜️
🏜️⬜🟨🟨🟨🟨⬜🟨🟨🟨🟨🟨⬜🟨🟨⬜🏜️
🏜️⬜🟨⬜⬜⬜🟨⬜🟨⬜⬜⬜🟨⬜🟨⬜⬜⬜🏜️
🏜️⬜🌵⬜⬜🌵⬜🌵⬜⬜🌵⬜🌵⬜⬜🏜️
🏜️⬜🟨⬜⬜⬜🟨⬜🟨⬜⬜⬜🟨⬜🟨⬜⬜⬜🏜️
🏜️⬜🟨🟨🟨🟨🟨⬜🟨🟨🟨🟨🟨⬜🟨🟨🟨⬜🏜️
🏜️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🏜️
🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️
        `,
        encounters: {
            '🟨': [
                { id: 'desert_scorpion', levelRange: [35, 45], chance: 0.4 },
                { id: 'fiery_serpent', levelRange: [38, 48], chance: 0.3 }
            ]
        },
        interactables: {
            'exit': { type: 'door', uu: '\uf801', visual: '🚪', emoji: '🚪', x: 1, y: 1, targetMap: 'malkuth_village', targetX: 20, targetY: 10 }, // Connects to village
            'to_deep_midbar': { type: 'door', uu: '\uf802', visual: '🚪', emoji: '🚪', x: 21, y: 1, targetMap: 'midbar_deep', targetX: 1, targetY: 5 },
            'wanderer_moshe': { 
                type: 'npc', uu: '\uf803', visual: '🧔', emoji: '🧔', x: 4, y: 4, 
                dialogue: { 
                    start: ["In the desert, there is nothing but the Word of G-d. That is why the Torah was given here.", "Beware the serpents of doubt."] 
                } 
            },
            'manna_spot_1': { type: 'npc', uu: '\uf804', visual: '❄️', emoji: '❄️', x: 3, y: 8, dialogue: { start: ["You found Manna! It tastes like... coriander seed?", {giveItem: 'manna_portion'}, "end"] } },
            'manna_spot_2': { type: 'npc', uu: '\uf805', visual: '❄️', emoji: '❄️', x: 15, y: 8, dialogue: { start: ["You found Manna! It tastes like oil cake?", {giveItem: 'manna_portion'}, "end"] } },
            'miriam_well': { type: 'npc', uu: '\uf806', visual: '⛲', emoji: '⛲', x: 10, y: 4, dialogue: { start: ["The well follows us. Drink and be refreshed.", {action: 'meditate'}] } },
            'scorpion_marker': { type: 'npc', uu: '\uf807', visual: '🦂', emoji: '🦂', x: 16, y: 4, dialogue: { start: ["A scorpion marks the road where doubt stings.", {startBattle: [{id: 'desert_scorpion', level: 42}]}] } },
            'serpent_west': { type: 'npc', uu: '\uf808', visual: '🐍', emoji: '🐍', x: 4, y: 10, dialogue: { start: ["A desert serpent asks whether the journey is worth the thirst.", {startBattle: [{id: 'fiery_serpent', level: 45}]}] } },
            'camp_marker': { type: 'npc', uu: '\uf809', visual: '⛺', emoji: '⛺', x: 10, y: 10, dialogue: { start: ["A temporary tent teaches permanent trust."] } },
            'serpent_east': { type: 'npc', uu: '\uf80a', visual: '🐍', emoji: '🐍', x: 16, y: 10, dialogue: { start: ["The second serpent is named, so it cannot hide in the first.", {startBattle: [{id: 'fiery_serpent', level: 46}]}] } },
            'lower_left_exit': { type: 'door', uu: '\uf80b', visual: '🚪', emoji: '🚪', x: 1, y: 13, targetMap: 'malkuth_village', targetX: 20, targetY: 10 },
            'lower_right_exit': { type: 'door', uu: '\uf80c', visual: '🚪', emoji: '🚪', x: 17, y: 13, targetMap: 'midbar_deep', targetX: 17, targetY: 7 }
        }
    },
    'midbar_deep': {
        width: 20,
        baseLayerString: `
🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️
🏜️⬜🪨⬜⬜⬜🪨⬜⬜⬜🪨⬜⬜⬜🪨⬜🏜️
🏜️⬜🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨⬜🏜️
🏜️⬜🟨🟨⬜⬜⬜🟨⬜⬜⬜🟨🟨⬜🏜️
🏜️⬜🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨⬜🏜️
🏜️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🏜️
🏜️⬜🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨⬜🏜️
🏜️🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🚪🏜️
🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️
        `,
        encounters: {
            '🟨': [{ id: 'fiery_serpent', levelRange: [45, 55], chance: 0.6 }]
        },
        interactables: {
            'prev': { type: 'door', uu: '\uf821', visual: '🚪', emoji: '🚪', x: 1, y: 1, targetMap: 'midbar_entrance', targetX: 18, targetY: 10 },
            'nechushtan': { type: 'npc', uu: '\uf822', visual: '🕎', emoji: '🕎', x: 8, y: 5, dialogue: { start: ["A Serpent of Brass on a pole. Look up and live.", {giveItem: 'staff_of_moshe'}, "You received the Staff of Leadership!", "end"] } },
            'upper_right_exit': { type: 'door', uu: '\uf823', visual: '🚪', emoji: '🚪', x: 17, y: 1, targetMap: 'midbar_entrance', targetX: 18, targetY: 10 },
            'serpent_deep_west': { type: 'npc', uu: '\uf824', visual: '🐍', emoji: '🐍', x: 3, y: 3, dialogue: { start: ["Look up, not down at the bite.", {startBattle: [{id: 'fiery_serpent', level: 50}]}] } },
            'serpent_deep_center': { type: 'npc', uu: '\uf825', visual: '🐍', emoji: '🐍', x: 8, y: 3, dialogue: { start: ["The middle serpent is the test of habit.", {startBattle: [{id: 'fiery_serpent', level: 51}]}] } },
            'serpent_deep_mideast': { type: 'npc', uu: '\uf826', visual: '🐍', emoji: '🐍', x: 10, y: 3, dialogue: { start: ["The cure begins when the poison is seen.", {startBattle: [{id: 'fiery_serpent', level: 52}]}] } },
            'serpent_deep_east': { type: 'npc', uu: '\uf827', visual: '🐍', emoji: '🐍', x: 15, y: 3, dialogue: { start: ["The east serpent guards the exit from illusion.", {startBattle: [{id: 'fiery_serpent', level: 53}]}] } },
            'lower_left_exit': { type: 'door', uu: '\uf828', visual: '🚪', emoji: '🚪', x: 1, y: 7, targetMap: 'midbar_entrance', targetX: 18, targetY: 10 },
            'lower_right_exit': { type: 'door', uu: '\uf829', visual: '🚪', emoji: '🚪', x: 17, y: 7, targetMap: 'tribes_encampment', targetX: 12, targetY: 9 }
        }
    }
};
