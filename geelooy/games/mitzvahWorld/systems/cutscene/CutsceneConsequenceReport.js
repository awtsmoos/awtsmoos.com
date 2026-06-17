// B"H
export function cutsceneConsequenceReport(before = {}, after = {}) { return { memoryAdded:(after.memory || []).filter(x => !(before.memory || []).includes(x)), unlocksAdded:(after.unlocks || []).filter(x => !(before.unlocks || []).includes(x)), quests:Object.keys(after.quests || {}) }; }
export default cutsceneConsequenceReport;
