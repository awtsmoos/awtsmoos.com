// B"H
/**
 * @file inventory-setup.js
 * @description
 * Chapter 430: The wardrobe receives a book and the action bar receives speech.
 *
 * The Chossid still begins with stable clothing, but the first steps of Torah
 * debate now exist in the same inventory vessel: a readable Chumash and a first
 * passage card. The action bar wakes with both ready, so learning and movement
 * stand together instead of waiting in separate rooms.
 */

const LEAN_APPAREL = [
  { id: "default_yamulka", className: "Apparel", name: "Yamulka", icon: "cap", equipSlot: "head", customData: { meshName: "yamulka" } },
  { id: "default_outer_shirt", className: "Apparel", name: "White Shirt", icon: "shirt", equipSlot: "shirt", customData: { meshName: "outer-shirt", color: "#ffffff" } },
  { id: "default_pants", className: "Apparel", name: "Dark Pants", icon: "pants", equipSlot: "legs", customData: { meshName: "pants", color: "#20242c" } },
  { id: "default_shoes", className: "Apparel", name: "Black Shoes", icon: "shoes", equipSlot: "feet", customData: { meshName: "shoes", color: "#050505" } },
  { id: "nice_jacket", className: "Apparel", name: "Shabbos Jacket", icon: "coat", equipSlot: "jacket", customData: { meshName: "jacket", color: "#111111" } },
  { id: "round_glasses", className: "Apparel", name: "Round Glasses", icon: "glasses", equipSlot: "eyes", customData: { meshName: "glasses" } },
  { id: "top_hat", className: "Apparel", name: "Top Hat", icon: "hat", equipSlot: "head", customData: { meshName: "top-hat" } }
];

const STARTING_TORAH_ITEMS = [
  {
    id: "book_chumash_bereishis",
    className: "Chumash",
    name: "Chumash: Bereishis",
    icon: "book",
    readable: true,
    equipSlot: "rightHand",
    passageIds: ["bereishis_1_1", "shemos_20_2"]
  },
  {
    id: "passage_bereishis_1_1",
    className: "TorahPassage",
    name: "Bereishis 1:1",
    icon: "aleph",
    passageId: "bereishis_1_1",
    debateType: "pshat",
    isDebateCard: true
  }
];

export default {
  /**
   * Seeds platformer inventory with stable clothing and Torah debate tools.
   *
   * @returns {void}
   */
  setupDefaultInventory() {
    ensureLeanInventoryShape(this.inventory);
    seedLeanWardrobe(this.inventory);
    seedStartingTorah(this.inventory);
    this.inventory.updateUI?.();
  }
};

/**
 * Ensures inventory arrays exist and have expected capacity.
 *
 * @param {object} inventory Inventory manager.
 * @returns {void}
 */
function ensureLeanInventoryShape(inventory) {
  if (!inventory) return;
  inventory.slots ||= [];
  inventory.actionSlots ||= [];
  inventory.equipment ||= {};
  while (inventory.slots.length < (inventory.maxSlots || 36)) inventory.slots.push(null);
  while (inventory.actionSlots.length < (inventory.maxActionSlots || 6)) inventory.actionSlots.push(null);
}

/**
 * Checks whether an item is already present.
 *
 * @param {object} inventory Inventory manager.
 * @param {string} id Item id.
 * @returns {boolean} True when the item already exists.
 */
function hasItem(inventory, id) {
  return inventory.slots.some(item => item?.id === id) || inventory.actionSlots.some(item => item?.id === id);
}

/**
 * Places an item in the first open inventory slot.
 *
 * @param {object} inventory Inventory manager.
 * @param {object} item Item data.
 * @returns {number} Slot index, or -1 when no slot exists.
 */
function placeItem(inventory, item) {
  if (hasItem(inventory, item.id)) return inventory.slots.findIndex(slot => slot?.id === item.id);
  const index = inventory.slots.findIndex(slot => slot === null);
  if (index < 0) return -1;
  inventory.slots[index] = inventory.enrichItemData ? inventory.enrichItemData(item) : { ...item, quantity: 1 };
  return index;
}

/**
 * Equips an inventory slot if the equipment slot is empty.
 *
 * @param {object} inventory Inventory manager.
 * @param {string} slot Equipment slot.
 * @param {number} index Inventory slot index.
 * @returns {void}
 */
function equipIfEmpty(inventory, slot, index) {
  if (index < 0 || inventory.equipment?.[slot]) return;
  inventory.equipment[slot] = { sourceType: "inventory", index };
}

/**
 * Seeds stable clothing.
 *
 * @param {object} inventory Inventory manager.
 * @returns {void}
 */
function seedLeanWardrobe(inventory) {
  const map = new Map();
  for (const item of LEAN_APPAREL) map.set(item.id, placeItem(inventory, item));
  equipIfEmpty(inventory, "head", map.get("default_yamulka"));
  equipIfEmpty(inventory, "shirt", map.get("default_outer_shirt"));
  equipIfEmpty(inventory, "legs", map.get("default_pants"));
  equipIfEmpty(inventory, "feet", map.get("default_shoes"));
}

/**
 * Seeds the first Chumash and passage into inventory plus action bar.
 *
 * @param {object} inventory Inventory manager.
 * @returns {void}
 */
function seedStartingTorah(inventory) {
  const indices = STARTING_TORAH_ITEMS.map(item => placeItem(inventory, item));
  if (!inventory.actionSlots[0]) inventory.actionSlots[0] = inventory.slots[indices[0]];
  if (!inventory.actionSlots[1]) inventory.actionSlots[1] = inventory.slots[indices[1]];
}

