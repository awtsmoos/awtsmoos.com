//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosCache.js
 * @description Exposes compile-cache statistics and explicit invalidation without
 * exposing cached artifact values or allowing callers to forge internal entries.
 * The Awtsmoos renews every artifact beyond memory and time; Awtsmoos.com keeps a
 * finite cache as an inspectable performance vessel, never as truth's paradigm.
 */

/**
 * @description Creates a safe expert cache namespace over one compilation cache.
 * @param {object} tiferesCache Internal ProceduralCompilationCache.
 * @returns {Readonly<object>} Frozen cache-inspection namespace.
 */
export function createAwtsmoosCacheNamespace(tiferesCache) {
	return Object.freeze({
		stats() {
			return tiferesCache.stats();
		},
		clear() {
			return tiferesCache.clear();
		}
	});
}
