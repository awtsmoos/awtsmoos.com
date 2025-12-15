
// B"H
// js/data/maps/chanukah/citadel.js

export const chanukahCitadelMaps = {
    'greek_citadel_entrance': {
        width: 20,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱🐘⬜⬜⬜⬜⬜🏛️⬜🏛️⬜⬜⬜⬜⬜🐘🧱
🧱⬜🏛️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🏛️⬜🧱
🧱⬜⬜⬜🗡️⬜⬜⬜⬜⬜⬜🗡️⬜⬜⬜🧱
🧱⬜🏛️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🏛️⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🏛️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🏛️⬜🧱
🧱⬜⬜⬜🗡️⬜⬜⬜⬜⬜⬜🗡️⬜⬜⬜🧱
🧱⬜🏛️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🏛️⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🚪🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        encounters: {
            '⬜': [
                { id: 'hellenist_guard', levelRange: [15, 20], chance: 0.3 },
                { id: 'darkness_creeper', levelRange: [12, 18], chance: 0.2 }
            ]
        },
        interactables: {
            'to_caves': { type: 'door', emoji: '🚪', targetMap: 'maccabee_caves', targetX: 7, targetY: 7 },
            'to_courtyard': { type: 'door', emoji: '🚪', targetMap: 'greek_citadel_courtyard', targetX: 10, targetY: 14 },
            'elephant_guard': { type: 'npc', emoji: '🐘', dialogue: { start: ["(The beast blocks the way, trumpeting wildly!)", {startBattle: [{id: 'war_elephant', level: 25}]}] } }
        }
    },
    'greek_citadel_courtyard': {
        width: 15,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🏛️⬜⬜⬜🕯️⬜⬜⬜🏛️⬜🧱
🧱⬜⬜⬜⬜⬜🛢️⬜⬜⬜⬜⬜🧱
🧱⬜🏛️⬜⬜⬜⬜⬜⬜⬜🏛️⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🏛️⬜⬜⬜⬜⬜⬜⬜🏛️⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🚪🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'to_entrance': { type: 'door', emoji: '🚪', targetMap: 'greek_citadel_entrance', targetX: 10, targetY: 1 },
            'menorah': { 
                type: 'npc', emoji: '🕯️', 
                dialogue: { 
                    start: ["The Menorah stands cold and unlit."],
                    flagRequired: 'learned_pirsumei_nisa',
                    text: "You know the law: The miracle must be publicized.",
                    condition: { type: 'hasItem', itemId: 'jug_of_pure_oil' },
                    success: ["You pour the pure oil and light the flame. It burns with a holy light!", {setFlag: 'menorah_lit'}, {finalizeQuest: 'chanukah_2_lights'}, "end"]
                } 
            },
            'oil_barrel': {
                type: 'npc', emoji: '🛢️',
                dialogue: {
                     start: ["(A barrel of oil... but the seal is broken. It is defiled.)", "You cannot use this."]
                }
            },
            'vault_door': { type: 'door', emoji: '🚪', targetMap: 'greek_citadel_vault', targetX: 5, targetY: 5 }
        }
    },
    'greek_citadel_vault': {
        width: 10,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱💰⬜⬜⬜⬜⬜⬜💰🧱
🧱⬜⬜🗡️⬜🗡️⬜⬜🧱
🧱⬜⬜⬜🏺⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜🧱
🧱🚪⬜⬜⬜⬜⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'greek_citadel_courtyard', targetX: 2, targetY: 7 },
            'pure_oil_jug': { type: 'npc', emoji: '🏺', dialogue: { start: ["Hidden in the back... a single jug! The seal of the High Priest is intact!", {giveItem: 'jug_of_pure_oil'}, "end"] } }
        }
    }
};
