
// B"H
// js/data/bestiary/digital.js

export const digitalBeasts = {
    'lag_golem': { 
        name: "Lag Golem", emoji: '⏳', type: 'Physical', 
        baseStats: { hp: 300, attack: 50, defense: 80, diligence: 0 }, 
        moves: ['Lag_Spike', 'Harden'], 
        xpYield: 200, moneyYield: { perutah: 10 },
        desc: "A golem made of frozen frames. Moves very slowly."
    },
    'spam_bot': { 
        name: "Spam Bot", emoji: '🤖', type: 'Amalek', 
        baseStats: { hp: 50, attack: 10, defense: 10, diligence: 100 }, 
        moves: ['Spam_Attack', 'Mockery'], 
        xpYield: 50, moneyYield: { perutah: 1 },
        desc: "Repeats the same thing forever."
    },
    'troll_bridge': { 
        name: "Internet Troll", emoji: '👺', type: 'Kelipah', 
        baseStats: { hp: 200, attack: 40, defense: 40, diligence: 30 }, 
        moves: ['Toxic_Chat', 'Grief'], 
        xpYield: 150, moneyYield: { perutah: 0 },
        desc: "Feeds on your anger."
    },
    'glitch_ghost': { 
        name: "MissingNo", emoji: '👾', type: 'Qliphoth', 
        baseStats: { hp: 100, attack: 60, defense: 0, diligence: 80 }, 
        moves: ['Glitch_Out', 'Fade'], 
        xpYield: 300, moneyYield: { perutah: 100 },
        desc: "A hole in reality."
    },
    'noob_saibot': { 
        name: "New Player", emoji: '👶', type: 'Physical', 
        baseStats: { hp: 30, attack: 5, defense: 5, diligence: 10 }, 
        moves: ['Peck'], 
        xpYield: 10, moneyYield: { perutah: 5 },
        desc: "Just started the game. Be nice."
    },
    'elite_gatekeeper': { 
        name: "Elitist", emoji: '💂', type: 'Gevurah', 
        baseStats: { hp: 250, attack: 50, defense: 50, diligence: 40 }, 
        moves: ['Nerf_Bat', 'Report'], 
        xpYield: 250, moneyYield: { perutah: 50 },
        desc: "You aren't high enough level for this."
    },
    'gold_farmer': { 
        name: "Gold Farmer", emoji: '🚜', type: 'Netzach', 
        baseStats: { hp: 100, attack: 10, defense: 20, diligence: 90 }, 
        moves: ['Rage_Quit', 'Micro_Transaction'], 
        xpYield: 100, moneyYield: { perutah: 500 },
        desc: "Here for the money."
    },
    'server_crash': { 
        name: "Server Crash", emoji: '📉', type: 'Qliphoth', 
        baseStats: { hp: 500, attack: 100, defense: 10, diligence: 10 }, 
        moves: ['DDOS_Wave', 'Permaban'], 
        xpYield: 1000, moneyYield: { perutah: 0 },
        desc: "The end of the world."
    },
    'afk_statue': { 
        name: "AFK Player", emoji: '💤', type: 'Physical', 
        baseStats: { hp: 400, attack: 0, defense: 100, diligence: 0 }, 
        moves: ['Grind', 'Endure'], 
        xpYield: 50, moneyYield: { perutah: 50 },
        desc: "Away From Keyboard. Just standing there."
    },
    'flamer_spirit': { 
        name: "Flamer", emoji: '🔥', type: 'Gevurah', 
        baseStats: { hp: 120, attack: 60, defense: 20, diligence: 50 }, 
        moves: ['Toxic_Chat', 'Fire_Breath'], 
        xpYield: 150, moneyYield: { perutah: 20 },
        desc: "Full of hot rage."
    },
    'loot_box_mimic': { 
        name: "Loot Box", emoji: '🎁', type: 'Kelipah', 
        baseStats: { hp: 150, attack: 40, defense: 40, diligence: 30 }, 
        moves: ['Micro_Transaction', 'Iron_Grip'], 
        xpYield: 200, moneyYield: { perutah: 1000 },
        desc: "Surprise mechanics!"
    }
};
