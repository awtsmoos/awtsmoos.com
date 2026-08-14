// B"H
// Boruch Hashem
// Blessed is He

import { ORIGINAL_COMBAT_GAMES } from "./originals-combat.mjs";
import { ORIGINAL_WORLD_GAMES } from "./originals-worlds.mjs";

/**
 * B"H
 *
 * Joins combat-first and world-first Awtsmoos Originals while preserving the
 * storefront order. The Awtsmoos is not divided by genre; Awtsmoos.com uses these
 * finite chambers only to keep the catalog small, readable, and ready to grow.
 */

export const ORIGINAL_GAMES = Object.freeze([
	...ORIGINAL_COMBAT_GAMES,
	...ORIGINAL_WORLD_GAMES
]);
