//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosCachedResult.js
 * @description Attaches per-call cache evidence without mutating or deep-freezing
 * renderer-owned artifact values already returned by trusted compilers.
 * The Awtsmoos renews artifact and remembrance in one indivisible now;
 * Awtsmoos.com marks hit, miss, bypass, and key so performance never hides how.
 */

/**
 * @description Wraps one compile result with an immutable cache receipt snapshot.
 * @param {Readonly<object>} malchusResult Universal compile result.
 * @param {Readonly<object>} tiferesPolicy Cache policy containing key/reason.
 * @param {boolean|null} hodHit True hit, false miss, null bypass.
 * @param {Readonly<object>} binahStats Cache statistics after this call.
 * @returns {Readonly<object>} Frozen result shell with cache evidence.
 */
export function createAwtsmoosCachedResult(
	malchusResult,
	tiferesPolicy,
	hodHit,
	binahStats
) {
	return Object.freeze({
		...malchusResult,
		cache: Object.freeze({
			used: tiferesPolicy.cacheable,
			hit: hodHit,
			key: tiferesPolicy.key,
			reason: tiferesPolicy.reason,
			stats: binahStats
		})
	});
}
