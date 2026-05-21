/**
 * B"H
 * @file InventoryStackRuntime.js
 *
 * Chapter 34: The Bag Became A Library Of Weight.
 *
 * The Awtsmoos lets physical objects gather by identity. Wood stacks with
 * wood, passages remain distinct, and every item remembers its category so UI,
 * quests, and Chumash reading can share one truthful vessel.
 */

export class InventoryStackRuntime {
  constructor() {
    this.stacks = new Map();
  }

  add(item, amount = 1) {
    if (!item?.id) throw new Error('Inventory item id is required.');
    const stack = this.stacks.get(item.id) || { item: { ...item }, amount: 0 };
    stack.amount += amount;
    this.stacks.set(item.id, stack);
    return { item: { ...stack.item }, amount: stack.amount };
  }

  count(itemId) {
    return this.stacks.get(itemId)?.amount || 0;
  }

  listByCategory(category) {
    return [...this.stacks.values()]
      .filter(stack => !category || stack.item.category === category)
      .map(stack => ({ item: { ...stack.item }, amount: stack.amount }));
  }
}

export default InventoryStackRuntime;
