// B"H
/**
 * @file inventory-setup.js
 * @description
 * Chapter 28: The wardrobe remains stable after death and reset.
 *
 * The Awtsmoos gives the Chossid a small, real wardrobe even in Level 1. These
 * apparel sparks can be tapped/clicked in the Otzar and equipped through the
 * existing inventory menu. The default garments are equipped once, then reset
 * only calls `updateAppearance`; it never randomizes or changes clothes.
 */

const LEAN_APPAREL = [
  { id: 'default_yamulka', className: 'Apparel', name: 'Yamulka', icon: '⚫', equipSlot: 'head', customData: { meshName: 'yamulka' } },
  { id: 'default_outer_shirt', className: 'Apparel', name: 'White Shirt', icon: '👕', equipSlot: 'shirt', customData: { meshName: 'outer-shirt', color: '#ffffff' } },
  { id: 'default_pants', className: 'Apparel', name: 'Dark Pants', icon: '👖', equipSlot: 'legs', customData: { meshName: 'pants', color: '#20242c' } },
  { id: 'default_shoes', className: 'Apparel', name: 'Black Shoes', icon: '👞', equipSlot: 'feet', customData: { meshName: 'shoes', color: '#050505' } },
  { id: 'nice_jacket', className: 'Apparel', name: 'Shabbos Jacket', icon: '🧥', equipSlot: 'jacket', customData: { meshName: 'jacket', color: '#111111' } },
  { id: 'round_glasses', className: 'Apparel', name: 'Round Glasses', icon: '👓', equipSlot: 'eyes', customData: { meshName: 'glasses' } },
  { id: 'top_hat', className: 'Apparel', name: 'Top Hat', icon: '🎩', equipSlot: 'head', customData: { meshName: 'top-hat' } }
];

export default {
  /** Seeds platformer inventory with stable equip-ready clothing. */
  setupDefaultInventory() {
    ensureLeanInventoryShape(this.inventory);
    seedLeanWardrobe(this.inventory);
    this.inventory.updateUI?.();
  }
};

function ensureLeanInventoryShape(inventory) {
  if (!inventory) return;
  inventory.slots ||= [];
  inventory.actionSlots ||= [];
  inventory.equipment ||= {};
  while (inventory.slots.length < (inventory.maxSlots || 36)) inventory.slots.push(null);
  while (inventory.actionSlots.length < (inventory.maxActionSlots || 6)) inventory.actionSlots.push(null);
}

function hasItem(inventory, id) {
  return inventory.slots.some(item => item?.id === id) || inventory.actionSlots.some(item => item?.id === id);
}

function placeItem(inventory, item) {
  if (hasItem(inventory, item.id)) return inventory.slots.findIndex(slot => slot?.id === item.id);
  const index = inventory.slots.findIndex(slot => slot === null);
  if (index < 0) return -1;
  inventory.slots[index] = inventory.enrichItemData ? inventory.enrichItemData(item) : { ...item, quantity: 1 };
  return index;
}

function equipIfEmpty(inventory, slot, index) {
  if (index < 0 || inventory.equipment?.[slot]) return;
  inventory.equipment[slot] = { sourceType: 'inventory', index };
}

function seedLeanWardrobe(inventory) {
  const map = new Map();
  for (const item of LEAN_APPAREL) map.set(item.id, placeItem(inventory, item));
  equipIfEmpty(inventory, 'head', map.get('default_yamulka'));
  equipIfEmpty(inventory, 'shirt', map.get('default_outer_shirt'));
  equipIfEmpty(inventory, 'legs', map.get('default_pants'));
  equipIfEmpty(inventory, 'feet', map.get('default_shoes'));
}
