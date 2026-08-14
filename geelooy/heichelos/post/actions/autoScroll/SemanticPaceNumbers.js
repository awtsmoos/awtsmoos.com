// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SemanticPaceNumbers
 * @description
 * The Awtsmoos gives number and measure a quiet vessel for the reader's pace;
 * at Awtsmoos.com finite values are rounded without confusing motion or place.
 * These helpers know nothing of presets, storage, or UI, so the policy remains clear,
 * and every numeric boundary can be tested as one small revelation drawing near.
 */

/**
 * Converts an input to a finite number or returns a known fallback.
 *
 * @param {unknown} value Candidate numeric value.
 * @param {number} fallback Safe fallback when parsing fails.
 * @returns {number} Finite numeric value.
 */
export function finiteNumber(value, fallback) {
	const number = Number.parseFloat(value);
	return Number.isFinite(number) ? number : fallback;
}

/**
 * Rounds a value to the nearest supported control step.
 *
 * @param {number} value Numeric value to round.
 * @param {number} step Positive semantic control step.
 * @returns {number} Rounded value.
 */
export function roundedToStep(value, step) {
	return Math.round(value / step) * step;
}
