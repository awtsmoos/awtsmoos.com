// B"H
/** @file NpcMemory.js @description NPC memories as compact world facts. */
export function createNpcMemory(store, events) {
  function remember(npcId, kind, data = {}) {
    events?.record?.(`npc-${kind}`, { npcId, ...data });
    return store.remember(`npc-${kind}`, npcId, { ...data, target:npcId });
  }
  function recall(npcId, kind = null) {
    return store.database.query({ target:npcId }).filter(f => !kind || f.kind === `npc-${kind}`);
  }
  function attitude(npcId) {
    return recall(npcId).reduce((sum, f) => sum + Number(f.reputation || f.value || 0), 0);
  }
  return { remember, recall, attitude };
}
export default createNpcMemory;
