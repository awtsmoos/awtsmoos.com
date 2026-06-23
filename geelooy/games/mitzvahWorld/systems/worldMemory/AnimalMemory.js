// B"H
/** @file AnimalMemory.js @description Animal herds remember trails, danger, food, and water cheaply. */
export function createAnimalMemory(store, events) {
  function remember(animalId, kind, data = {}) {
    events?.record?.(`animal-${kind}`, { animalId, ...data });
    return store.remember(`animal-${kind}`, animalId, { ...data, target:animalId });
  }
  function recall(animalId, kind = null) {
    return store.database.query({ target:animalId }).filter(f => !kind || f.kind === `animal-${kind}`);
  }
  function knownTrail(animalId) { return recall(animalId, 'trail').slice(-8); }
  return { remember, recall, knownTrail };
}
export default createAnimalMemory;
