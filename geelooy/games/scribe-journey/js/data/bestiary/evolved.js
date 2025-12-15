
// B"H
// js/data/bestiary/evolved.js

export const evolvedBeasts = {
    'stone_guardian': { 
        name: "Stone Guardian", emoji: '🗿', type: 'Physical', 
        baseStats: { hp: 120, attack: 30, defense: 40, diligence: 20 }, 
        moves: ['Collapse', 'Harden', 'Iron_Grip'], 
        xpYield: 50, moneyYield: { perutah: 30 } 
    },
    'temple_pillar': { 
        name: "Pillar of Boaz", emoji: '🏛️', type: 'Kedushah', 
        baseStats: { hp: 250, attack: 50, defense: 80, diligence: 50 }, 
        moves: ['Harden', 'Echo_Blast', 'Endure'], 
        xpYield: 200, moneyYield: { perutah: 100 } 
    },
    'sand_storm': {
        name: "Sandstorm", emoji: '🌪️', type: 'Netzach',
        baseStats: { hp: 80, attack: 25, defense: 25, diligence: 40 },
        moves: ['Propel_Stones', 'Sway'],
        xpYield: 40, moneyYield: { perutah: 10 }
    },
    'ocean_of_wisdom': {
        name: "Ocean of Binah", emoji: '🌊', type: 'Binah',
        baseStats: { hp: 300, attack: 60, defense: 60, diligence: 60 },
        moves: ['Flow', 'Deep_Waters', 'Kushya_Strike'],
        xpYield: 300, moneyYield: { perutah: 200 }
    },
    'great_leviathan': {
        name: "Leviathan", emoji: '🐋', type: 'Chesed',
        baseStats: { hp: 500, attack: 80, defense: 80, diligence: 20 },
        moves: ['Flow', 'Deep_Waters', 'Roar_of_Torah'],
        xpYield: 1000, moneyYield: { perutah: 500 }
    }
};
