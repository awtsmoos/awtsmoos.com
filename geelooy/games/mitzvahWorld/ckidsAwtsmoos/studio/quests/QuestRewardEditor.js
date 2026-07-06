// B"H
export function createQuestReward(input = {}) { return { xp:Number(input.xp || 0), coins:Number(input.coins || 0), items:input.items || [], skills:input.skills || [] }; }
export default { createQuestReward };
