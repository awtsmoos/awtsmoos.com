// B"H
export function createQuestGiverState(questId = "starter_quest") { return { role:"questGiver", questState:{ questId, state:"available" } }; }
export default { createQuestGiverState };
