
// B"H
// js/data/maps/binah_50_gates.js

export const binahGatesMaps = {};

const GATE_SIZE = 12;

for (let i = 1; i <= 50; i++) {
    const id = `binah_gate_${i}`;
    const next = i === 50 ? 'keter_heights' : `binah_gate_${i + 1}`;
    const prev = i === 1 ? 'binah_upper' : `binah_gate_${i - 1}`;
    const uuBase = 0xF500 + (i * 8);
    const uu = (offset) => String.fromCodePoint(uuBase + offset);
    
    // Procedural decoration based on level depth
    let wall = '🧱';
    if(i > 15) wall = '🧊'; // Ice for logic
    if(i > 30) wall = '💎'; // Crystal for clarity
    if(i > 45) wall = '☁️'; // Cloud for abstraction

    let mob = 'deductive_reasoning';
    if(i > 10) mob = 'structural_limit';
    if(i > 25) mob = 'mother_of_form';
    if(i > 40) mob = 'silent_aleph';

    const baseString = `
${wall.repeat(GATE_SIZE)}
${wall}🚪${'⬜'.repeat(GATE_SIZE-4)}🚪${wall}
${wall}⬜${'⬜'.repeat(GATE_SIZE-4)}⬜${wall}
${wall}⬜${'⬜'.repeat(GATE_SIZE-4)}⬜${wall}
${wall}⬜⬜⚠️⬜⬜⚠️⬜⬜${wall}
${wall}⬜${'⬜'.repeat(GATE_SIZE-4)}⬜${wall}
${wall}⬜${'⬜'.repeat(GATE_SIZE-4)}⬜${wall}
${wall.repeat(GATE_SIZE)}
    `;

    binahGatesMaps[id] = {
        width: GATE_SIZE,
        baseLayerString: baseString,
        encounters: {
            '⚠️': [
                { id: mob, levelRange: [40 + i, 45 + i], chance: 0.5 },
                { id: 'paradox_loop', levelRange: [35 + i, 40 + i], chance: 0.3 }
            ]
        },
        interactables: {
            'prev': { type: 'door', uu: uu(1), visual: '🚪', emoji: '🚪', targetMap: prev, targetX: 2, targetY: 2, x: 1, y: 1 },
            'next': { type: 'door', uu: uu(2), visual: '🚪', emoji: '🚪', targetMap: next, targetX: 1, targetY: 1, x: GATE_SIZE-2, y: 1 },
            'gate_marker': { 
                type: 'npc', uu: uu(3), visual: '🔢', emoji: '🔢', 
                x: Math.floor(GATE_SIZE/2), y: Math.floor(GATE_SIZE/2),
                dialogue: { start: [`(Gate ${i} of Understanding).`] }
            }
        }
    };
    
    // Inject special boss every 10 levels
    if (i % 10 === 0) {
        binahGatesMaps[id].interactables['boss'] = {
            type: 'npc', uu: uu(4), visual: '🦁', emoji: '🦁', x: 5, y: 5,
            dialogue: { start: [`Guardian of Gate ${i}. Prove your logic!`, {startBattle: [{id: 'royal_lion', level: 50 + i}]}] }
        };
        binahGatesMaps[id].baseLayerString = binahGatesMaps[id].baseLayerString.replace('⚠️', '🦁');
    }
}
