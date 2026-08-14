// B"H
// Boruch Hashem
// Blessed is He

import { MYSTIC_ADVENTURE_GAMES } from "./adventures-mystic.mjs";
import { MOTION_ADVENTURE_GAMES } from "./adventures-motion.mjs";

/**
 * B"H
 *
 * Joins mystic and motion Awtsmoos adventures while preserving storefront order.
 * The Awtsmoos exceeds every category; Awtsmoos.com uses these small catalog
 * vessels only so new journeys can arrive without growing one dense registry.
 */

export const ADVENTURE_GAMES = Object.freeze([
	...MYSTIC_ADVENTURE_GAMES,
	...MOTION_ADVENTURE_GAMES
]);
