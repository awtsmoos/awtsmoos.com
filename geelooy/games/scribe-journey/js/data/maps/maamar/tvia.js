
// B"H
// js/data/maps/maamar/tvia.js

export const tviaMaps = {};

for (let i = 1; i <= 18; i++) {
    const id = `tvia_${i}`;
    const prev = i === 1 ? 'hall_of_mirrors' : `tvia_${i - 1}`;
    const next = i === 18 ? 'hall_of_mirrors' : `tvia_${i + 1}`;
    const uuBase = 61312 + (i * 8);
    const uu = (offset) => String.fromCodePoint(uuBase + offset);
    let encounterLevel = 40 + i;
    
    let baseString = `
🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊
🌊⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌊
🌊⬜💧⬜💧⬜💧⬜💧⬜💧⬜💧⬜🌊
🌊⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌊
🌊⬜💧⬜💧⬜💧⬜💧⬜💧⬜💧⬜🌊
🌊⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌊
🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊`;

    const interactables = {
        'prev': { type: 'door', uu: uu(1), visual: '🚪', emoji: '🚪', targetMap: prev, targetX: 2, targetY: 3, x: 1, y: 3 },
        'next': { type: 'door', uu: uu(2), visual: '🚪', emoji: '🚪', targetMap: next, targetX: 1, targetY: 3, x: 13, y: 3 },
        'marker': { type: 'npc', uu: uu(3), visual: '🐙', emoji: '🐙', dialogue: { start: [`(Depth Level ${i})`] }, x: 7, y: 3 }
    };

    // Quest Items
    if (i === 5) {
        interactables['helmet'] = { type: 'npc', uu: uu(4), visual: '⛑️', emoji: '⛑️', dialogue: { start: ["You found the Diving Helmet!", {giveItem: 'diving_helmet'}, {updateQuest: 'maamar_2_tvia', objectiveId: 'find_helmet'}, "end"] }, x: 7, y: 1 };
        baseString = baseString.replace('🌊⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌊', '🌊⬜⬜⬜⬜⬜⛑️⬜⬜⬜⬜⬜⬜🌊');
    }
    if (i === 10) {
        interactables['suit'] = { type: 'npc', uu: uu(4), visual: '👕', emoji: '👕', dialogue: { start: ["You found the Diving Suit!", {giveItem: 'diving_suit'}, {updateQuest: 'maamar_2_tvia', objectiveId: 'find_suit'}, "end"] }, x: 7, y: 1 };
        baseString = baseString.replace('🌊⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌊', '🌊⬜⬜⬜⬜⬜👕⬜⬜⬜⬜⬜⬜🌊');
    }
    if (i === 15) {
        interactables['tank'] = { type: 'npc', uu: uu(4), visual: '🎒', emoji: '🎒', dialogue: { start: ["You found the Tank of Emunah!", {giveItem: 'oxygen_tank_emunah'}, {updateQuest: 'maamar_2_tvia', objectiveId: 'find_tank'}, "end"] }, x: 7, y: 1 };
        baseString = baseString.replace('🌊⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🌊', '🌊⬜⬜⬜⬜⬜🎒⬜⬜⬜⬜⬜⬜🌊');
    }
    if (i === 18) {
         interactables['abyss'] = { type: 'npc', emoji: '⚓', dialogue: { start: ["You have reached the bottom. The waters are One.", {updateQuest: 'maamar_2_tvia', objectiveId: 'reach_bottom'}, "end"] }, x: 7, y: 4 };
    }

    tviaMaps[id] = {
        width: 15,
        baseLayerString: baseString,
        encounters: {
            '⬜': [{ id: 'benevolent_stream', levelRange: [encounterLevel, encounterLevel + 3], chance: 0.4 }]
        },
        interactables: interactables
    };
}
