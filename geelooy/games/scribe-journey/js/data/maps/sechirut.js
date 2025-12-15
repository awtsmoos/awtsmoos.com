
// B"H
// js/data/maps/sechirut.js

export const sechirutMaps = {
    'court_of_guardians': {
        width: 15,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⬜⬜⬜⬜⬜⚖️⬜⬜⬜⬜⬜⬜🧱
🧱⬜👨‍💼⬜⬜⬜⬜⬜⬜⬜👨‍✈️⬜🧱
🧱⬜⬜⬜⬜⬜📜⬜⬜⬜⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜🚶⬜⬜⬜⬜⬜⬜⬜🚴⬜⬜🧱
🧱⬜⬜⬜⬜⬜🚪⬜⬜⬜⬜⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 8, targetY: 10 },
            'court_clerk': { 
                type: 'npc', emoji: '📜', questGiver: 'sechirut_2_guardians_dispute',
                dialogue: { 
                    start: ["Welcome to the Beit Din of Guardians. Here we judge liabilities based on the Four Types: Unpaid, Borrower, Paid, and Renter.", {acceptQuest: 'sechirut_2_guardians_dispute'}],
                    in_progress: ["The case is before you. An Unpaid Guardian gave the deposit to a Paid Guardian. It was stolen. Who is liable?"],
                    case_heard: ["You have heard the arguments. What is your ruling?", {choices: [
                        {text: "The Paid Guardian is liable (he lost it).", next: "wrong_ruling"},
                        {text: "The Unpaid Guardian is exempt (he gave it to a better watchman).", next: "wrong_ruling"},
                        {text: "The Unpaid Guardian is liable (he breached trust).", next: "correct_ruling"}
                    ]}],
                    wrong_ruling: ["Incorrect. The owner can say: 'I trusted you with my oath, but I do not trust him.' Even though the second watchman was 'better' (Paid), the first had no right to transfer it."],
                    correct_ruling: ["Correct! 'You are my trustee, he is not.' Even though he improved the level of guardianship, he had no permission to hand it over. Therefore, he is negligent.", {setFlag: 'correct_judgment_rendered'}, {finalizeQuest: 'sechirut_2_guardians_dispute'}, "end"]
                }
            },
            'unpaid_guardian': { type: 'npc', emoji: '🚶', dialogue: { start: ["I am Shomer Chinam. I watched for free! I swore I wasn't negligent. Why should I pay?"] } },
            'paid_guardian': { type: 'npc', emoji: '👨‍✈️', dialogue: { start: ["I am Noseh Sachar. I was paid to watch. Yes, it was stolen, so I would usually pay... but I wasn't the one the owner trusted!"] } },
            'borrower': { type: 'npc', emoji: '🚴', dialogue: { start: ["I am Shoel. I borrowed it for my use. If it breaks, I pay. Unless... the owner was working for me at the time?"] } },
        }
    },
    'vineyard_of_labor': {
        width: 20,
        baseLayerString: `
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
🌳🍇🍇🍇🍇🍇🍇🍇🍇🍇🍇🍇🍇🍇🍇🍇🍇🍇🌳
🌳🍇👨‍🌾🍇🍇🍇🍇🍇🍇🍇🍇🍇🍇🍇🍇🍇🍇🌳
🌳🍇🍇🍇🍇🍇🍇🍇🍇🍇🍇🍇🍇🍇🍇🍇🍇🍇🌳
🌳⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳🌾🌾🌾🌾🌾🌾🌾🌾🌾🌾🌾🌾🐮🌾🌾🌾🌳
🌳🌾🌾🌾🌾🌾🌾🌾🌾🌾🌾🌾🌾🌾🌾🌾🌾🌳
🌳⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳🏠⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🚪🌳
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
        `,
        encounters: {
            '🍇': [{ id: 'spirit_of_negligence', levelRange: [5, 8], chance: 0.3 }],
            '🌾': [{ id: 'muzzled_ox', levelRange: [8, 12], chance: 0.3 }]
        },
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 20, targetY: 8 },
            'employer_house': { type: 'npc', emoji: '🏠', dialogue: { 
                start: ["(The employer's house)."],
                in_progress: ["You enter and find the coin bag on the table.", {giveItem: 'coin_bag_wage'}, "Take it to the worker quickly!"] 
            }},
            'vineyard_foreman': { 
                type: 'npc', emoji: '👨‍🌾', questGiver: 'sechirut_1_wages',
                dialogue: { 
                    start: ["The sun is setting! I have finished my work, but the master is not here to pay me. The Torah says: 'In his day you shall give his hire'.", {acceptQuest: 'sechirut_1_wages'}],
                    condition: { type: 'hasItem', itemId: 'coin_bag_wage' },
                    success: ["Thank you! You have upheld the law of 'Lo Talin' (Do not delay wages).", {setFlag: 'worker_paid'}, {finalizeQuest: 'sechirut_1_wages'}, "end"]
                } 
            },
            'threshing_ox': {
                type: 'npc', emoji: '🐮', questGiver: 'sechirut_3_muzzle',
                dialogue: {
                    start: ["(The ox groans. It is muzzled and cannot eat the grain it is threshing).", {acceptQuest: 'sechirut_3_muzzle'}],
                    success: ["You remove the muzzle. The ox eats happily.", {setFlag: 'ox_unmuzzled'}, {finalizeQuest: 'sechirut_3_muzzle'}, "end"]
                }
            }
        }
    }
};
