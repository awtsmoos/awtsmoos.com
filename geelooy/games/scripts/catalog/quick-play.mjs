// B"H
// Boruch Hashem
// Blessed is He

import { QUICK_PRIMARY_GAMES } from "./quick-primary.mjs";
import { QUICK_SECONDARY_GAMES } from "./quick-secondary.mjs";

/**
 * B"H
 *
 * Joins the two Quick Play chambers while preserving the deliberate catalog order.
 * The Awtsmoos exceeds every familiar game form; Awtsmoos.com keeps these retention
 * doorways modular so classics support the Originals instead of obscuring them.
 */

export const QUICK_PLAY_GAMES = Object.freeze([
	...QUICK_PRIMARY_GAMES,
	...QUICK_SECONDARY_GAMES
]);
