
// B"H
// js/data/maps/aleph_bet.js

export const alephBetMaps = {};

const letters = ['aleph', 'bet', 'gimel', 'dalet', 'hei', 'vav', 'zayin']; 
const emojis = ['🅰️', '🅱️', '🚶', '🚪', '😮', '⚓', '🗡️'];

for (let i = 0; i < letters.length; i++) {
    const letter = letters[i];
    const emoji = emojis[i];
    const id = `tower_${letter}`;
    const next = i === letters.length - 1 ? 'malkuth_village' : `tower_${letters[i+1]}`;
    const prev = i === 0 ? 'malkuth_village' : `tower_${letters[i-1]}`;
    
    alephBetMaps[id] = {
        width: 15,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜${emoji}⬜⬜${emoji}⬜⬜${emoji}⬜⬜${emoji}⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜⚠️⬜⬜⬜⚠️⬜⬜⬜⚠️⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🚪🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        encounters: {
            '⚠️': [{ id: `letter_${letter}_mob`, levelRange: [20 + i*5, 25 + i*5], chance: 0.5 }]
        },
        interactables: {
            'prev': { type: 'door', emoji: '🚪', targetMap: prev, targetX: 7, targetY: 6, x: 1, y: 6 },
            'next': { type: 'door', emoji: '🚪', targetMap: next, targetX: 1, targetY: 6, x: 13, y: 6 }
        }
    };
}
