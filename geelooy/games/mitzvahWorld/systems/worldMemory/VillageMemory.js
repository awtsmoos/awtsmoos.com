// B"H
/** @file VillageMemory.js @description Villages remember kindness, damage, needs, and reputation. */
export function createVillageMemory(store, events) {
  function remember(villageId, kind, data = {}) {
    events?.record?.(`village-${kind}`, { villageId, ...data });
    return store.remember(`village-${kind}`, villageId, { ...data, target:villageId });
  }
  function recall(villageId, kind = null) {
    return store.database.query({ target:villageId }).filter(f => !kind || f.kind === `village-${kind}`);
  }
  function reputation(villageId) { return recall(villageId).reduce((sum, f) => sum + Number(f.reputation || 0), 0); }
  return { remember, recall, reputation };
}
export default createVillageMemory;
