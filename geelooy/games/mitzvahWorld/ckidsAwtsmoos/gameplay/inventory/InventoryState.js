// B"H
import { createItemStack, itemDefinition } from "../items/ItemDefinitions.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export function createInventoryState() {
  return {
    slots:[
      createItemStack("warm_bread", 1)
    ],
    capacity:24
  };
}

export function addItem(inventory, id, qty = 1) {
  const def = itemDefinition(id);
  const stack = inventory.slots.find(slot => slot.id === id && def.type !== "weapon" && def.type !== "trinket");
  if (stack) stack.qty += qty;
  else if (inventory.slots.length < inventory.capacity) inventory.slots.push(createItemStack(id, qty));
  else return { ok:false, reason:"bag-full" };
  return { ok:true, item:createItemStack(id, qty) };
}

export function removeItem(inventory, id, qty = 1) {
  const slot = inventory.slots.find(row => row.id === id);
  if (!slot || slot.qty < qty) return false;
  slot.qty -= qty;
  if (slot.qty <= 0) inventory.slots = inventory.slots.filter(row => row !== slot);
  return true;
}

export function sellFirstSellable(inventory, player) {
  const slot = inventory.slots.find(row => (row.sellPrice || 0) > 0);
  if (!slot) return { ok:false, reason:"nothing-sellable" };
  const def = itemDefinition(slot.id);
  removeItem(inventory, slot.id, 1);
  player.coins += def.sellPrice || 1;
  return { ok:true, sold:def.id, coins:player.coins, gained:def.sellPrice || 1 };
}

export function equipItem(inventory, player, id) {
  const def = itemDefinition(id);
  if (!def.slot) return { ok:false, reason:"not-equipment" };
  if (!inventory.slots.some(row => row.id === id)) return { ok:false, reason:"not-in-bag" };
  player.equipment[def.slot] = def.id;
  return { ok:true, slot:def.slot, item:def.id, mode:def.weaponMode || null };
}
