
// B"H
// js/data/moves/digital_moves.js

export const digitalMoves = {
    'Lag_Spike': { name: 'Lag Spike', power: 20, cost: 10, type: 'Mystical', effect: { target: 'opponent', stat: 'inflict_status', status: 'stun' }, desc: 'Freezes the opponent.' },
    'Rage_Quit': { name: 'Rage Quit', power: 0, cost: 0, type: 'Physical', desc: 'Flee battle immediately.' },
    'Spam_Attack': { name: 'Spam', power: 10, cost: 5, type: 'Amalek', desc: 'Hits 3-5 times weakly.' },
    'Nerf_Bat': { name: 'Nerf', power: 30, cost: 10, type: 'Gevurah', effect: { target: 'opponent', stat: 'attack', amount: -5 }, desc: 'Lowers opponent stats.' },
    'Buff_Up': { name: 'Buff Up', power: 0, cost: 10, type: 'Chesed', effect: { target: 'self', stat: 'attack', amount: 5 }, desc: 'Raises own stats.' },
    'Toxic_Chat': { name: 'Toxic Chat', power: 40, cost: 12, type: 'Qliphoth', effect: { target: 'opponent', stat: 'inflict_status', status: 'poison' }, desc: 'Poisonous words.' },
    'DDOS_Wave': { name: 'DDOS', power: 100, cost: 30, type: 'Qliphoth', desc: 'Massive damage, user loses turn.' },
    'Glitch_Out': { name: 'Glitch Out', power: 0, cost: 15, type: 'Mystical', effect: { target: 'self', stat: 'diligence', amount: 50 }, desc: 'Maximizes evasion.' },
    'Micro_Transaction': { name: 'Pay to Win', power: 0, cost: 20, type: 'Physical', effect: { target: 'self', stat: 'hp', amount: 100 }, desc: 'Uses money to heal. (Actually just Kavanah here)' },
    'Download_Ram': { name: 'Download RAM', power: 0, cost: 0, type: 'Mystical', effect: { target: 'self', stat: 'kavanah', amount: 30 }, desc: 'Restores Kavanah from the cloud.' },
    'Permaban': { name: 'Permaban', power: 999, cost: 50, type: 'Gevurah', desc: 'The ultimate judgment. Low accuracy.' },
    'Grief': { name: 'Grief', power: 30, cost: 10, type: 'Qliphoth', effect: { target: 'opponent', stat: 'kavanah', amount: -20 }, desc: 'Drains enemy Kavanah.' },
    'Grind': { name: 'Grind', power: 0, cost: 5, type: 'Netzach', effect: { target: 'self', stat: 'hp_regen' }, desc: 'Slowly restores health.' },
    'Report': { name: 'Report', power: 0, cost: 15, type: 'Gevurah', effect: { target: 'opponent', stat: 'inflict_status', status: 'stun' }, desc: 'Calls the admins.' },
    'Fire_Breath': { name: 'Firewall Breath', power: 65, cost: 16, type: 'Gevurah', effect: { target: 'opponent', stat: 'inflict_status', status: 'burn' }, desc: 'A dragon-like burst from the glowing server furnace.' }
};
