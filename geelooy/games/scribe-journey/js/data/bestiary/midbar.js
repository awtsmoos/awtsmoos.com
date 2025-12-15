
// B"H
// js/data/bestiary/midbar.js

export const midbarBeasts = {
    'desert_scorpion': { 
        name: "Scorpion of Zin", emoji: '🦂', type: 'Physical', 
        baseStats: { hp: 100, attack: 35, defense: 30, diligence: 10 }, 
        moves: ['Iron_Grip', 'Adhere'], 
        xpYield: 120, moneyYield: { perutah: 10 },
        desc: "A cold danger in a hot land."
    },
    'fiery_serpent': { 
        name: "Saraph Serpent", emoji: '🐍', type: 'Gevurah', 
        baseStats: { hp: 130, attack: 45, defense: 10, diligence: 40 }, 
        moves: ['Propel_Stones', 'Gevurah_Rebuke'], 
        xpYield: 150, moneyYield: { perutah: 0 },
        desc: "Its bite burns like fire. Punishment for complaints."
    },
    'golden_calf_remnant': { 
        name: "Egel Fragment", emoji: '🐮', type: 'Kelipah', 
        baseStats: { hp: 200, attack: 20, defense: 60, diligence: 0 }, 
        moves: ['Mockery', 'Endure'], 
        xpYield: 300, moneyYield: { perutah: 500 },
        desc: "A lingering thought of idolatry."
    }
};
