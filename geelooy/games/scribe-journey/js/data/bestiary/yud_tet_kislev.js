
// B"H
// js/data/bestiary/yud_tet_kislev.js

export const yudTetBeasts = {
    'daat_elyon': { 
        name: "Daat Elyon", emoji: '👁️', type: 'Keter', 
        baseStats: { hp: 150, attack: 50, defense: 10, diligence: 50 }, 
        moves: ['Ethereal_Strike', 'Fade', 'Whisper_Negation'], 
        xpYield: 200, moneyYield: { perutah: 0 },
        desc: "The Higher Knowledge. It sees 'Yesh' above and 'Ayin' below. To it, the world does not exist."
    },
    'daat_tachton': { 
        name: "Daat Tachton", emoji: '🌍', type: 'Malkuth', 
        baseStats: { hp: 200, attack: 20, defense: 60, diligence: 20 }, 
        moves: ['Harden', 'Root_Bind', 'Collapse'], 
        xpYield: 200, moneyYield: { perutah: 100 },
        desc: "The Lower Knowledge. It sees 'Ayin' above and 'Yesh' below. To it, the creation is a solid reality."
    },
    'teva_mask': { 
        name: "Teva (Nature)", emoji: '🎭', type: 'Gevurah', 
        baseStats: { hp: 100, attack: 30, defense: 30, diligence: 30 }, 
        moves: ['Gevurah_Rebuke', 'Circular_Logic'], 
        xpYield: 120, moneyYield: { perutah: 86 }, // Gematria Elokim
        desc: "Gematria 'Elokim'. A constant miracle disguised as natural law."
    },
    'nes_glory': { 
        name: "Nes (Miracle)", emoji: '⚡', type: 'Chokhmah', 
        baseStats: { hp: 80, attack: 45, defense: 10, diligence: 40 }, 
        moves: ['Chokhmah_Flash', 'Flow'], 
        xpYield: 150, moneyYield: { perutah: 26 }, // Gematria Havayah
        desc: "The revelation of the Name Havayah. Breaks the limits of nature."
    },
    'atzmus_spark': {
        name: "Spark of Atzmus", emoji: '✡️', type: 'Keter',
        baseStats: { hp: 300, attack: 40, defense: 40, diligence: 40 },
        moves: ['Flow', 'Gematria'],
        xpYield: 500, moneyYield: { perutah: 5715 },
        desc: "The Essence that unites opposites. 'You are One, but not in calculation.'"
    }
};
