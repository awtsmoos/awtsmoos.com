
// B"H
// js/data/bestiary/tanya.js

export const tanyaBeasts = {
    'arrogance_spirit': { 
        name: "Spirit of Yeshut", emoji: '😤', type: 'Kelipah', 
        baseStats: { hp: 100, attack: 30, defense: 30, diligence: 10 }, 
        moves: ['Harden', 'Pummel'], 
        xpYield: 120, moneyYield: { perutah: 50 },
        desc: "The ego that insists on its own existence apart from G-d."
    },
    'depression_cloud': { 
        name: "Timtum HaLev", emoji: '🌫️', type: 'Kelipah', 
        baseStats: { hp: 150, attack: 10, defense: 50, diligence: 5 }, 
        moves: ['Whisper_Negation', 'Collapse'], 
        xpYield: 100, moneyYield: { perutah: 20 },
        desc: "Dullness of the heart. Prevents the emotion of holiness."
    },
    'gross_pride': { 
        name: "Gross Pride", emoji: '🦍', type: 'Kelipah', 
        baseStats: { hp: 250, attack: 50, defense: 20, diligence: 20 }, 
        moves: ['Zealous_Rush', 'Gore'], 
        xpYield: 300, moneyYield: { perutah: 200 },
        desc: "The coarsest form of ego."
    },
    'kelipat_nogah_beast': { 
        name: "Kelipat Nogah", emoji: '🐗', type: 'Kelipah', 
        baseStats: { hp: 350, attack: 40, defense: 40, diligence: 40 }, 
        moves: ['Adhere', 'Shift'], 
        xpYield: 500, moneyYield: { perutah: 0 },
        desc: "The shining shell. A mix of good and evil. Tricky to defeat."
    },
    'burning_love': { 
        name: "Ahava Raba", emoji: '🔥', type: 'Kedushah', 
        baseStats: { hp: 120, attack: 60, defense: 10, diligence: 50 }, 
        moves: ['Gevurah_Rebuke', 'Flow'], 
        xpYield: 200, moneyYield: { perutah: 0 },
        desc: "A fiery love of G-d that consumes the ego."
    }
};
