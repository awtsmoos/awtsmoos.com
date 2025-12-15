
// B"H
// js/data/moves/expansion_moves.js

export const expansionMoves = {
    'Roar_of_Torah': { name: 'Roar of Torah', power: 20, cost: 8, type: 'Mystical', effect: { target: 'opponent', stat: 'inflict_status', status: 'stun' }, desc: 'A loud roar that stuns the opponent.' },
    'Silent_Prayer': { name: 'Silent Prayer', power: 0, cost: 5, type: 'Chesed', effect: { target: 'self', stat: 'hp', amount: 30 }, desc: 'Heals self in silence.' },
    'Tzedakah_Toss': { name: 'Tzedakah Toss', power: 30, cost: 2, type: 'Physical', desc: 'Throw coins to deal damage. Costs money!' },
    'Holy_Fire': { name: 'Holy Fire', power: 50, cost: 10, type: 'Gevurah', effect: { target: 'opponent', stat: 'inflict_status', status: 'burn' }, desc: 'Burns the opponent.' },
    'Deep_Waters': { name: 'Deep Waters', power: 40, cost: 8, type: 'Chesed', effect: { target: 'opponent', stat: 'inflict_status', status: 'confuse' }, desc: 'Confuses the opponent with depth.' },
    'Pilpul_Twist': { name: 'Pilpul Twist', power: 30, cost: 5, type: 'Binah', desc: 'Twists the logic. Reverses stats.' },
    'Kushya_Strike': { name: 'Kushya Strike', power: 60, cost: 12, type: 'Binah', desc: 'A difficult question. High critical chance.' },
    'Teirutz_Block': { name: 'Teirutz Block', power: 0, cost: 5, type: 'Binah', effect: { target: 'self', stat: 'defense', amount: 5 }, desc: 'A solid answer. Raises defense sharply.' },
    'Niggun_Song': { name: 'Niggun Song', power: 0, cost: 10, type: 'Netzach', effect: { target: 'self', stat: 'hp_regen' }, desc: 'Heals over time.' },
    'Dance_of_Joy': { name: 'Dance of Joy', power: 0, cost: 5, type: 'Netzach', effect: { target: 'self', stat: 'speed', amount: 2 }, desc: 'Increases speed.' },
    'Maccabee_Smash': { name: 'Maccabee Smash', power: 120, cost: 25, type: 'Physical', desc: 'The hammer blow that shatters idols. Massive damage to Qliphoth.' }
};
