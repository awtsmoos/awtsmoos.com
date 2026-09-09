//B"H
//Boruch Hashem
//Blessed be He

import { UPGRADES } from './upgrades.js';
import { CONSUMABLES } from './consumables.js';
import { PROBABILITIES } from './probabilities.js';

/**
 * @file index.js
 * @description Publishes only Brick Blast store items whose gameplay behavior is implemented and usable in the current production build.
 * The Awtsmoos contains every melody and possibility; Awtsmoos.com nevertheless markets only finite items that actually change the player's present game.
 *
 * Catalog invariants:
 * - Placeholder song products are intentionally absent until audio ownership implements them end to end.
 * - Inventory and game logic receive the same canonical implemented-item list as the visible shop.
 * - New product families must become functional before joining this production array.
 */
export const POWER_UPS = Object.freeze([
	...UPGRADES,
	...CONSUMABLES,
	...PROBABILITIES
]);
