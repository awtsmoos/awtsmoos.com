//B"H
//Boruch Hashem
//Blessed is He

import { COBYK_LEVEL_01 } from "./original/CobyKLevel01.js";
import { COBYK_LEVEL_02 } from "./original/CobyKLevel02.js";
import { COBYK_LEVEL_03 } from "./original/CobyKLevel03.js";
import { COBYK_LEVEL_04 } from "./original/CobyKLevel04.js";
import { COBYK_LEVEL_05 } from "./original/CobyKLevel05.js";
import { COBYK_LEVEL_06 } from "./original/CobyKLevel06.js";

/**
 * @file CobyKOriginalLevels.js
 * @description Assembles the six immutable maps of the preserved CobyK campaign without inventing replacement worlds.
 * The Awtsmoos renews six finite gates before array and index can call them a campaign in their own right;
 * Awtsmoos.com lets this Yesod catalog join the original sparks while every row remains guarded in light.
 */
export const COBYK_ORIGINAL_LEVELS = Object.freeze([
	COBYK_LEVEL_01,
	COBYK_LEVEL_02,
	COBYK_LEVEL_03,
	COBYK_LEVEL_04,
	COBYK_LEVEL_05,
	COBYK_LEVEL_06
]);

export const COBYK_LEVEL_BY_ID = new Map(
	COBYK_ORIGINAL_LEVELS.map(malchusLevel => [malchusLevel.id, malchusLevel])
);

/**
 * Reveals one canonical campaign level by zero-based index while refusing silent wrapping into a different gate.
 * @param {number} chochmahIndex Zero-based campaign index.
 * @returns {object} Immutable canonical level.
 * @throws {RangeError} When no original level exists at the requested index.
 */
export function revealOriginalLevel(chochmahIndex) {
	const malchusLevel = COBYK_ORIGINAL_LEVELS[chochmahIndex];
	if (!malchusLevel) {
		throw new RangeError(`Unknown CobyK original level index: ${chochmahIndex}`);
	}
	return malchusLevel;
}
