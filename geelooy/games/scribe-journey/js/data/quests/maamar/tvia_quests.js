
// B"H
// js/data/quests/maamar/tvia_quests.js

export const tviaQuests = {
    'maamar_2_tvia': { 
        id: 'maamar_2_tvia', name: "The Diving Suit", 
        desc: "The waters of Daat are too deep for a normal soul. You must assemble the spiritual diving suit to reach the bottom.", 
        status: 'locked', 
        objectives: [ 
            { id: 'find_helmet', text: 'Recover the Helmet from the Sunken Ship (Level 5).', completed: false, target: {type: 'collect', itemId: 'diving_helmet', count: 1} },
            { id: 'find_suit', text: 'Recover the Suit from the Coral Reef (Level 10).', completed: false, target: {type: 'collect', itemId: 'diving_suit', count: 1} },
            { id: 'find_tank', text: 'Recover the Tank of Emunah (Level 15).', completed: false, target: {type: 'collect', itemId: 'oxygen_tank_emunah', count: 1} },
            { id: 'reach_bottom', text: 'Reach the Abyssal Floor (Level 18).', completed: false, target: {type: 'dialogue', flag: 'reached_abyss'} }
        ],
        rewards: { money: { perutah: 3000 }, xp: 6000 },
        questGiverId: 'elijah_prophet'
    }
};
