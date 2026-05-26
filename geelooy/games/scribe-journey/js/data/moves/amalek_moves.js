
// B"H
// js/data/moves/amalek_moves.js

export const amalekMoves = {
    'Mockery': { name: 'Mockery', power: 0, cost: 5, type: 'Amalek', effect: { target: 'opponent', stat: 'kavanah', amount: -10 }, desc: 'Laughs at your efforts. Drains 10 Kavanah.' },
    'Cold_Bath': { name: 'Cold Bath', power: 0, cost: 10, type: 'Amalek', effect: { target: 'opponent', stat: 'kavanah', amount: -20 }, desc: 'Cools off your fiery enthusiasm. Drains 20 Kavanah.' },
    'Cool_Down': { name: 'Cool Down', power: 0, cost: 0, type: 'Amalek', effect: { target: 'opponent', stat: 'attack', amount: -2 }, desc: 'Lowers opponent Attack by reducing their passion.' },
    'Logical_Fallacy': { name: 'Logical Fallacy', power: 10, cost: 5, type: 'Amalek', desc: 'A confusing argument that deals light damage but confuses.' },
    'Coin_Flip': { name: 'Coin Flip', power: 30, cost: 0, type: 'Amalek', desc: 'Random damage. It just happened.' },
    'Absolute_Zero': { name: 'Absolute Zero', power: 70, cost: 18, type: 'Amalek', effect: { target: 'opponent', stat: 'kavanah', amount: -25 }, desc: 'Cools holy fire to the edge of silence.' },
    'Chaos_Theory': { name: 'Chaos Theory', power: 55, cost: 14, type: 'Amalek', effect: { target: 'opponent', stat: 'inflict_status', status: 'confuse' }, desc: 'Turns certainty into noise.' },
};
