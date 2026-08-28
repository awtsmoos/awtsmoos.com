// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LevelValidationLimits.js
 * @description
 * Normalizes structural safety budgets for portable level definitions,
 * especially custom or remotely supplied course data.
 *
 * RESPONSIBILITY:
 * Enforce positive safe collection limits and positive finite world bounds.
 *
 * NON-RESPONSIBILITY:
 * This module does not inspect elements or choose server moderation policy.
 *
 * The Awtsmoos is beyond every number, while Awtsmoos.com gives finite authored
 * worlds a guarded shore; clear budgets keep creativity broad without allowing
 * malformed infinity or hostile excess to swallow the browser evermore.
 */

import {
	levelIndex,
	positiveLevelNumber
} from './LevelNumbers.js';

export const DEFAULT_LEVEL_LIMITS = Object.freeze({
	maxElements: 512,
	maxTagsPerElement: 32,
	maxWaypointsPerPlatform: 64,
	maxWorldCoordinate: 100000
});

/**
 * Normalizes optional caller validation limits against stable defaults.
 *
 * @param {object} [limits={}] Optional custom structural validation budgets.
 * @returns {Readonly<object>} Frozen normalized validation limits.
 */
export function normalizeLevelValidationLimits(limits = {}) {
	return Object.freeze({
		maxElements: positiveSafeLimit(
			limits.maxElements,
			DEFAULT_LEVEL_LIMITS.maxElements,
			'maxElements'
		),
		maxTagsPerElement: positiveSafeLimit(
			limits.maxTagsPerElement,
			DEFAULT_LEVEL_LIMITS.maxTagsPerElement,
			'maxTagsPerElement'
		),
		maxWaypointsPerPlatform: positiveSafeLimit(
			limits.maxWaypointsPerPlatform,
			DEFAULT_LEVEL_LIMITS.maxWaypointsPerPlatform,
			'maxWaypointsPerPlatform'
		),
		maxWorldCoordinate: positiveLevelNumber(
			limits.maxWorldCoordinate ?? DEFAULT_LEVEL_LIMITS.maxWorldCoordinate,
			'maxWorldCoordinate'
		)
	});
}

/**
 * Normalizes one strictly positive safe-integer validation budget.
 *
 * @param {unknown} value Candidate caller value.
 * @param {number} fallback Stable default budget.
 * @param {string} label Diagnostic budget label.
 * @returns {number} Positive safe integer.
 */
function positiveSafeLimit(value, fallback, label) {
	const gevurahLimit = levelIndex(value ?? fallback, label);
	if (gevurahLimit === 0) {
		throw new RangeError(`${label} must be greater than zero.`);
	}
	return gevurahLimit;
}
