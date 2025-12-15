
// B"H
// js/data/quests/maamar/matbea_quests.js

export const matbeaQuests = {
    'maamar_1_matbea': { 
        id: 'maamar_1_matbea', name: "The Four Coins", 
        desc: "To understand that Nature is but a coin stamped by the King, you must find the 4 elemental coins hidden deep within the 18 Chambers of the Mint.", 
        status: 'locked', 
        objectives: [ 
            { id: 'find_coin_fire', text: 'Find the Coin of Fire (Chamber 4).', completed: false, target: {type: 'collect', itemId: 'coin_of_fire', count: 1} },
            { id: 'find_coin_water', text: 'Find the Coin of Water (Chamber 8).', completed: false, target: {type: 'collect', itemId: 'coin_of_water', count: 1} },
            { id: 'find_coin_wind', text: 'Find the Coin of Wind (Chamber 12).', completed: false, target: {type: 'collect', itemId: 'coin_of_wind', count: 1} },
            { id: 'find_coin_dust', text: 'Find the Coin of Dust (Chamber 16).', completed: false, target: {type: 'collect', itemId: 'coin_of_dust', count: 1} },
            { id: 'return_coins', text: 'Return to Elijah in the Hall of Mirrors.', completed: false, target: {type: 'dialogue', flag: 'returned_coins'} }
        ],
        rewards: { money: { perutah: 2000 }, xp: 5000 },
        questGiverId: 'elijah_prophet'
    }
};
