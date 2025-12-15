
// B"H
// js/data/bestiary/amalek.js

export const amalekBeasts = {
    'cynical_jester': { 
        name: "Cynic", emoji: '🤡', type: 'Amalek', 
        baseStats: { hp: 100, attack: 0, defense: 40, diligence: 20 }, 
        moves: ['Mockery', 'Cold_Bath'], 
        xpYield: 100, moneyYield: { perutah: 5 },
        desc: "He knows the price of everything and the value of nothing. Attacks your enthusiasm (Kavanah)."
    },
    'frozen_heart': { 
        name: "Ice Heart", emoji: '🧊', type: 'Amalek', 
        baseStats: { hp: 150, attack: 10, defense: 60, diligence: 5 }, 
        moves: ['Absolute_Zero', 'Cool_Down'], 
        xpYield: 150, moneyYield: { perutah: 0 },
        desc: "A concept so cold it burns. 'Why get so excited?' it whispers."
    },
    'doubting_scholar': { 
        name: "Scholar of Doubt", emoji: '🧐', type: 'Amalek', 
        baseStats: { hp: 120, attack: 5, defense: 50, diligence: 50 }, 
        moves: ['Logical_Fallacy', 'Whisper_Negation'], 
        xpYield: 200, moneyYield: { perutah: 50 },
        desc: "Uses logic to dismantle faith."
    },
    'random_happenstance': { 
        name: "Mere Chance", emoji: '🎲', type: 'Amalek', 
        baseStats: { hp: 80, attack: 20, defense: 10, diligence: 60 }, 
        moves: ['Coin_Flip', 'Chaos_Theory'], 
        xpYield: 80, moneyYield: { perutah: 10 },
        desc: "Believes everything is a coincidence. 'Mikreh'."
    }
};
