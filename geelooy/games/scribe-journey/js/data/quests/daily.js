
// B"H
// js/data/quests/daily.js

// This system generates infinite "Daily Mitzvah" quests
export function generateDailyQuest(daySeed) {
    const targets = ['clay_golem', 'dust_mite', 'ember_spirit', 'drawn_water_elemental', 'enduring_vine'];
    const targetId = targets[daySeed % targets.length];
    const count = (daySeed % 5) + 3;
    
    return {
        id: `daily_${daySeed}`,
        name: `Daily Duty: Cull the ${targetId.replace('_', ' ')}s`,
        desc: `The balance is shifting. You must defeat ${count} ${targetId.replace('_', ' ')}s today to maintain order.`,
        status: 'available',
        objectives: [
            { id: 'cull', text: `Defeat ${count} ${targetId}s`, completed: false, target: { type: 'defeat', musagId: targetId, count: count } }
        ],
        rewards: { money: { perutah: 100 * count }, xp: 50 * count }
    };
}
