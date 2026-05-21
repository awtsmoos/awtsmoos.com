/**
 * B"H
 * Chapter 54: The Quest Heard The Item Fall.
 */

export class RuntimeQuestAdapter {
  constructor(store) {
    this.store = store;
  }

  progress(kind, itemId, amount = 1) {
    const path = `quests.${kind}.${itemId}`;
    const next = (this.store.get(path, 0) || 0) + amount;
    this.store.set(path, next);
    return { kind, itemId, amount: next };
  }

  count(kind, itemId) {
    return this.store.get(`quests.${kind}.${itemId}`, 0) || 0;
  }
}

export default RuntimeQuestAdapter;
