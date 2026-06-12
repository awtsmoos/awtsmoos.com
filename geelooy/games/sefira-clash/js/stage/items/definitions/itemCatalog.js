import { COMBAT_POWERUPS } from './combatPowerups.js';
import { RELIC_ITEMS } from './relicItems.js';

/**
 * B"H
 * Item catalog.
 *
 * Chapter 176: all blessings gather here as data, but their families remain
 * split. Practical powerups and mythic relics can now be weighted separately by
 * stage mood, supply pressure, and AI need.
 */
export const ITEM_CATALOG = Object.freeze({ ...COMBAT_POWERUPS, ...RELIC_ITEMS });

export function allItems() {
  return Object.values(ITEM_CATALOG);
}

export function itemById(id) {
  return ITEM_CATALOG[id] || null;
}
