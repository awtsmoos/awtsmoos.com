
// B"H
// js/data/quests/maamar/ratzon_quests.js

export const ratzonQuests = {
    'maamar_4_ratzon': { 
        id: 'maamar_4_ratzon', name: "The Crown Jewels", 
        desc: "The highest realm. You must recover the jewels of the Crown to reveal the King's true desire.", 
        status: 'locked', 
        objectives: [ 
            { id: 'find_jewel_binah', text: 'Find the Jewel of Binah (Level 6).', completed: false, target: {type: 'collect', itemId: 'jewel_binah', count: 1} },
            { id: 'find_jewel_chochmah', text: 'Find the Jewel of Chochmah (Level 12).', completed: false, target: {type: 'collect', itemId: 'jewel_chochmah', count: 1} },
            { id: 'find_jewel_keter', text: 'Find the Jewel of Keter (Level 18).', completed: false, target: {type: 'collect', itemId: 'jewel_keter', count: 1} }
        ],
        rewards: { money: { perutah: 10000 }, items: ['kli_ein_sof'] },
        questGiverId: 'elijah_prophet'
    }
};
