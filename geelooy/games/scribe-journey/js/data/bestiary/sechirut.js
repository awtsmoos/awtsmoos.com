
// B"H
// js/data/bestiary/sechirut.js

export const sechirutBeasts = {
    'spirit_of_negligence': { 
        name: "Spirit of Negligence", emoji: '🤷', type: 'Physical', 
        baseStats: { hp: 60, attack: 10, defense: 5, diligence: 5 }, 
        moves: ['Collapse', 'Sway'], 
        xpYield: 40, moneyYield: { perutah: 0 },
        desc: "A flippant spirit that says 'It's not my fault'."
    },
    'devouring_flame': { 
        name: "Force Majeure", emoji: '🌪️', type: 'Gevurah', 
        baseStats: { hp: 120, attack: 30, defense: 30, diligence: 30 }, 
        moves: ['Gevurah_Rebuke', 'Ice_Shard'], 
        xpYield: 100, moneyYield: { perutah: 0 },
        desc: "An unavoidable accident (Ones). Even a paid guardian is exempt."
    },
    'muzzled_ox': { 
        name: "Muzzled Ox", emoji: '🐮', type: 'Physical', 
        baseStats: { hp: 150, attack: 40, defense: 20, diligence: 10 }, 
        moves: ['Gore', 'Collapse'], 
        xpYield: 80, moneyYield: { perutah: 0 },
        desc: "An ox in pain because it cannot eat while threshing."
    },
    'thief_in_night': { 
        name: "Night Thief", emoji: '🥷', type: 'Physical', 
        baseStats: { hp: 70, attack: 25, defense: 10, diligence: 40 }, 
        moves: ['Peck', 'Shift'], 
        xpYield: 60, moneyYield: { perutah: 200 },
        desc: "Steals from guardians. A Paid Guardian must pay for this."
    }
};
