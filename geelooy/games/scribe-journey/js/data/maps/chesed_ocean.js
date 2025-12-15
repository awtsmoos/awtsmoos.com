
// B"H
// js/data/maps/chesed_ocean.js

export const chesedMaps = {
    'chesed_shores': {
        width: 25,
        baseLayerString: `
🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊
🌊⛵⬜🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊
🌊⬜⬜☁️⬜☁️⬜☁️⬜🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊
🌊🌊⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌊🌊
🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊⬜⬜⬜🌊🌊
🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊⬜🦁⬜🌊🌊
🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊⬜⬜⬜🌊🌊
🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊⬜⬜⬜🌊🌊
🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🚪⬜⬜🌊🌊
🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊
        `,
        encounters: {
            '🌊': [
                { id: 'benevolent_stream', levelRange: [18, 22], chance: 0.6 },
                { id: 'overflowing_cup', levelRange: [20, 24], chance: 0.3 }
            ],
            '☁️': [
                { id: 'cloud_of_glory', levelRange: [25, 30], chance: 0.2 }
            ]
        },
        interactables: {
            'to_springs': { type: 'door', emoji: '🚪', targetMap: 'chesed_springs', targetX: 7, targetY: 4 },
            'white_lion_guardian': { type: 'npc', emoji: '🦁', dialogue: { start: ["The Lion of Mercy roars not to frighten, but to awaken.", {startBattle: [{id: 'white_lion', level: 32}]}] } },
            'boat': { type: 'npc', emoji: '⛵', dialogue: { start: ["This vessel can take you to the White Tower... if your heart is generous."] } },
        }
    }
};
