
// B"H
// js/data/quests/gan_eden_quests.js

export const ganEdenQuests = {
    'gan_eden_1_garment': { 
        id: 'gan_eden_1_garment', name: "Weaving the Garment", 
        desc: "To enter the Garden, you need a 'Ketonet Or' (Garment of Light) made of Mitzvot. Perform acts of kindness to weave it.", 
        status: 'available', 
        objectives: [ 
            { id: 'perform_mitzvah_1', text: 'Give Tzedakah to 3 Poor Souls.', completed: false, target: {type: 'dialogue', flag: 'given_tzedakah_3'} },
            { id: 'perform_mitzvah_2', text: 'Return a Lost Object.', completed: false, target: {type: 'dialogue', flag: 'returned_lost_object'} },
            { id: 'receive_garment', text: 'Receive the Garment from the Tailor of Souls.', completed: false, target: {type: 'acquire', itemId: 'garment_of_light'} }
        ],
        rewards: { xp: 5000 },
        questGiverId: 'elder_scribe'
    },
    'gan_eden_2_river': { 
        id: 'gan_eden_2_river', name: "The Lost Gems", 
        desc: "The River Pishon has dried up because the gems of Bedolach and Shoham were stolen. Restore them.", 
        status: 'locked', 
        objectives: [ 
            { id: 'find_shoham', text: 'Recover the Shoham Stone from the Qliphoth.', completed: false, target: {type: 'collect', itemId: 'stone_shoham', count: 1} },
            { id: 'find_bedolach', text: 'Recover the Bedolach from the Void.', completed: false, target: {type: 'collect', itemId: 'stone_bedolach', count: 1} },
            { id: 'restore_river', text: 'Place the stones in the riverbed.', completed: false, target: {type: 'dialogue', flag: 'river_restored'} }
        ],
        rewards: { money: { perutah: 10000 }, items: ['dew_resurrection'] }
    }
};
