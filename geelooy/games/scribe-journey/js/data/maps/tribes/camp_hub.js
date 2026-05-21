
// B"H
// js/data/maps/tribes/camp_hub.js

export const tribesHubMaps = {
    'tribes_encampment': {
        width: 25,
        baseLayerString: `
🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️
🏜️⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺
🏜️⛺⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⛺
🏜️⛺⬜⬜⬜⬜⬜⬜⛺⛺⛺⛺⛺⛺⛺⬜⬜⬜⬜⬜⬜⛺
🏜️⛺⬜⬜⬜⬜⬜⬜⬜⛺🕍🕍🕍⛺⬜⬜⬜⬜⬜⬜⬜⛺
🏜️⛺⬜⬜⬜⬜⬜⬜⬜🕍🕍🕍🕍🕍⬜⬜⬜⬜⬜⬜⬜⛺
🏜️⛺⬜⬜⬜⬜⬜⬜⬜🕍🕍🕍🕍⬜⬜⬜⬜⬜⬜⬜⛺
🏜️⛺⬜⬜⬜⬜⬜⬜⬜🕍🕍🕍🕍🕍⬜⬜⬜⬜⬜⬜⬜⛺
🏜️⛺⬜⬜⬜⬜⬜⬜⬜⛺🕍🕍🕍⛺⬜⬜⬜⬜⬜⬜⬜⛺
🏜️⛺⬜⬜⬜⬜⬜⬜⬜⛺⛺⛺⛺⬜⬜⬜⬜⬜⬜⬜⛺
🏜️⛺⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⛺
🏜️⛺⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⛺
🏜️⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺⛺
🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️🏜️
        `,
        encounters: {
            '🏜️': [{ id: 'desert_viper', levelRange: [35, 40], chance: 0.2 }]
        },
        interactables: {
            'exit': { type: 'door', uu: '\uf104', visual: '🚪', emoji: '🚪', x: 23, y: 12, targetMap: 'malkuth_village', targetX: 18, targetY: 10 },
            
            // The Flags leading to sub-zones
            'banner_judah': { type: 'door', uu: '\uf101', visual: '🦁', emoji: '🦁', x: 3, y: 3, targetMap: 'camp_judah_entrance', targetX: 1, targetY: 5, dialogue: { start: ["(The Banner of the East: Judah, Yissachar, Zevulun)."] } },
            'banner_dan': { type: 'door', uu: '\uf102', visual: '🐍', emoji: '🐍', x: 21, y: 3, targetMap: 'camp_dan_entrance', targetX: 1, targetY: 5, dialogue: { start: ["(The Banner of the North: Dan, Asher, Naftali)."] } },
            'banner_reuven': { type: 'npc', uu: '\uf106', visual: '🦅', emoji: '🦅', x: 3, y: 10, dialogue: { start: ["(The Banner of the South: Reuven, Shimon, Gad. Currently obscured by a sandstorm)."] } },
            'banner_ephraim': { type: 'npc', uu: '\uf107', visual: '🐂', emoji: '🐂', x: 19, y: 10, dialogue: { start: ["(The Banner of the West: Efraim, Menashe, Binyamin. Currently obscured by a cloud)."] } },

            'mishkan_entrance': { type: 'door', uu: '\uf103', visual: '🚪', emoji: '🚪', x: 11, y: 9, targetMap: 'mishkan_courtyard', targetX: 10, targetY: 10, condition: { type: 'hasItem', itemId: 'hoshen_breastplate' }, dialogue: { start: ["Only one who bears the Hoshen may enter the Holy Place."] } },
            
            'aaron_priest': { 
                type: 'npc', uu: '\uf105', visual: '🏺', emoji: '🏺', x: 11, y: 6, questGiver: 'tribes_1_stones',
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
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', uu: '\uf111', visual: '🚪', emoji: '🚪', x: 1, y: 6, targetMap: 'tribes_encampment', targetX: 12, targetY: 9 },
            'kohen_gadol': { type: 'npc', uu: '\uf113', visual: '🧖', emoji: '🧖', x: 6, y: 4, dialogue: { start: ["In this place, the physical and spiritual are one."] } },
            'east_exit': { type: 'door', uu: '\uf112', visual: '🚪', emoji: '🚪', x: 13, y: 6, targetMap: 'tribes_encampment', targetX: 12, targetY: 9 },
            'lamb_offering': { type: 'npc', uu: '\uf115', visual: '🐑', emoji: '🐑', x: 2, y: 2, dialogue: { start: ["A lamb teaches that a body can become a korban, brought close."] } },
            'altar_fire': { type: 'npc', uu: '\uf116', visual: '🔥', emoji: '🔥', x: 6, y: 2, dialogue: { start: ["The altar fire rises only because wood and flesh enter below."] } },
            'bull_offering': { type: 'npc', uu: '\uf117', visual: '🐂', emoji: '🐂', x: 10, y: 2, dialogue: { start: ["The strength of the ox is lifted when action serves the Mishkan."] } }
        }
    }
};
