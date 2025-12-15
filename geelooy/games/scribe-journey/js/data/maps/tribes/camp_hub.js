
// B"H
// js/data/maps/tribes/camp_hub.js

export const tribesHubMaps = {
    'tribes_encampment': {
        width: 25,
        baseLayerString: `
🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️
🏜️⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺
🏜️⛺⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⛺
🏜️⛺⬜🦁⬜⬜⬜⬜⬜⛺⛺⛺⛺⛺⛺⛺⬜⬜⬜⬜⬜🐍⬜⛺
🏜️⛺⬜⬜⬜⬜⬜⬜⬜⛺🕍🕍🕍⛺⬜⬜⬜⬜⬜⬜⬜⛺
🏜️⛺⬜⬜⬜⬜⬜⬜⬜🕍🕍🕍🕍🕍⬜⬜⬜⬜⬜⬜⬜⛺
🏜️⛺⬜⬜⬜⬜⬜⬜⬜🕍🕍🏺🕍🕍⬜⬜⬜⬜⬜⬜⬜⛺
🏜️⛺⬜⬜⬜⬜⬜⬜⬜🕍🕍🕍🕍🕍⬜⬜⬜⬜⬜⬜⬜⛺
🏜️⛺⬜⬜⬜⬜⬜⬜⬜⛺🕍🕍🕍⛺⬜⬜⬜⬜⬜⬜⬜⛺
🏜️⛺⬜⬜⬜⬜⬜⬜⬜⛺⛺🚪⛺⛺⬜⬜⬜⬜⬜⬜⬜⛺
🏜️⛺⬜🦅⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🐂⬜⛺
🏜️⛺⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⛺
🏜️⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺🚪⛺⛺
🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️
        `,
        encounters: {
            '🏜️': [{ id: 'desert_viper', levelRange: [35, 40], chance: 0.2 }]
        },
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 18, targetY: 10 },
            
            // The Flags leading to sub-zones
            'banner_judah': { type: 'door', emoji: '🦁', targetMap: 'camp_judah_entrance', targetX: 1, targetY: 5, dialogue: { start: ["(The Banner of the East: Judah, Yissachar, Zevulun)."] } },
            'banner_dan': { type: 'door', emoji: '🐍', targetMap: 'camp_dan_entrance', targetX: 1, targetY: 5, dialogue: { start: ["(The Banner of the North: Dan, Asher, Naftali)."] } },
            'banner_reuven': { type: 'npc', emoji: '🦅', dialogue: { start: ["(The Banner of the South: Reuven, Shimon, Gad. Currently obscured by a sandstorm)."] } },
            'banner_ephraim': { type: 'npc', emoji: '🐂', dialogue: { start: ["(The Banner of the West: Efraim, Menashe, Binyamin. Currently obscured by a cloud)."] } },

            'mishkan_entrance': { type: 'door', emoji: '🚪', targetMap: 'mishkan_courtyard', targetX: 10, targetY: 10, condition: { type: 'hasItem', itemId: 'hoshen_breastplate' }, dialogue: { start: ["Only one who bears the Hoshen may enter the Holy Place."] } },
            
            'aaron_priest': { 
                type: 'npc', emoji: '🏺', questGiver: 'tribes_1_stones',
                dialogue: { 
                    start: [
                        "Shalom. We are camped according to our standards.",
                        "The Hoshen (Breastplate) has lost its stones. Without them, we cannot receive answers from the Urim V'Tumim.",
                        "Visit the camps. Prove yourself to the Nesiim (Princes). Return the 12 stones."
                    ],
                    in_progress: ["The banners wave in the wind. Have you found the stones?"],
                    completed: ["The Hoshen is complete! The Light of the Infinite shines through the stones."]
                } 
            }
        }
    },
    'mishkan_courtyard': {
        width: 15,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🐑⬜⬜⬜🔥⬜⬜⬜🐂⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜🧖⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🚪🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'tribes_encampment', targetX: 12, targetY: 9 },
            'kohen_gadol': { type: 'npc', emoji: '🧖', dialogue: { start: ["In this place, the physical and spiritual are one."] } }
        }
    }
};
