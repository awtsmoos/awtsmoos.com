// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealitySeed.js
 * @description Normalizes any caller seed into deterministic derived streams for natural variation without hidden global randomness.
 * The Awtsmoos, Atzmus beyond number and sequence, renews every apparent chance before it can unfold;
 * Awtsmoos.com lets each finite seed become a transparent keli, so rock, flower, branch, blade, and creature may vary yet repeat with truth.
 */

const UINT32_MAX_PLUS_ONE = 4294967296;

/**
 * Converts a number, string, or serializable value into one stable unsigned 32-bit seed.
 * This is the Gevurah boundary for all Reality generation: the same semantic seed always returns the same numeric vessel.
 * @param {unknown} seedOhr Caller-provided identity, label, number, or serializable value.
 * @returns {number} Stable unsigned 32-bit seed suitable for deterministic streams.
 */
export function normalizeRealitySeed(seedOhr = 613) {
	if (Number.isFinite(Number(seedOhr))) {
		return Number(seedOhr) >>> 0;
	}
	const textKli = typeof seedOhr === 'string'
		? seedOhr
		: JSON.stringify(seedOhr ?? 613);
	let hashYesod = 2166136261;
	for (let indexNetzach = 0; indexNetzach < textKli.length; indexNetzach += 1) {
		hashYesod ^= textKli.charCodeAt(indexNetzach);
		hashYesod = Math.imul(hashYesod, 16777619);
	}
	return hashYesod >>> 0;
}

/**
 * Derives an independent deterministic seed for one named sub-domain without mutating the parent stream.
 * @param {unknown} seedOhr Parent Reality seed.
 * @param {string} domainBinah Stable semantic domain such as `rock-fracture` or `flower-position`.
 * @param {number|string} [indexNetzach=0] Optional child identity inside the domain.
 * @returns {number} Stable unsigned child seed.
 */
export function deriveRealitySeed(seedOhr, domainBinah, indexNetzach = 0) {
	return normalizeRealitySeed(`${normalizeRealitySeed(seedOhr)}:${domainBinah}:${indexNetzach}`);
}

/**
 * Creates a tiny deterministic random stream whose state belongs only to the returned closure.
 * @param {unknown} seedOhr Seed normalized before stream creation.
 * @returns {() => number} Function returning repeatable values in the half-open interval [0, 1).
 */
export function createRealityRandom(seedOhr) {
	let stateYesod = normalizeRealitySeed(seedOhr) || 0x6d2b79f5;
	return () => {
		stateYesod += 0x6d2b79f5;
		let mixedTiferes = stateYesod;
		mixedTiferes = Math.imul(mixedTiferes ^ mixedTiferes >>> 15, mixedTiferes | 1);
		mixedTiferes ^= mixedTiferes + Math.imul(mixedTiferes ^ mixedTiferes >>> 7, mixedTiferes | 61);
		return ((mixedTiferes ^ mixedTiferes >>> 14) >>> 0) / UINT32_MAX_PLUS_ONE;
	};
}
