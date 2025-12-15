
// B"H
// js/data/maps/kotel.js

export const kotelMaps = {
    'kotel_plaza': {
        width: 20,
        baseLayerString: `
🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️
🏙️🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🏙️
🏙️🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🧱⬜🧍‍♂️⬜🧍‍♂️⬜🧍‍♂️⬜⬜⬜⬜⬜🧍‍♀️⬜🧍‍♀️⬜🧍‍♀️⬜🧱🏙️
🏙️🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🧱🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🧱🏙️
🏙️🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🧱⬜🐦⬜⬜⬜⬜⬜🕊️⬜⬜⬜⬜⬜🐦⬜⬜⬜🧱🏙️
🏙️🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🧱🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️
        `,
        // The Gold wall (🟨) represents the Kotel stones.
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 20, targetY: 20 },
            'kotel_wall_1': { type: 'npc', emoji: '🟨', x: 5, y: 5, dialogue: { start: ["(You touch the ancient stones. You feel the Shechinah never left).", {action: 'meditate_ohel'}] } },
            'kotel_wall_2': { type: 'npc', emoji: '🟨', x: 10, y: 5, dialogue: { start: ["(Thousands of years of tears and hope. You place a note.)"] } },
            'beggar': { type: 'npc', emoji: '🧍‍♂️', x: 3, y: 3, dialogue: { start: ["Tzedakah saves from death.", {shop: false, choices: [{text: "Give 18p", action: "give_tzedakah_18"}, {text: "Bless him", next: "bless"}]}], give_tzedakah_18: ["Thank you! You have done a Mitzvah.", {action: 'gemach_deposit', amount: -18}] } }
        }
    }
};
