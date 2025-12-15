
// B"H
// js/data/maps/chanukah/caves.js

export const chanukahCaveMaps = {
    'maccabee_caves': {
        width: 15,
        baseLayerString: `
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
🪨🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜🛡️⬜🛡️🪨
🪨⬜🪨🪨🪨🪨🪨🪨🪨🪨🪨⬜⬜⬜🪨
🪨⬜🪨🏺⬜⬜⬜⬜⬜🏺🪨⬜🧔⬜🪨
🪨⬜🪨⬜⬜⬜🔥⬜⬜⬜🪨⬜⬜⬜🪨
🪨⬜🪨🏺⬜⬜⬜⬜⬜🏺🪨⬜📜⬜🪨
🪨⬜🪨🪨🪨🪨🪨🪨🪨🪨🪨⬜⬜⬜🪨
🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨🪨🪨🪨🪨🪨🪨🚪🪨🪨🪨🪨🪨🪨🪨
        `,
        interactables: {
            'exit_to_wilds': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 20, targetY: 5 }, // Connects to village
            'to_citadel': { type: 'door', emoji: '🚪', targetMap: 'greek_citadel_entrance', targetX: 1, targetY: 10 },
            'matityahu': { 
                type: 'npc', emoji: '🧔', questGiver: 'chanukah_1_rebellion',
                dialogue: { 
                    start: ["They have defiled the Sanctuary. They say we must write 'We have no portion in the G-d of Israel' on the horn of an ox.", "We say: 'Mi LaHashem Elai!' (Who is for G-d, to me!)", {acceptQuest: 'chanukah_1_rebellion'}]
                } 
            },
            'scroll_of_law': {
                type: 'npc', emoji: '📜',
                dialogue: {
                    start: ["(A scroll of laws regarding danger and miracles).", {giveItem: 'dreidel_clay'}, {setFlag: 'learned_pirsumei_nisa', text: "You learned the law of Pirsumei Nisa!"}]
                }
            }
        }
    }
};
