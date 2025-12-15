
// B"H
// js/data/quests/sechirut_quests.js

export const sechirutQuests = {
    'sechirut_1_wages': { 
        id: 'sechirut_1_wages', name: "The Sun Sets", 
        desc: "A worker in the vineyard has finished his day. The employer is delaying payment. Fulfill the Mitzvah of 'In his day you shall give his hire'.", 
        status: 'available', 
        objectives: [ 
            { id: 'collect_wage', text: 'Collect the Coin Bag from the Employer\'s house.', completed: false, target: {type: 'collect', itemId: 'coin_bag_wage', count: 1} },
            { id: 'pay_worker', text: 'Pay the Worker before nightfall.', completed: false, target: {type: 'dialogue', flag: 'worker_paid'} }
        ],
        rewards: { money: { perutah: 100 }, xp: 100 },
        questGiverId: 'vineyard_foreman'
    },
    'sechirut_2_guardians_dispute': { 
        id: 'sechirut_2_guardians_dispute', name: "The Case of the Second Guardian", 
        desc: "An Unpaid Guardian handed an object to a Paid Guardian, and it was stolen. Who pays? Judge the case in the Court of Guardians.", 
        status: 'available', 
        objectives: [ 
            { id: 'hear_case', text: 'Hear the testimony of the Unpaid Guardian.', completed: false, target: {type: 'dialogue', flag: 'case_heard'} },
            { id: 'render_judgment', text: 'Render the correct Halachic ruling.', completed: false, target: {type: 'dialogue', flag: 'correct_judgment_rendered'} }
        ],
        rewards: { money: { perutah: 500 }, items: ['contract_of_guardians'] },
        questGiverId: 'court_clerk'
    },
    'sechirut_3_muzzle': {
        id: 'sechirut_3_muzzle', name: "Do Not Muzzle",
        desc: "An ox is threshing grain but cannot eat. This is a violation of 'Lo Tachsom'.",
        status: 'available',
        objectives: [
            { id: 'find_ox', text: 'Find the Muzzled Ox in the threshing floor.', completed: false },
            { id: 'remove_muzzle', text: 'Remove the muzzle.', completed: false, target: {type: 'dialogue', flag: 'ox_unmuzzled'} }
        ],
        rewards: { money: { perutah: 150 }, items: ['basket_of_grapes'] }
    }
};
