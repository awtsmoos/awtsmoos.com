
// B"H
// js/data/maps/maamar/ratzon.js

export const ratzonMaps = {};

for (let i = 1; i <= 18; i++) {
    const id = `ratzon_${i}`;
    const prev = i === 1 ? 'hall_of_mirrors' : `ratzon_${i - 1}`;
    const next = i === 18 ? 'hall_of_mirrors' : `ratzon_${i + 1}`;
    const uuBase = 61568 + (i * 8);
    const uu = (offset) => String.fromCodePoint(uuBase + offset);
    let encounterLevel = 60 + i;

    let baseString = `
☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜✨⬜⬜⬜👑⬜⬜⬜✨⬜⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜✨⬜⬜⬜👑⬜⬜⬜✨⬜⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️`;

    const interactables = {
        'prev': { type: 'door', uu: uu(1), visual: '🚪', emoji: '🚪', targetMap: prev, targetX: 1, targetY: 3, x: 1, y: 3 },
        'next': { type: 'door', uu: uu(2), visual: '🚪', emoji: '🚪', targetMap: next, targetX: 1, targetY: 3, x: 13, y: 3 }
    };

    if (i === 6) {
        interactables['jewel_binah'] = { type: 'npc', uu: uu(4), visual: '💎', emoji: '💎', dialogue: { start: ["You found the Jewel of Binah!", {giveItem: 'jewel_binah'}, {updateQuest: 'maamar_4_ratzon', objectiveId: 'find_jewel_binah'}, "end"] }, x: 7, y: 2 };
        baseString = baseString.replace('👑', '💎');
    }
    if (i === 12) {
        interactables['jewel_chochmah'] = { type: 'npc', emoji: '💡', dialogue: { start: ["You found the Jewel of Chochmah!", {giveItem: 'jewel_chochmah'}, {updateQuest: 'maamar_4_ratzon', objectiveId: 'find_jewel_chochmah'}, "end"] }, x: 7, y: 2 };
        baseString = baseString.replace('👑', '💡');
    }
    if (i === 18) {
        interactables['jewel_keter'] = { type: 'npc', emoji: '👑', dialogue: { start: ["You found the Jewel of Keter!", {giveItem: 'jewel_keter'}, {updateQuest: 'maamar_4_ratzon', objectiveId: 'find_jewel_keter'}, "end"] }, x: 7, y: 2 };
    }

    ratzonMaps[id] = {
        width: 15,
        baseLayerString: baseString,
        encounters: { '⬜': [{ id: 'crown_of_will', levelRange: [encounterLevel, encounterLevel + 2], chance: 0.3 }] },
        interactables: interactables
    };
}
