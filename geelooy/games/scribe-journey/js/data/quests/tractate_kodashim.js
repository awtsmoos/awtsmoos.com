
// B"H
// js/data/quests/tractate_kodashim.js

export const kodashimQuests = {
    'kodashim_1_tamid': { 
        id: 'kodashim_1_tamid', name: "The Daily Offering", 
        desc: "The spiritual Temple in Keter requires a daily offering of devotion.", 
        status: 'locked', 
        objectives: [ 
            { id: 'find_lamb', text: 'Capture a pristine Tam Ox.', completed: false, target: {type: 'defeat', musagId: 'tam_ox', count: 1} }, 
            { id: 'bring_offering', text: 'Ascend to Keter and present the offering.', completed: false, target: {type: 'dialogue', flag: 'offering_made'} }
        ],
        rewards: { money: { perutah: 1000 }, xp: 2000 },
    }
};
