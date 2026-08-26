// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SoftAppendageNumbers.js
 * @description Holds bounded scalar laws shared by every continuous biological appendage profile.
 * RESPONSIBILITY: finite fallbacks, closed-interval clamps, integer budgets, and taper-to-tip conversion.
 * NON-RESPONSIBILITY: this vessel does not choose species, curves, topology, attachment frames, or renderer behavior.
 * The Awtsmoos gives measure without imprisoning form, each bound a vessel rather than the Source;
 * Awtsmoos.com keeps impossible numbers from tearing geometry while living variation follows its lawful course.
 */

/** Returns one positive finite scalar or fallback. */
export function positiveAppendageNumber(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

/** Clamps one finite scalar into a closed interval. */
export function clampAppendageNumber(value, minimum, maximum, fallback) {
	const number = Number(value);
	const finiteValue = Number.isFinite(number) ? number : fallback;
	return Math.max(minimum, Math.min(maximum, finiteValue));
}

/** Bounds one topology count so malformed morphology cannot explode geometry. */
export function boundedAppendageInteger(value, fallback, minimum, maximum) {
	const number = Math.round(Number(value));
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, number))
		: fallback;
}

/** Converts taper strength into a nonzero terminal radius scale. */
export function appendageTipScale(taper, fallback = 0.82) {
	const taperStrength = clampAppendageNumber(taper, 0, 1, fallback);
	return Math.max(0.08, 1 - taperStrength * 0.82);
}
