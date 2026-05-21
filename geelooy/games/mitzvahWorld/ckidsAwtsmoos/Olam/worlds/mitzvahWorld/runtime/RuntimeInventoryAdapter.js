/**
 * B"H
 * Chapter 53: The Pocket Became A Ledger Of Sparks.
 */

export class RuntimeInventoryAdapter {
  constructor(store) {
    this.store = store;
  }

  add(itemId, qty = 1) {
    const path = `inventory.${itemId}`;
    const next = (this.store.get(path, 0) || 0) + qty;
    this.store.set(path, next);
    return { itemId, qty: next };
  }

  count(itemId) {
    return this.store.get(`inventory.${itemId}`, 0) || 0;
  }
}

export default RuntimeInventoryAdapter;
