
// B"H
// js/data/quests/yud_tet_quests.js

export const yudTetQuests = {
    'yud_tet_1_unification': { 
        id: 'yud_tet_1_unification', name: "The Unity of 5715", 
        desc: "Elijah has opened the Gate of Oneness. You must reconcile Daat Elyon (God's view) and Daat Tachton (Man's view) to reveal that Nature is but a constant Miracle.", 
        status: 'available', 
        objectives: [ 
            { id: 'speak_elijah', text: 'Speak to Elijah in the Hall of Mirrors.', completed: false, target: {type: 'dialogue', flag: 'met_elijah'} },
            { id: 'defeat_duality', text: 'Debate and Unify Daat Elyon and Daat Tachton.', completed: false, target: {type: 'dialogue', flag: 'unified_daat'} },
            { id: 'collect_maamar', text: 'Receive the Maamar 5715.', completed: false, target: {type: 'collect', itemId: 'maamar_5715', count: 1} }
        ],
        rewards: { money: { perutah: 1000 }, items: ['coin_of_nature'] },
        questGiverId: 'elijah_prophet'
    }
};
