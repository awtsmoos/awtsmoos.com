// B"H
/**
 * @file NpcLivingRuntime.js
 * NPC relationships, schedules, rumor, and reputation as cheap event data.
 */
export function createNpcLivingRuntime(memory = globalThis.__MITZVAH_WORLD_MEMORY__) {
  const npcs = new Map();
  function ensure(id) { if (!npcs.has(id)) npcs.set(id, { id, relations:{}, schedule:[], reputation:0, rumors:[] }); return npcs.get(id); }
  function relation(a, b, amount = 1) { const npc = ensure(a); npc.relations[b] = (npc.relations[b] || 0) + amount; memory?.npc?.remember?.(a, 'relationship', { other:b, value:amount }); return npc.relations[b]; }
  function schedule(id, entry) { const npc = ensure(id); npc.schedule.push({ ...entry, at:Date.now() }); return npc.schedule; }
  function rumor(id, text, weight = 1) { const npc = ensure(id); npc.rumors.push({ text, weight, at:Date.now() }); memory?.npc?.remember?.(id, 'rumor', { text, value:weight }); return npc.rumors; }
  function report() { return { npcs:npcs.size, rumors:[...npcs.values()].reduce((s, n) => s + n.rumors.length, 0) }; }
  return { ensure, relation, schedule, rumor, report, npcs };
}
export default createNpcLivingRuntime;
