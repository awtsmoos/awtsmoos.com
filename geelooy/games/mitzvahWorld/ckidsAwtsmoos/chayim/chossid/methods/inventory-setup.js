// B"H
/**
 * @file inventory-setup.js
 * @description
 * Chapter 2: The backpack closes so Dust Gate can breathe.
 *
 * Level 1 is a clean platformer. When the Chossid arrives with
 * `skipDefaultInventory`, this module refuses to seed tools, apparel,
 * building pieces, books, and delayed equipment timers. Those older systems
 * were useful elsewhere, but here they are unnecessary weight.
 */

export default {
  /**
   * Seeds only the smallest platformer-safe inventory state.
   *
   * @returns {void}
   */
  setupDefaultInventory() {
    if (this.skipDefaultInventory || this.originalOptions?.skipDefaultInventory) {
      ensureLeanInventoryShape(this.inventory);
      return;
    }

    ensureLeanInventoryShape(this.inventory);
    this.inventory.addItem?.({
      id: 'perutah',
      className: 'Coin',
      name: 'Perutah',
      description: 'The small coin spark used by the clean platformer path.',
      icon: '🪙'
    }, 0);
    this.inventory.updateUI?.();
  }
};

/**
 * Keeps required inventory arrays present without loading old systems.
 *
 * @param {object} inventory Inventory-like vessel.
 * @returns {void}
 */
function ensureLeanInventoryShape(inventory) {
  if (!inventory) return;
  inventory.slots ||= [];
  inventory.actionSlots ||= [];
  inventory.equipment ||= {};
}
