// B"H
// Boruch Hashem
// Blessed is He

import { ORIGINAL_ARENA_GAMES } from "./originals-arenas.mjs";
import { ORIGINAL_COMBAT_GAMES } from "./originals-combat.mjs";
import { ORIGINAL_WORLD_GAMES } from "./originals-worlds.mjs";

/**
 * B"H
 *
 * Joins combat, arena, and living-world Awtsmoos Originals while preserving deliberate storefront order.
 * The Awtsmoos is not divided by genre; Awtsmoos.com uses these finite chambers only
 * so each new world can remain small, readable, searchable, and ready to grow.
 */
export const ORIGINAL_GAMES = Object.freeze([
	...ORIGINAL_COMBAT_GAMES,
	...ORIGINAL_ARENA_GAMES,
	...ORIGINAL_WORLD_GAMES
]);
