
// B"H
// js/data/maps/maamar/dibbur.js

export const dibburMaps = {};

for (let i = 1; i <= 18; i++) {
    const id = `dibbur_${i}`;
    const prev = i === 1 ? 'hall_of_mirrors' : `dibbur_${i - 1}`;
    const next = i === 18 ? 'hall_of_mirrors' : `dibbur_${i + 1}`;
    const uuBase = 61440 + (i * 8);
    const uu = (offset) => String.fromCodePoint(uuBase + offset);
    let encounterLevel = 50 + i;

    let baseString = `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱🗣️🗣️🗣️🗣️🗣️🗣️🗣️🗣️🗣️🗣️🗣️🗣️🗣️🧱
🧱🗣️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🗣️🧱
🧱🗣️⬜🔤⬜⬜⬜📜⬜⬜⬜🔤⬜🗣️🧱
🧱🗣️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🗣️🧱
🧱🗣️🗣️🗣️🗣️🗣️🗣️🗣️🗣️🗣️🗣️🗣️🗣️🗣️🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱`;

    const interactables = {
        'prev': { type: 'door', uu: uu(1), visual: '🚪', emoji: '🚪', targetMap: prev, targetX: 1, targetY: 3, x: 1, y: 3 },
        'next': { type: 'door', uu: uu(2), visual: '🚪', emoji: '🚪', targetMap: next, targetX: 1, targetY: 3, x: 13, y: 3 }
    };

    if (i === 3) {
        interactables['aleph'] = { type: 'npc', emoji: '🅰️', dialogue: { start: ["You found the Letter Aleph!", {giveItem: 'letter_aleph'}, {updateQuest: 'maamar_3_dibbur', objectiveId: 'find_aleph'}, "end"] }, x: 7, y: 3 };
        baseString = baseString.replace('📜', '🅰️');
    }
    if (i === 9) {
        interactables['mem'] = { type: 'npc', emoji: 'Ⓜ️', dialogue: { start: ["You found the Letter Mem!", {giveItem: 'letter_mem'}, {updateQuest: 'maamar_3_dibbur', objectiveId: 'find_mem'}, "end"] }, x: 7, y: 3 };
        baseString = baseString.replace('📜', 'Ⓜ️');
    }
    if (i === 15) {
        interactables['shin'] = { type: 'npc', emoji: '🔥', dialogue: { start: ["You found the Letter Shin!", {giveItem: 'letter_shin'}, {updateQuest: 'maamar_3_dibbur', objectiveId: 'find_shin'}, "end"] }, x: 7, y: 3 };
        baseString = baseString.replace('📜', '🔥');
    }
    if (i === 18) {
        interactables['unification'] = { type: 'npc', emoji: '🗣️', dialogue: { start: ["Speak the Word. Restore the vessels.", {updateQuest: 'maamar_3_dibbur', objectiveId: 'restore_speech'}, "end"] }, x: 7, y: 2 };
    }

    dibburMaps[id] = {
        width: 15,
        baseLayerString: baseString,
        encounters: { '⬜': [{ id: 'obsidian_golem', levelRange: [encounterLevel, encounterLevel + 2], chance: 0.3 }] },
        interactables: interactables
    };
}
