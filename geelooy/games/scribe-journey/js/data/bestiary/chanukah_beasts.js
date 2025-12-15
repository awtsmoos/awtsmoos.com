
// B"H
// js/data/bestiary/chanukah_beasts.js

export const chanukahBeasts = {
    'hellenist_guard': { 
        name: "Hellenist Guard", emoji: '🗡️', type: 'Physical', 
        baseStats: { hp: 100, attack: 25, defense: 20, diligence: 10 }, 
        moves: ['Pummel', 'Iron_Grip'], 
        xpYield: 80, moneyYield: { perutah: 50 },
        desc: "A soldier enforcing foreign laws."
    },
    'war_elephant': { 
        name: "Greek War Elephant", emoji: '🐘', type: 'Physical', 
        baseStats: { hp: 300, attack: 40, defense: 40, diligence: 5 }, 
        moves: ['Collapse', 'Zealous_Rush'], 
        xpYield: 250, moneyYield: { perutah: 0 },
        desc: "A massive beast of war. Terrifying."
    },
    'oil_elemental': { 
        name: "Shemen Spirit", emoji: '🏺', type: 'Chesed', 
        baseStats: { hp: 60, attack: 15, defense: 10, diligence: 30 }, 
        moves: ['Flow', 'Soothing_Mist'], 
        xpYield: 60, moneyYield: { perutah: 100 },
        desc: "Living oil, seeking a wick."
    },
    'darkness_creeper': { 
        name: "Yevani Darkness", emoji: '🌑', type: 'Qliphoth', 
        baseStats: { hp: 80, attack: 20, defense: 5, diligence: 20 }, 
        moves: ['Whisper_Negation', 'Fade'], 
        xpYield: 70, moneyYield: { perutah: 20 },
        desc: "The spiritual darkness of Greece."
    }
};
