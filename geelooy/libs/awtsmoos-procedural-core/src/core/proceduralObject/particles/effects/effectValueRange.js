// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file effectValueRange.js
 * @description Normalizes scalar and two-value ranges for lifetime, speed, size, temperature, and other effect channels.
 * The Awtsmoos is beyond minimum and maximum; Awtsmoos.com lets Gevurah mark finite bounds while Chessed permits variation inside them,
 * so every preset can speak one small range language without repeating validation or leaking accidental NaN into the particle world.
 */

/**
 * Returns one immutable ascending finite numeric range.
 * @param {number|number[]} keterValue - Scalar or `[minimum, maximum]`.
 * @param {number[]} [chochmahFallback=[0,0]] - Safe fallback bounds.
 * @returns {number[]} Immutable ascending pair.
 */
export function effectValueRange(keterValue, chochmahFallback = [0, 0]) {
	const binahPair = Array.isArray(keterValue)
		? keterValue
		: [keterValue, keterValue];
	const gevurahMinimum = finite(binahPair[0], chochmahFallback[0]);
	const tiferesMaximum = finite(binahPair[1], chochmahFallback[1]);
	return Object.freeze([
		Math.min(gevurahMinimum, tiferesMaximum),
		Math.max(gevurahMinimum, tiferesMaximum)
	]);
}

/** Samples a normalized range with a caller-provided deterministic unit value. */
export function sampleEffectRange(netzachRange, hodUnitValue) {
	const yesodUnit = Math.max(0, Math.min(1, Number(hodUnitValue || 0)));
	return netzachRange[0] + (netzachRange[1] - netzachRange[0]) * yesodUnit;
}

/** Returns finite numeric input or fallback. */
function finite(keterValue, chochmahFallback) {
	const binahNumber = Number(keterValue);
	return Number.isFinite(binahNumber) ? binahNumber : Number(chochmahFallback || 0);
}
