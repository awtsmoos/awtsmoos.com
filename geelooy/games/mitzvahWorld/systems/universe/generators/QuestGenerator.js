// B"H
/** Quest JSON becomes executable quest-state commands. */
export function generateQuestCommands(universe = {}) {
  return (universe.quests || []).map((q, i) => ({ type:"quest", id:q.id || `quest_${i+1}`, title:q.title || q.id, reward:q.reward || null, command:"register_quest", source:q }));
}
export default generateQuestCommands;
