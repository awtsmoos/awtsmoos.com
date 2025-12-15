
// B"H
// js/data/bestiary/gehinnom.js

export const gehinnomBeasts = {
    'guilt_heavy': { 
        name: "Heavy Guilt", emoji: '😔', type: 'Gevurah', 
        baseStats: { hp: 120, attack: 10, defense: 60, diligence: 10 }, 
        moves: ['Collapse', 'Harden'], 
        xpYield: 150, moneyYield: { perutah: 0 },
        desc: "The weight of things done wrong."
    },
    'shame_hot': { 
        name: "Burning Shame", emoji: '😳', type: 'Gevurah', 
        baseStats: { hp: 100, attack: 40, defense: 10, diligence: 20 }, 
        moves: ['Gevurah_Rebuke', 'Propel_Stones'], 
        xpYield: 150, moneyYield: { perutah: 0 },
        desc: "A hot flush that burns away ego."
    },
    'noise_of_distraction': { 
        name: "Tumult", emoji: '📢', type: 'Physical', 
        baseStats: { hp: 80, attack: 20, defense: 20, diligence: 50 }, 
        moves: ['Echo_Blast', 'Drumbeat'], 
        xpYield: 120, moneyYield: { perutah: 10 },
        desc: "The noise of the world that prevented focus."
    },
    'sticky_laziness': { 
        name: "Mire of Sloth", emoji: '🐌', type: 'Physical', 
        baseStats: { hp: 200, attack: 5, defense: 80, diligence: 0 }, 
        moves: ['Adhere', 'Endure'], 
        xpYield: 100, moneyYield: { perutah: 5 },
        desc: "It is hard to leave the mud."
    },
    'fiery_perspiration': { 
        name: "Nahar Dinur Spark", emoji: '🔥', type: 'Gevurah', 
        baseStats: { hp: 150, attack: 60, defense: 20, diligence: 60 }, 
        moves: ['Gevurah_Rebuke', 'Ice_Shard'], 
        xpYield: 300, moneyYield: { perutah: 0 },
        desc: "Sweat of the Hayot caused by the awe of G-d."
    },
    'angel_of_hail': { 
        name: "Yurkami", emoji: '🧊', type: 'Gevurah', 
        baseStats: { hp: 400, attack: 50, defense: 50, diligence: 50 }, 
        moves: ['Ice_Shard', 'Absolute_Zero', 'Harden'], 
        xpYield: 1000, moneyYield: { perutah: 0 },
        desc: "The Angel of Hail. Cools the fires of passion."
    }
};
