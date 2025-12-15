
// B"H
// js/data/bestiary/taryag_beasts.js

export const taryagBeasts = {
    'sinat_chinam': { 
        name: "Baseless Hatred", emoji: '💔', type: 'Kelipah', 
        baseStats: { hp: 300, attack: 40, defense: 40, diligence: 10 }, 
        moves: ['Whisper_Negation', 'Collapse'], 
        xpYield: 400, moneyYield: { perutah: 0 },
        desc: "Destroys the Temple. Hard to defeat."
    },
    'lashon_hara_snake': { 
        name: "Tongue of Evil", emoji: '👅', type: 'Qliphoth', 
        baseStats: { hp: 150, attack: 50, defense: 20, diligence: 60 }, 
        moves: ['Adhere', 'Peck'], 
        xpYield: 200, moneyYield: { perutah: 50 },
        desc: "Kills three people at once: the speaker, the listener, and the victim."
    },
    'golden_calf_idol': { 
        name: "Egel HaZahav", emoji: '🐂', type: 'Qliphoth', 
        baseStats: { hp: 500, attack: 60, defense: 60, diligence: 0 }, 
        moves: ['Mockery', 'Cold_Bath'], 
        xpYield: 1000, moneyYield: { perutah: 3000 }, // Dropping gold
        desc: "The ultimate distraction."
    },
    'false_prophet': { 
        name: "False Prophet", emoji: '🎭', type: 'Amalek', 
        baseStats: { hp: 200, attack: 10, defense: 10, diligence: 80 }, 
        moves: ['Logical_Fallacy', 'Coin_Flip'], 
        xpYield: 250, moneyYield: { perutah: 100 },
        desc: "Speaks lies in the name of truth."
    },
    'amalek_raider': { 
        name: "Amalek Raider", emoji: '⚔️', type: 'Amalek', 
        baseStats: { hp: 120, attack: 40, defense: 20, diligence: 20 }, 
        moves: ['Cold_Bath', 'Pummel'], 
        xpYield: 150, moneyYield: { perutah: 20 },
        desc: "Attacks the weak and stragglers."
    }
};
