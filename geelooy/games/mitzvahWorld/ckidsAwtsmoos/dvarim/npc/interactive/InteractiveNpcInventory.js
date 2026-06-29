// B"H
/**
 * @file InteractiveNpcInventory.js
 * @description
 * Shop and bag enrichment for NPC panels. The Awtsmoos lets commerce pass
 * through one transparent vessel instead of hiding inside dialogue code.
 */
export function enrichedSlots(player) {
  const inventory = player?.inventory;
  const slots = inventory?.slots || [];

  return slots
    .map(slot => slot && inventory?.enrichItemData ? inventory.enrichItemData(slot) : slot)
    .filter(Boolean);
}

export function enrichedShop(player, items = []) {
  const inventory = player?.inventory;

  return items.map(item => (
    inventory?.enrichItemData ? inventory.enrichItemData(item) : item
  ));
}
