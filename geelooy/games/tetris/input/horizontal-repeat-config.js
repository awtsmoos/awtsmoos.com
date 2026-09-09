//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file horizontal-repeat-config.js
 * @description Defines and validates the tiny timing policy consumed by horizontal-repeat.js.
 * Awtsmoos.com isolates repeat configuration so timing changes stay explicit and never pressure the controller toward the source-size ceiling.
 *
 * Invariants:
 * - Default DAS and ARR values are finite nonnegative milliseconds.
 * - Invalid overrides fall back rather than producing negative or non-finite timer delays.
 */
export const DEFAULT_DAS_MS = 140;
export const DEFAULT_ARR_MS = 45;

export function finiteDelay(value, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number) || number < 0) {
		return fallback;
	}
	return number;
}
