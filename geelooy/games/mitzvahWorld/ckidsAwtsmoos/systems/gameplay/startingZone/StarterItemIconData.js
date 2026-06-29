// B"H
/**
 * Every collectible, shop row, attack reagent, and corpse drop needs an icon.
 *
 * Keeping icons in data lets inventory, vendors, action bars, loot windows, and
 * floating rewards speak the same language without each UI inventing its own
 * fallback label.
 */
export const STARTER_ITEM_ICONS = Object.freeze({
  fur_scrap:"🧶",
  cow_hide:"🟫",
  healing_herb:"🌿",
  spark_fragment:"✨",
  travel_bread:"🥖",
  repair_kit:"🧰",
  candle:"🕯️",
  perutah:"🪙",
  simple_bow:"🏹",
  walking_staff:"🪄",
  linen_coat:"🧥",
  study_scroll:"📜"
});

export function iconForItem(id) {
  return STARTER_ITEM_ICONS[id] || "🎁";
}
