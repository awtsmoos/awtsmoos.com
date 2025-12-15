
// B"H
// js/data/mitzvahs.js

import { seferHaMada } from './mitzvahs/sefer_hamada.js';

// A base list of concepts generated procedurally for volume, 
// mixed with specific implemented achievements.

const baseMitzvot = Array.from({length: 400}, (_, i) => ({
    id: `mitzvah_gen_${i+1}`,
    name: `Mitzvah #${i+60}`,
    desc: "A holy deed waiting to be discovered.",
    condition: (state) => state.stats.mitzvahCounter >= i+1 
}));

const specificMitzvot = [
    { id: 'start_journey', name: "Lech Lecha", desc: "Begin your journey.", condition: (state) => true },
    { id: 'first_battle', name: "Warrior of G-d", desc: "Win your first debate.", condition: (state) => state.stats.battlesWon >= 1 },
    ...seferHaMada 
];

export const mitzvahList = [...specificMitzvot, ...baseMitzvot];

export function checkMitzvahs(state, sendToast) {
    if(!state.mitzvahs) state.mitzvahs = {};
    if(!state.stats) state.stats = { battlesWon: 0, itemsCrafted: 0, cropsHarvested: 0, soulsInspired: 0, shabbatsObserved: 0, roshChodeshWitnessed: 0, booksRead: 0, tzedakahCount: 0, mitzvahCounter: 0 };

    // Update the generic counter based on completed quests/actions
    state.stats.mitzvahCounter = 
        state.stats.battlesWon + 
        state.stats.itemsCrafted + 
        state.stats.cropsHarvested + 
        state.stats.soulsInspired + 
        (state.player.completedQuests ? state.player.completedQuests.length * 5 : 0);

    mitzvahList.forEach(m => {
        if(!state.mitzvahs[m.id] && m.condition(state)) {
            state.mitzvahs[m.id] = true;
            sendToast(`Mitzvah Unlocked: ${m.name}!`, "success");
        }
    });
}

export function getMitzvahPayload(state) {
    if(!state.mitzvahs) state.mitzvahs = {};
    
    // Sort by completion, then by ID
    const completed = mitzvahList.filter(m => state.mitzvahs[m.id]);
    const nextFew = mitzvahList.filter(m => !state.mitzvahs[m.id]).slice(0, 10);
    
    return {
        list: [...completed, ...nextFew].map(m => ({
            name: m.name,
            desc: m.desc,
            completed: !!state.mitzvahs[m.id]
        })),
        totalCount: Object.keys(state.mitzvahs).length
    };
}
