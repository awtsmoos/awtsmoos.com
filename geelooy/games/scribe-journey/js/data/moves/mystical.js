
// B"H
// js/data/moves/mystical.js

export const mysticalMoves = {
    // --- STATUS ---
    'Harden': { name: 'Harden', power: 0, cost: 5, type: 'Status', effect: { target: 'self', stat: 'defense', amount: 1 }, desc: 'Solidify one\'s form, increasing defense.' },
    'Sway': { name: 'Sway', power: 20, cost: 0, type: 'Netzach', desc: 'A light, evasive strike.' },
    'Root_Bind': { name: 'Root Bind', power: 0, cost: 8, type: 'Netzach', effect: { target: 'opponent', stat: 'diligence', amount: -1 }, desc: 'Entangle the opponent, reducing diligence.' },
    'Mirror_Image': { name: 'Mirror Image', power: 0, cost: 10, type: 'Mystical', effect: { target: 'self', stat: 'diligence', amount: 2 }, desc: 'Create illusions, sharply raising diligence.' },
    'Fade': { name: 'Fade', power: 0, cost: 15, type: 'Status', desc: 'Become briefly harder to hit, raising diligence.', effect: { target: 'self', stat: 'diligence', amount: 2 }},
    'Intervene': { name: 'Intervene', power: 0, cost: 12, type: 'Status', effect: { target: 'opponent', stat: 'defense', amount: -2 }, desc: 'Create a barrier (Chatzitzah) that weakens the opponent\'s defense.' },
    'Adhere': { name: 'Adhere', power: 25, cost: 5, type: 'Status', desc: 'A sticky attack that lowers diligence.'},
    'Analyze': { name: 'Analyze', power: 0, cost: 5, type: 'Status', desc: 'Identify weaknesses.', effect: { target: 'self', stat: 'attack', amount: 1 }},
    'Endure': { name: 'Endure', power: 0, cost: 10, type: 'Netzach', desc: 'Withstand the blow.', effect: { target: 'self', stat: 'defense', amount: 2 }},

    // --- SEFIROTIC ---
    'Shift': { name: 'Shift', power: 30, cost: 5, type: 'Mystical', desc: 'A quick, unpredictable strike.' },
    'Ethereal_Strike': { name: 'Ethereal Strike', power: 55, cost: 12, type: 'Mystical', desc: 'A blow that strikes the concept directly.' },
    'Gevurah_Rebuke': { name: 'Gevurah\'s Rebuke', power: 60, cost: 15, type: 'Gevurah', desc: 'A powerful strike of pure judgment.' },
    'Soothing_Mist': { name: 'Soothing Mist', power: 0, cost: 12, type: 'Chesed', effect: { target: 'self', stat: 'heal', amount: 40 }, desc: 'A gentle mist that restores conceptual integrity.' },
    'Flow': { name: 'Flow', power: 50, cost: 10, type: 'Chesed', desc: 'A yielding but powerful strike.' },
    'Invalidate': { name: 'Invalidate', power: 50, cost: 15, type: 'Chesed', desc: 'A strike using disconnected ("drawn") force, powerful but spiritually flawed.' },
    'Gematria': { name: 'Gematria', power: 90, cost: 25, type: 'Mystical', desc: 'Unleash the numerical truth of a name. Overwhelming power.'},
    'Overgrow': { name: 'Overgrow', power: 40, cost: 8, type: 'Netzach', desc: 'Nature reclaims the space. Continuous pressure.' },
    'Drumbeat': { name: 'Drumbeat', power: 35, cost: 5, type: 'Netzach', desc: 'A rhythmic pulse that disrupts focus.' },
    'Repeat_Cycle': { name: 'Repeat Cycle', power: 30, cost: 2, type: 'Netzach', desc: 'Doing the same thing over and over.' },
    'Circular_Logic': { name: 'Circular Logic', power: 20, cost: 5, type: 'Mystical', desc: 'Traps the mind in a loop. Low damage, but confusing.' },
    'Ice_Shard': { name: 'Ice Shard', power: 55, cost: 12, type: 'Gevurah', desc: 'Cold, hard facts materialized.' },
    'Echo_Blast': { name: 'Echo Blast', power: 45, cost: 10, type: 'Mystical', desc: 'Sound reflected back with force.' },
    'Whisper_Negation': { name: 'Whisper of Negation', power: 45, cost: 10, type: 'Qliphoth', desc: 'An unnerving whisper that drains conviction.' },
    'Chokhmah_Flash': { name: 'Chokhmah Flash', power: 75, cost: 18, type: 'Chokhmah', desc: 'A sudden flash of wisdom that strikes before form fully settles.' },
    'Share_Bounty': { name: 'Share Bounty', power: 0, cost: 12, type: 'Chesed', effect: { target: 'self', stat: 'heal', amount: 35 }, desc: 'Leaves blessing for another and restores the giver.' },
};
