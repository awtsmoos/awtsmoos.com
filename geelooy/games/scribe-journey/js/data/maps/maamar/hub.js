
// B"H
// js/data/maps/maamar/hub.js

export const maamarHub = {
    'hall_of_mirrors': {
        width: 20,
        baseLayerString: `
🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️
🌫️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌫️
🌫️⬜🌳🌳🌳🌳⬜⬜⬜⬜⬜⬜⬜⬜⚡⚡⚡⚡⬜🌫️
🌫️⬜🌳🌳🌳⬜⬜⬜⬜⬜⬜⚡⚡⚡⬜🌫️
🌫️⬜🌳🌳🌳🌳⬜⬜⬜⬜⬜⬜⬜⬜⚡⚡⚡⚡⬜🌫️
🌫️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌫️
🌫️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌫️
🌫️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌫️
🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️🌫️
        `,
        encounters: {
            '🌳': [{ id: 'teva_mask', levelRange: [25, 30], chance: 0.4 }],
            '⚡': [{ id: 'nes_glory', levelRange: [25, 30], chance: 0.4 }]
        },
        interactables: {
            'exit': { type: 'door', uu: '\uee01', visual: '🚪', emoji: '🚪', x: 1, y: 1, targetMap: 'scribe_atheneum_upstairs', targetX: 2, targetY: 3 },
            'elijah_prophet': { 
                type: 'npc', uu: '\uee02', visual: '🕯️', emoji: '🕯️', x: 10, y: 1, questGiver: 'yud_tet_1_unification',
                dialogue: { 
                    start: [
                        "Patah Eliyahu: 'You are One but not in calculation.'", 
                        "The main path is open, but to truly understand, you must explore the Four Worlds.",
                        {choices: [
                            {text: "Quest: Matbea (Coin)", next: "quest_matbea"},
                            {text: "Quest: Tvia (Immersion)", next: "quest_tvia"},
                            {text: "Quest: Dibbur (Speech)", next: "quest_dibbur"},
                            {text: "Quest: Ratzon (Will)", next: "quest_ratzon"},
                            {text: "Main Unification", next: "main_quest"}
                        ]}
                    ],
                    quest_matbea: ["Go to the Mint. Find the 4 Coins of the Elements.", {acceptQuest: 'maamar_1_matbea'}, "end"],
                    quest_tvia: ["Go to the Sea. Find the Diving Gear to reach the abyss.", {acceptQuest: 'maamar_2_tvia'}, "end"],
                    quest_dibbur: ["Go to the Workshop. Find the Aleph, Mem, and Shin.", {acceptQuest: 'maamar_3_dibbur'}, "end"],
                    quest_ratzon: ["Go to the Palace. Find the Jewels of the Crown.", {acceptQuest: 'maamar_4_ratzon'}, "end"],
                    
                    main_quest: ["Once you have unified the Daat, return to me.", {condition: {type: 'flags', flags: ['unified_daat']}, success: ["You have done it.", {giveItem: 'maamar_5715'}, {finalizeQuest: 'yud_tet_1_unification'}, "end"]}],
                    
                    returned_coins: ["You have returned the coins! Nature is redeemed.", {finalizeQuest: 'maamar_1_matbea'}, "end"],
                    reached_abyss: ["You have reached the essence of the waters.", {finalizeQuest: 'maamar_2_tvia'}, "end"],
                    restored_speech: ["You have restored the holy speech.", {finalizeQuest: 'maamar_3_dibbur'}, "end"],
                    found_jewel_keter: ["You have the Crown Jewel.", {finalizeQuest: 'maamar_4_ratzon'}, "end"]
                } 
            },
            'to_matbea': { type: 'door', uu: '\uee06', visual: '💰', emoji: '💰', x: 13, y: 1, targetMap: 'matbea_1', targetX: 1, targetY: 4 },
            'to_tvia': { type: 'door', uu: '\uee03', visual: '🌊', emoji: '🌊', x: 6, y: 5, targetMap: 'tvia_1', targetX: 1, targetY: 3 },
            'to_dibbur': { type: 'door', uu: '\uee04', visual: '🗣️', emoji: '🗣️', x: 12, y: 5, targetMap: 'dibbur_1', targetX: 1, targetY: 3 },
            'to_ratzon': { type: 'door', uu: '\uee05', visual: '👑', emoji: '👑', x: 7, y: 1, targetMap: 'ratzon_1', targetX: 1, targetY: 3 },
            
            'daat_tachton_npc': {
                type: 'npc', uu: '\uee09', visual: '🌍', emoji: '🌍', x: 3, y: 3, 
                dialogue: {
                    start: ["I am Daat Tachton. I see the Creation as YESH (Something).", "Do you deny reality?"],
                    flagRequired: 'met_elijah',
                    text: "You wish to debate? Let us see if your 'Nothingness' can withstand my 'Existence'.",
                    battle_win: ["I see... my existence is only because He wills it constantly.", {setFlag: 'defeated_tachton'}],
                    startBattle: [{id: 'daat_tachton', level: 35}]
                }
            },
            'daat_elyon_npc': {
                type: 'npc', uu: '\uee0a', visual: '👁️', emoji: '👁️', x: 14, y: 3, 
                dialogue: {
                    start: ["I am Daat Elyon. I see the Creation as AYIN (Nothing).", "The world is a lie."],
                    flagRequired: 'met_elijah',
                    text: "You wish to bring me down to earth? Impossible.",
                    battle_win: ["I see... God desires a dwelling place *in* the lower realms.", {setFlag: 'defeated_elyon'}],
                    startBattle: [{id: 'daat_elyon', level: 35}]
                }
            },
            'unity_spark': {
                type: 'npc', uu: '\uee0b', visual: '✡️', emoji: '✡️', x: 9, y: 3,
                dialogue: {
                    start: ["(A spark of Atzmus)."],
                    condition: { type: 'flags', flags: ['defeated_tachton', 'defeated_elyon'] },
                    success: ["Daat Elyon and Daat Tachton merge.", {setFlag: 'unified_daat'}, "Return to Elijah."]
                }
            },
            'upper_exit': { type: 'door', uu: '\uee07', visual: '🚪', emoji: '🚪', x: 19, y: 1, targetMap: 'scribe_atheneum_upstairs', targetX: 2, targetY: 3 },
            'mask_left': { type: 'npc', uu: '\uee0c', visual: '🎭', emoji: '🎭', x: 2, y: 6, dialogue: { start: ["A mask asks: are nature and miracle two things, or two garments?"] } },
            'mask_right': { type: 'npc', uu: '\uee0d', visual: '🎭', emoji: '🎭', x: 16, y: 6, dialogue: { start: ["When the mask is named exactly, it stops stealing another face."] } }
        }
    }
};
