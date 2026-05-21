
// B"H
// js/data/maps/chanukah/citadel.js

export const chanukahCitadelMaps = {
    'greek_citadel_entrance': {
        width: 20,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⬜⬜⬜⬜⬜🏛️⬜🏛️⬜⬜⬜⬜⬜🧱
🧱⬜🏛️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🏛️⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🏛️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🏛️⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🏛️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🏛️⬜🧱
🧱⬜⬜⬜🗡️⬜⬜⬜⬜⬜⬜🗡️⬜⬜⬜🧱
🧱⬜🏛️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🏛️⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        encounters: {
            '⬜': [
                { id: 'hellenist_guard', levelRange: [15, 20], chance: 0.3 },
                { id: 'darkness_creeper', levelRange: [12, 18], chance: 0.2 }
            ]
        },
        interactables: {
            'to_caves': { type: 'door', uu: '\uec01', visual: '🚪', emoji: '🚪', x: 1, y: 10, targetMap: 'maccabee_caves', targetX: 7, targetY: 7 },
            'to_courtyard': { type: 'door', uu: '\uec02', visual: '🚪', emoji: '🚪', x: 14, y: 10, targetMap: 'greek_citadel_courtyard', targetX: 10, targetY: 14 },
            'elephant_guard': { type: 'npc', uu: '\uec05', visual: '🐘', emoji: '🐘', x: 1, y: 1, dialogue: { start: ["(The beast blocks the way, trumpeting wildly!)", {startBattle: [{id: 'war_elephant', level: 25}]}] } },
            'elephant_guard_east': { type: 'npc', uu: '\uec06', visual: '🐘', emoji: '🐘', x: 15, y: 1, dialogue: { start: ["The second elephant shows the empire's borrowed strength.", {startBattle: [{id: 'war_elephant', level: 26}]}] } },
            'sword_guard_nw': { type: 'npc', uu: '\uec07', visual: '🗡️', emoji: '🗡️', x: 4, y: 3, dialogue: { start: ["Greek sharpness without holiness cuts the vessel apart.", {startBattle: [{id: 'hellenist_guard', level: 18}]}] } },
            'sword_guard_ne': { type: 'npc', uu: '\uec08', visual: '🗡️', emoji: '🗡️', x: 11, y: 3, dialogue: { start: ["Wisdom stolen from its Source becomes a blade.", {startBattle: [{id: 'hellenist_guard', level: 19}]}] } },
            'sword_guard_sw': { type: 'npc', uu: '\uec09', visual: '🗡️', emoji: '🗡️', x: 4, y: 7, dialogue: { start: ["The lower courtyard tests persistence under pressure.", {startBattle: [{id: 'hellenist_guard', level: 20}]}] } },
            'sword_guard_se': { type: 'npc', uu: '\uec0a', visual: '🗡️', emoji: '🗡️', x: 11, y: 7, dialogue: { start: ["The miracle begins when the body refuses to bow.", {startBattle: [{id: 'hellenist_guard', level: 21}]}] } }
        }
    },
    'greek_citadel_courtyard': {
        width: 15,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🏛️⬜⬜⬜⬜⬜⬜🏛️⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🏛️⬜⬜⬜⬜⬜⬜⬜🏛️⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🏛️⬜⬜⬜⬜⬜⬜⬜🏛️⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'to_entrance': { type: 'door', uu: '\uec11', visual: '🚪', emoji: '🚪', x: 1, y: 8, targetMap: 'greek_citadel_entrance', targetX: 10, targetY: 1 },
            'menorah': { 
                type: 'npc', uu: '\uec12', visual: '🕯️', emoji: '🕯️', x: 6, y: 2, 
                dialogue: { 
                    start: ["The Menorah stands cold and unlit."],
                    flagRequired: 'learned_pirsumei_nisa',
                    text: "You know the law: The miracle must be publicized.",
                    condition: { type: 'hasItem', itemId: 'jug_of_pure_oil' },
                    success: ["You pour the pure oil and light the flame. It burns with a holy light!", {setFlag: 'menorah_lit'}, {finalizeQuest: 'chanukah_2_lights'}, "end"]
                } 
            },
            'oil_barrel': {
                type: 'npc', uu: '\uec13', visual: '🛢️', emoji: '🛢️', x: 6, y: 3,
                dialogue: {
                     start: ["(A barrel of oil... but the seal is broken. It is defiled.)", "You cannot use this."]
                }
            },
            'vault_door': { type: 'door', uu: '\uec14', visual: '🚪', emoji: '🚪', x: 12, y: 8, targetMap: 'greek_citadel_vault', targetX: 5, targetY: 5 }
        }
    },
    'greek_citadel_vault': {
        width: 10,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⬜⬜⬜⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', uu: '\uec21', visual: '🚪', emoji: '🚪', x: 1, y: 5, targetMap: 'greek_citadel_courtyard', targetX: 2, targetY: 7 },
            'pure_oil_jug': { type: 'npc', uu: '\uec22', visual: '🏺', emoji: '🏺', x: 4, y: 3, dialogue: { start: ["Hidden in the back... a single jug! The seal of the High Priest is intact!", {giveItem: 'jug_of_pure_oil'}, "end"] } },
            'treasure_west': { type: 'npc', uu: '\uec23', visual: '💰', emoji: '💰', x: 1, y: 1, dialogue: { start: ["Coins from the empire. Redeem them for mitzvah, not ego.", {giveMoney: { perutah: 8 }}] } },
            'treasure_east': { type: 'npc', uu: '\uec24', visual: '💰', emoji: '💰', x: 8, y: 1, dialogue: { start: ["Wealth in the vault becomes holy only when it leaves the vault.", {giveMoney: { perutah: 8 }}] } },
            'vault_sword_west': { type: 'npc', uu: '\uec25', visual: '🗡️', emoji: '🗡️', x: 3, y: 2, dialogue: { start: ["A confiscated sword. Its metal waits for a better purpose.", {giveItem: 'refined_metal'}] } },
            'vault_sword_east': { type: 'npc', uu: '\uec26', visual: '🗡️', emoji: '🗡️', x: 5, y: 2, dialogue: { start: ["Another blade, another spark. Do not worship the weapon; redeem the force.", {giveItem: 'refined_metal'}] } }
        }
    }
};
