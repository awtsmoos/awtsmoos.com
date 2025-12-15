
// B"H
// js/data/quests/tractate_nashim.js

export const nashimQuests = {
    'nashim_1_ketubah': { 
        id: 'nashim_1_ketubah', name: "The Lost Ketubah", 
        desc: "A wedding in the village is halted. The marriage contract (Ketubah) has been blown away by a wind from the Qliphoth.", 
        status: 'available', 
        objectives: [ 
            { id: 'find_witnesses', text: 'Find 2 Witnesses in the Village.', completed: false, target: {type: 'dialogue', flag: 'witnesses_found'} },
            { id: 'recover_contract', text: 'Recover the torn contract from the Qliphoth Depths.', completed: false, target: {type: 'collect', itemId: 'torn_ketubah', count: 1} },
            { id: 'return_contract', text: 'Return it to the groom.', completed: false, target: {type: 'dialogue', flag: 'wedding_saved'} }
        ],
        rewards: { money: { perutah: 500 }, items: ['ring_of_kiddushin'] },
    }
};
