
// B"H
// js/data/maps/gate_of_oneness.js

export const onenessMaps = {
    'hall_of_mirrors': {
        width: 20,
        baseLayerString: `
🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️
🌫️🚪⬜⬜⬜⬜⬜👑⬜⬜🕯️⬜⬜💰⬜⬜⬜⬜⬜🚪🌫️
🌫️⬜🌳🌳🌳🌳⬜⬜⬜⬜⬜⬜⬜⬜⚡⚡⚡⚡⬜🌫️
🌫️⬜🌳🌍🌳🌳⬜⬜⬜✡️⬜⬜⬜⚡👁️⚡⚡⬜🌫️
🌫️⬜🌳🌳🌳🌳⬜⬜⬜⬜⬜⬜⬜⬜⚡⚡⚡⚡⬜🌫️
🌫️⬜⬜⬜⬜⬜🌊⬜⬜⬜⬜⬜🗣️⬜⬜⬜⬜⬜🌫️
🌫️⬜🎭⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🎭⬜🌫️
🌫️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌫️
🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️
        `,
        encounters: {
            '🌳': [{ id: 'teva_mask', levelRange: [25, 30], chance: 0.4 }],
            '⚡': [{ id: 'nes_glory', levelRange: [25, 30], chance: 0.4 }]
        },
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'scribe_atheneum_upstairs', targetX: 2, targetY: 3 },
            'elijah_prophet': { 
                type: 'npc', emoji: '🕯️', questGiver: 'yud_tet_1_unification',
                dialogue: { 
                    start: ["Patah Eliyahu: 'You are One but not in calculation.'", "Four Paths lie before you: Matbea (Coin), Tvia (Submersion), Dibbur (Speech), and Ratzon (Will)."],
                    unified_daat: ["You have seen the truth. Nature is but a 'Matbea' (Coin) stamped by the King.", {giveItem: 'maamar_5715'}, {finalizeQuest: 'yud_tet_1_unification'}, "end"]
                } 
            },
            'to_matbea': { type: 'door', emoji: '💰', targetMap: 'matbea_1', targetX: 1, targetY: 4 },
            'to_tvia': { type: 'door', emoji: '🌊', targetMap: 'tvia_1', targetX: 1, targetY: 3 },
            'to_dibbur': { type: 'door', emoji: '🗣️', targetMap: 'dibbur_1', targetX: 1, targetY: 3 },
            'to_ratzon': { type: 'door', emoji: '👑', targetMap: 'ratzon_1', targetX: 1, targetY: 3 },
            
            'daat_tachton_npc': {
                type: 'npc', emoji: '🌍', 
                dialogue: {
                    start: ["I am Daat Tachton. I see the Creation as YESH (Something).", "Do you deny reality?"],
                    flagRequired: 'met_elijah',
                    text: "You wish to debate? Let us see if your 'Nothingness' can withstand my 'Existence'.",
                    battle_win: ["I see... my existence is only because He wills it constantly.", {setFlag: 'defeated_tachton'}],
                    startBattle: [{id: 'daat_tachton', level: 35}]
                }
            },
            'daat_elyon_npc': {
                type: 'npc', emoji: '👁️', 
                dialogue: {
                    start: ["I am Daat Elyon. I see the Creation as AYIN (Nothing).", "The world is a lie."],
                    flagRequired: 'met_elijah',
                    text: "You wish to bring me down to earth? Impossible.",
                    battle_win: ["I see... God desires a dwelling place *in* the lower realms.", {setFlag: 'defeated_elyon'}],
                    startBattle: [{id: 'daat_elyon', level: 35}]
                }
            },
            'unity_spark': {
                type: 'npc', emoji: '✡️',
                dialogue: {
                    start: ["(A spark of Atzmus)."],
                    condition: { type: 'flags', flags: ['defeated_tachton', 'defeated_elyon'] },
                    success: ["Daat Elyon and Daat Tachton merge.", {setFlag: 'unified_daat'}, "Return to Elijah."]
                }
            }
        }
    }
};
