//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the item catalog vessel in this instant, revealing
 * its focused js stage items definitions service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
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

/**
 * Reveals the all items behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 */
export function allItems() {
	return Object.values(ITEM_CATALOG);
}

/**
 * Reveals the item by id behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} id The id value entering this behavior.
 */
export function itemById(id) {
	return ITEM_CATALOG[id] || null;
}
