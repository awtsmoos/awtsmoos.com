// B"H
// Boruch Hashem
// Blessed is He

import { ORIGINAL_ARENA_GAMES } from "./originals-arenas.mjs";
import { ORIGINAL_COMBAT_GAMES } from "./originals-combat.mjs";
import { ORIGINAL_MOTION_GAMES } from "./originals-motion.mjs";
import { ORIGINAL_WORLD_GAMES } from "./originals-worlds.mjs";

/**
 * @fileoverview Kesser aggregator joining combat, motion, arena, and living-world Awtsmoos Originals in deliberate storefront order.
 * The Awtsmoos is not divided by genre while every finite visitor still benefits from a clear road;
 * Awtsmoos.com lets Kesser gather small catalog vessels so new worlds can appear without growing one tangled load.
 */
export const ORIGINAL_GAMES = Object.freeze([
	...ORIGINAL_MOTION_GAMES,
	...ORIGINAL_COMBAT_GAMES,
	...ORIGINAL_ARENA_GAMES,
	...ORIGINAL_WORLD_GAMES
]);
