
// B"H
// js/data/maps/chanukah/caves.js

export const chanukahCaveMaps = {
    'maccabee_caves': {
        width: 15,
        baseLayerString: `
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨⬜🪨🪨🪨🪨🪨🪨🪨🪨🪨⬜⬜⬜🪨
🪨⬜🪨⬜⬜⬜⬜⬜🪨⬜⬜🪨
🪨⬜🪨⬜⬜⬜🔥⬜⬜⬜🪨⬜⬜⬜🪨
🪨⬜🪨⬜⬜⬜⬜⬜🪨⬜⬜🪨
🪨⬜🪨🪨🪨🪨🪨🪨🪨🪨🪨⬜⬜⬜🪨
🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
        `,
        interactables: {
            'exit_to_wilds': { type: 'door', uu: '\ueb01', visual: '🚪', emoji: '🚪', x: 1, y: 1, targetMap: 'malkuth_village', targetX: 20, targetY: 5 }, // Connects to village
            'to_citadel': { type: 'door', uu: '\ueb02', visual: '🚪', emoji: '🚪', x: 7, y: 8, targetMap: 'greek_citadel_entrance', targetX: 1, targetY: 10 },
            'matityahu': { 
                type: 'npc', uu: '\ueb03', visual: '🧔', emoji: '🧔', x: 12, y: 3, questGiver: 'chanukah_1_rebellion',
                dialogue: { 
                    start: ["They have defiled the Sanctuary. They say we must write 'We have no portion in the G-d of Israel' on the horn of an ox.", "We say: 'Mi LaHashem Elai!' (Who is for G-d, to me!)", {acceptQuest: 'chanukah_1_rebellion'}]
                } 
            },
            'scroll_of_law': {
                type: 'npc', uu: '\ueb04', visual: '📜', emoji: '📜', x: 12, y: 5,
                dialogue: {
                    start: ["(A scroll of laws regarding danger and miracles).", {giveItem: 'dreidel_clay'}, {setFlag: 'learned_pirsumei_nisa', text: "You learned the law of Pirsumei Nisa!"}]
                }
            },
            'shield_west': { type: 'npc', uu: '\ueb05', visual: '🛡️', emoji: '🛡️', x: 11, y: 1, dialogue: { start: ["A hand-forged shield: courage becomes useful when held by a body.", {giveItem: 'maccabee_shield_fragment'}] } },
            'shield_east': { type: 'npc', uu: '\ueb06', visual: '🛡️', emoji: '🛡️', x: 13, y: 1, dialogue: { start: ["Another shield waits for the second hand: partnership is also shlichus.", {giveItem: 'maccabee_shield_fragment'}] } },
            'oil_jar_west': { type: 'npc', uu: '\ueb07', visual: '🏺', emoji: '🏺', x: 3, y: 3, dialogue: { start: ["A sealed jar of oil. Small, exact, and enough for impossible light.", {giveItem: 'sealed_oil'}] } },
            'oil_jar_east': { type: 'npc', uu: '\ueb08', visual: '🏺', emoji: '🏺', x: 9, y: 3, dialogue: { start: ["The Greeks saw a vessel. You see a mission.", {giveItem: 'sealed_oil'}] } },
            'oil_jar_lower_west': { type: 'npc', uu: '\ueb09', visual: '🏺', emoji: '🏺', x: 3, y: 5, dialogue: { start: ["Oil hidden in the cave teaches that concealment can preserve holiness.", {giveItem: 'hidden_oil'}] } },
            'oil_jar_lower_east': { type: 'npc', uu: '\ueb0a', visual: '🏺', emoji: '🏺', x: 9, y: 5, dialogue: { start: ["Use this oil for publicizing the miracle, not hoarding it.", {giveItem: 'hidden_oil'}] } }
        }
    }
};
