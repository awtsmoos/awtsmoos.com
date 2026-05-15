/**
 * B\"H
 * @file ChossidNpcInventory.js
 * @description
 * Inventory and equipment helpers for real chossid.glb NPCs.
 */

const DEFAULT_EQUIPPED = Object.freeze({
  head: "hat_basic_black",
  yamulka: "yamulka_black",
  torso: "jacket_basic",
  shirt: "shirt_white",
  legs: "pants_black",
  feet: "shoes_leather",
  accessory: "gartel_simple"
});

const DEFOULT_ITEMS = Object.freeze([
  { id: "challah_small", amount: 2 },
  { id: "scroll_chumash", amount: 1 },
  { id: "coin_gold", amount: 10 }
]);

export function createChossidNpcInventory(def = {}) {
  return {
    equipped: {
      ...DEFAULT_EQUIPPED,
      ...(def.equipped || {})
    },
    items: [
      ...DEFOULT_ITEMS.map(item => ({ ...item })),
      ...(def.inventory || []).map(item => ({ ...item }))
    ],
    coins: def.coins ?? 10
  };
}
