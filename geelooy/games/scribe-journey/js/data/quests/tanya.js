
// B"H
// js/data/quests/tanya.js

export const tanyaQuests = {
    'tanya_1_beinoni': { 
        id: 'tanya_1_beinoni', name: "The Path of the Beinoni", 
        desc: "The Alter Rebbe challenges you to master your own heart. Defeat the manifestations of the Animal Soul.", 
        status: 'available', 
        objectives: [ 
            { id: 'defeat_pride', text: 'Defeat Gross Pride in the Left Ventricle.', completed: false, target: {type: 'defeat', musagId: 'gross_pride', count: 1} },
            { id: 'defeat_nogah', text: 'Subdue the Kelipat Nogah Beast.', completed: false, target: {type: 'defeat', musagId: 'kelipat_nogah_beast', count: 1} },
            { id: 'meditate_truth', text: 'Meditate in the Right Ventricle.', completed: false, target: {type: 'dialogue', flag: 'meditated_in_kedushah'} }
        ],
        rewards: { money: { perutah: 5000 }, items: ['sefer_beinoni'], xp: 10000 },
        questGiverId: 'alter_rebbe'
    }
};
