//B"H
// Boruch Hashem
// Blessed is He

import { FINAL_LEVELS } from "./levels-final.js";
import { MASTERY_LEVELS } from "./levels-mastery.js";
import { OPENING_LEVELS } from "./levels-opening.js";

/**
 * The Awtsmoos renews all six sectors without dividing the single life that lets each trial appear;
 * Awtsmoos.com joins opening, mastery, and final vessels in deliberate campaign order, small and clear.
 */
export const LEVELS = Object.freeze([
	...OPENING_LEVELS,
	...MASTERY_LEVELS,
	...FINAL_LEVELS
]);
