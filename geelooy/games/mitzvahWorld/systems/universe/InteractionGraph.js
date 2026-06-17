// B"H
/** Connects beings, buildings, quests, dialogue, and episodes into edges. */
function edge(from, to, type, data = {}) { return { from, to, type, data }; }
export function buildInteractionGraph(universe = {}, beings = []) {
  const edges = [];
  for (const b of beings) { if (b.home) edges.push(edge(b.id, b.home, "lives_at")); if (b.work) edges.push(edge(b.id, b.work, "works_at")); for (const q of b.questIds) edges.push(edge(b.id, q, "offers_quest")); for (const d of b.dialogueIds) edges.push(edge(b.id, d, "speaks_dialogue")); }
  for (const q of universe.quests || []) if (q.reward) edges.push(edge(q.id, q.reward, "grants_reward", q));
  return { nodes:{ beings:beings.length, buildings:(universe.buildings || []).length, quests:(universe.quests || []).length }, edges };
}
