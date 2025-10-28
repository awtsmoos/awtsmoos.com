// B"H
// js/data/moves.js

export const moves = {
    // --- PHYSICAL ---
    'Pummel': { name: 'Pummel', power: 40, cost: 0, type: 'Physical', desc: 'A straightforward physical blow.' },
    'Gore': { name: 'Gore', power: 50, cost: 8, type: 'Physical', desc: 'A piercing attack with horns. An act that is not its usual nature (Shinui).' },
    'Peck': { name: 'Peck', power: 30, cost: 0, type: 'Physical', desc: 'A quick, sharp strike.' },
    'Collapse': { name: 'Collapse', power: 60, cost: 10, type: 'Physical', desc: 'A heavy, unavoidable impact, like falling into a pit.' },

    // --- STATUS & TACTICAL ---
    'Harden': { name: 'Harden', power: 0, cost: 5, type: 'Status', effect: { target: 'self', stat: 'defense', amount: 1 }, desc: 'Solidify one\'s form, increasing defense.' },
    'Sway': { name: 'Sway', power: 20, cost: 0, type: 'Netzach', desc: 'A light, evasive strike.' },
    'Root_Bind': { name: 'Root Bind', power: 0, cost: 8, type: 'Netzach', effect: { target: 'opponent', stat: 'diligence', amount: -1 }, desc: 'Entangle the opponent, reducing diligence.' },
    'Mirror_Image': { name: 'Mirror Image', power: 0, cost: 10, type: 'Mystical', effect: { target: 'self', stat: 'diligence', amount: 2 }, desc: 'Create illusions, sharply raising diligence.' },
    'Fade': { name: 'Fade', power: 0, cost: 15, type: 'Status', desc: 'Become briefly harder to hit, raising diligence.', effect: { target: 'self', stat: 'diligence', amount: 2 }},
    'Intervene': { name: 'Intervene', power: 0, cost: 12, type: 'Status', effect: { target: 'opponent', stat: 'defense', amount: -2 }, desc: 'Create a barrier (Chatzitzah) that weakens the opponent\'s defense.' },
    'Adhere': { name: 'Adhere', power: 25, cost: 5, type: 'Status', desc: 'A sticky attack that lowers diligence.'},

    // --- MYSTICAL & SEFIROTIC ---
    'Shift': { name: 'Shift', power: 30, cost: 5, type: 'Mystical', desc: 'A quick, unpredictable strike.' },
    'Ethereal_Strike': { name: 'Ethereal Strike', power: 55, cost: 12, type: 'Mystical', desc: 'A blow that strikes the concept directly.' },
    'Gevurah_Rebuke': { name: 'Gevurah\'s Rebuke', power: 60, cost: 15, type: 'Gevurah', desc: 'A powerful strike of pure judgment.' },
    'Soothing_Mist': { name: 'Soothing Mist', power: 0, cost: 12, type: 'Chesed', effect: { target: 'self', stat: 'heal', amount: 40 }, desc: 'A gentle mist that restores conceptual integrity.' },
    'Flow': { name: 'Flow', power: 50, cost: 10, type: 'Chesed', desc: 'A yielding but powerful strike.' },
    'Invalidate': { name: 'Invalidate', power: 50, cost: 15, type: 'Chesed', desc: 'A strike using disconnected ("drawn") force, powerful but spiritually flawed.' },

    // --- QLIPHOTH & SPECIAL ---
    'Whisper_Negation': { name: 'Whisper of Negation', power: 45, cost: 10, type: 'Qliphoth', desc: 'An unnerving whisper that drains conviction.' },
    'Propel_Stones': { name: 'Propel Stones', power: 25, cost: 4, type: 'Physical', desc: 'Indirect damage (Toldah), less potent but harder to avoid.' },
};


