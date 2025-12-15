
// B"H
// js/data/moves/letters.js

export const letterMoves = {
    'Aleph_Breath': { name: 'Aleph Breath', power: 0, cost: 20, type: 'Keter', effect: { target: 'opponent', stat: 'inflict_status', status: 'silence' }, desc: 'The soundless sound. Silences opponent.' },
    'Bet_House': { name: 'Bet House', power: 0, cost: 10, type: 'Binah', effect: { target: 'self', stat: 'defense', amount: 10 }, desc: 'Builds a structure. Defense up.' },
    'Gimel_Run': { name: 'Gimel Run', power: 30, cost: 5, type: 'Chesed', desc: 'Running to bestow kindness.' },
    'Dalet_Door': { name: 'Dalet Door', power: 0, cost: 5, type: 'Malkuth', effect: { target: 'opponent', stat: 'defense', amount: -5 }, desc: 'Opens the defense.' },
    'Hei_Expression': { name: 'Hei Breath', power: 20, cost: 5, type: 'Binah', desc: 'The breath of speech.' },
    'Vav_Connect': { name: 'Vav Hook', power: 25, cost: 5, type: 'Tiferet', desc: 'Connects heaven and earth.' },
    'Zayin_Strike': { name: 'Zayin Sword', power: 60, cost: 12, type: 'Gevurah', desc: 'A sharp, crowned strike.' }
};
