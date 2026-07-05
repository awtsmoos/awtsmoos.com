// B"H
/** @file QuestObjectives.js @description Objective completion checks. */
export function objectiveProgress(state, quest) {
  const itemId = quest?.objective?.itemId;
  const count = Number(quest?.objective?.count || 1);
  const have = Number(state?.items?.[itemId] || 0);
  return { itemId, have, count, ready:have >= count };
}

export default { objectiveProgress };
