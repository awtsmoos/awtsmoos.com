// B"H
import { addItem, sellFirstSellable } from "../inventory/InventoryState.js";
import { itemDefinition } from "../items/ItemDefinitions.js";
import { VENDOR_DEFINITIONS } from "./VendorDefinitions.js";

export function listVendor(vendorId) {
  const vendor = VENDOR_DEFINITIONS[vendorId];
  return (vendor?.inventory || []).map(row => ({ ...itemDefinition(row.id), price:row.price }));
}

export function buyVendorItem(vendorId, itemId, player, inventory) {
  const stock = VENDOR_DEFINITIONS[vendorId]?.inventory || [];
  const row = stock.find(item => item.id === itemId);
  if (!row) return { ok:false, reason:"not-stocked" };
  if (player.coins < row.price) return { ok:false, reason:"insufficient-funds", coins:player.coins, price:row.price };
  const added = addItem(inventory, itemId, 1);
  if (!added.ok) return added;
  player.coins -= row.price;
  return { ok:true, bought:itemId, coins:player.coins };
}

export function sellVendorLoot(player, inventory) {
  return sellFirstSellable(inventory, player);
}
