
// B"H
// js/data/maps/midbar.js

export const midbarMaps = {
    'midbar_entrance': {
        width: 25,
        baseLayerString: `
🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️
🏜️🚪⬜🌵⬜⬜⬜🌵⬜⬜⬜🌵⬜⬜⬜🌵⬜⬜⬜🌵⬜🚪🏜️
🏜️⬜🟨🟨🟨🟨🟨⬜🟨🟨🟨🟨🟨⬜🟨🟨🟨⬜🏜️
🏜️⬜🟨⬜⬜⬜🟨⬜🟨⬜⬜⬜🟨⬜🟨⬜⬜⬜🏜️
🏜️⬜🌵⬜🧔⬜🌵⬜🌵⬜⛲⬜🌵⬜🌵⬜🦂⬜🏜️
🏜️⬜🟨⬜⬜⬜🟨⬜🟨⬜⬜⬜🟨⬜🟨⬜⬜⬜🏜️
🏜️⬜🟨🟨🟨🟨🟨⬜🟨🟨🟨🟨🟨⬜🟨🟨🟨⬜🏜️
🏜️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🏜️
🏜️⬜🟨❄️🟨🟨🟨⬜🟨🟨🟨🟨🟨⬜🟨❄️🟨⬜🏜️
🏜️⬜🟨⬜⬜⬜🟨⬜🟨⬜⬜⬜🟨⬜🟨⬜⬜⬜🏜️
🏜️⬜🌵⬜🐍⬜🌵⬜🌵⬜⛺⬜🌵⬜🌵⬜🐍⬜🏜️
🏜️⬜🟨⬜⬜⬜🟨⬜🟨⬜⬜⬜🟨⬜🟨⬜⬜⬜🏜️
🏜️⬜🟨🟨🟨🟨🟨⬜🟨🟨🟨🟨🟨⬜🟨🟨🟨⬜🏜️
🏜️🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🚪🏜️
🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️
        `,
        encounters: {
            '🟨': [
                { id: 'desert_scorpion', levelRange: [35, 45], chance: 0.4 },
                { id: 'fiery_serpent', levelRange: [38, 48], chance: 0.3 }
            ]
        },
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 20, targetY: 10 }, // Connects to village
            'to_deep_midbar': { type: 'door', emoji: '🚪', targetMap: 'midbar_deep', targetX: 1, targetY: 5 },
            'wanderer_moshe': { 
                type: 'npc', emoji: '🧔', 
                dialogue: { 
                    start: ["In the desert, there is nothing but the Word of G-d. That is why the Torah was given here.", "Beware the serpents of doubt."] 
                } 
            },
            'manna_spot_1': { type: 'npc', emoji: '❄️', dialogue: { start: ["You found Manna! It tastes like... coriander seed?", {giveItem: 'manna_portion'}, "end"] } },
            'manna_spot_2': { type: 'npc', emoji: '❄️', dialogue: { start: ["You found Manna! It tastes like oil cake?", {giveItem: 'manna_portion'}, "end"] } },
            'miriam_well': { type: 'npc', emoji: '⛲', dialogue: { start: ["The well follows us. Drink and be refreshed.", {action: 'meditate'}] } }
        }
    },
    'midbar_deep': {
        width: 20,
        baseLayerString: `
🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️
🏜️🚪⬜🪨⬜⬜⬜🪨⬜⬜⬜🪨⬜⬜⬜🪨⬜🚪🏜️
🏜️⬜🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨⬜🏜️
🏜️⬜🟨🐍🟨⬜⬜⬜🐍🟨🐍⬜⬜⬜🟨🐍🟨⬜🏜️
🏜️⬜🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨⬜🏜️
🏜️⬜⬜⬜⬜⬜⬜⬜🕎⬜⬜⬜⬜⬜⬜⬜⬜🏜️
🏜️⬜🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨⬜🏜️
🏜️🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🚪🏜️
🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️
        `,
        encounters: {
            '🟨': [{ id: 'fiery_serpent', levelRange: [45, 55], chance: 0.6 }]
        },
        interactables: {
            'prev': { type: 'door', emoji: '🚪', targetMap: 'midbar_entrance', targetX: 18, targetY: 10 },
            'nechushtan': { type: 'npc', emoji: '🕎', dialogue: { start: ["A Serpent of Brass on a pole. Look up and live.", {giveItem: 'staff_of_moshe'}, "You received the Staff of Leadership!", "end"] } }
        }
    }
};
