
// B"H
// js/data/quests/maamar/dibbur_quests.js

export const dibburQuests = {
    'maamar_3_dibbur': { 
        id: 'maamar_3_dibbur', name: "The Lost Aleph-Bet", 
        desc: "The letters of creation have been scattered by the breaking of the vessels. Restore the primary sigils.", 
        status: 'locked', 
        objectives: [ 
            { id: 'find_aleph', text: 'Find the Aleph (The Head) in Chamber 3.', completed: false, target: {type: 'collect', itemId: 'letter_aleph', count: 1} },
            { id: 'find_mem', text: 'Find the Mem (The Body) in Chamber 9.', completed: false, target: {type: 'collect', itemId: 'letter_mem', count: 1} },
            { id: 'find_shin', text: 'Find the Shin (The Fire) in Chamber 15.', completed: false, target: {type: 'collect', itemId: 'letter_shin', count: 1} },
            { id: 'restore_speech', text: 'Speak the Unification in Chamber 18.', completed: false, target: {type: 'dialogue', flag: 'restored_speech'} }
        ],
        rewards: { money: { perutah: 4000 }, items: ['tome_of_gematria'] },
        questGiverId: 'elijah_prophet'
    }
};
