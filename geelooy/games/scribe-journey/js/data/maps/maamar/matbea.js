
// B"H
// js/data/maps/maamar/matbea.js

export const matbeaMaps = {};

// The Mint of Nature
for (let i = 1; i <= 18; i++) {
    const id = `matbea_${i}`;
    const prev = i === 1 ? 'hall_of_mirrors' : `matbea_${i - 1}`;
    const next = i === 18 ? 'hall_of_mirrors' : `matbea_${i + 1}`;
    let encounterLevel = 30 + i;
    const uuBase = 61184 + (i * 8);
    const uu = (offset) => String.fromCodePoint(uuBase + offset);
    
    // Default Layout
    let baseString = `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️🧱
🧱⚙️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⚙️🧱
🧱⚙️⬜💰⬜⬜🤖⬜⬜💰⬜⬜⚙️🧱
🧱⚙️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⚙️🧱
🧱⚙️⬜⬜⬜⬜🪙⬜⬜⬜⬜⬜⬜⚙️🧱
🧱⚙️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⚙️🧱
🧱⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱`;

    const interactables = {
        'prev': { type: 'door', uu: uu(1), visual: '🚪', emoji: '🚪', targetMap: prev, targetX: i === 1 ? 10 : 1, targetY: i === 1 ? 5 : 5, x: 1, y: 4 },
        'next': { type: 'door', uu: uu(2), visual: '🚪', emoji: '🚪', targetMap: next, targetX: 1, targetY: 4, x: 13, y: 4 },
        'sign': { type: 'npc', uu: uu(3), visual: '🪙', emoji: '🪙', dialogue: { start: [`(Minting Chamber ${i})`] }, x: 7, y: 4 }
    };

    // --- QUEST ITEM INJECTIONS (Manual Overrides) ---
    // Level 4: Coin of Fire
    if (i === 4) {
        interactables['quest_item'] = { type: 'npc', uu: uu(4), visual: '🔥', emoji: '🔥', dialogue: { start: ["You found the Coin of Fire!", {giveItem: 'coin_of_fire'}, {updateQuest: 'maamar_1_matbea', objectiveId: 'find_coin_fire'}, "end"] }, x: 7, y: 2 };
        baseString = baseString.replace('⬜🪙⬜', '⬜🔥⬜');
    }
    // Level 8: Coin of Water
    if (i === 8) {
        interactables['quest_item'] = { type: 'npc', uu: uu(4), visual: '💧', emoji: '💧', dialogue: { start: ["You found the Coin of Water!", {giveItem: 'coin_of_water'}, {updateQuest: 'maamar_1_matbea', objectiveId: 'find_coin_water'}, "end"] }, x: 7, y: 2 };
        baseString = baseString.replace('⬜🪙⬜', '⬜💧⬜');
    }
    // Level 12: Coin of Wind
    if (i === 12) {
        interactables['quest_item'] = { type: 'npc', uu: uu(4), visual: '🌪️', emoji: '🌪️', dialogue: { start: ["You found the Coin of Wind!", {giveItem: 'coin_of_wind'}, {updateQuest: 'maamar_1_matbea', objectiveId: 'find_coin_wind'}, "end"] }, x: 7, y: 2 };
        baseString = baseString.replace('⬜🪙⬜', '⬜🌪️⬜');
    }
    // Level 16: Coin of Dust
    if (i === 16) {
        interactables['quest_item'] = { type: 'npc', uu: uu(4), visual: '🪨', emoji: '🪨', dialogue: { start: ["You found the Coin of Dust!", {giveItem: 'coin_of_dust'}, {updateQuest: 'maamar_1_matbea', objectiveId: 'find_coin_dust'}, "end"] }, x: 7, y: 2 };
        baseString = baseString.replace('⬜🪙⬜', '⬜🪨⬜');
    }

    matbeaMaps[id] = {
        width: 15,
        baseLayerString: baseString,
        encounters: {
            '⬜': [{ id: 'automaton_guard', levelRange: [encounterLevel, encounterLevel + 2], chance: 0.3 }]
        },
        interactables: interactables
    };
}
