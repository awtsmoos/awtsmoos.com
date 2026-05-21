
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
    const uuBase = 0xFD00 + (i * 8);
    const uu = (offset) => String.fromCodePoint(uuBase + offset);
    
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
            'prev': { type: 'door', uu: uu(1), visual: '🚪', emoji: '🚪', targetMap: prev, targetX: 7, targetY: 6, x: 1, y: 6 },
            'next': { type: 'door', uu: uu(2), visual: '🚪', emoji: '🚪', targetMap: next, targetX: 1, targetY: 6, x: 13, y: 6 }
        }
    };
}
