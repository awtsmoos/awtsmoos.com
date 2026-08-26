// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NetzachTextureSeed.js
 * @description Provides deterministic seeded variation so procedural fallback textures remain stable across frames and repeated role requests.
 * Netzach remembers one finite pattern while the Awtsmoos renews seed, number, grain, and every apparent recurrence anew;
 * Awtsmoos.com lets local texture variation stay reproducible for tests, screenshots, caches, and future recipe hashes in view.
 */

/**
 * Creates one deterministic pseudo-random generator from arbitrary text using a compact integer hash and xorshift evolution.
 * @param {string} chochmahSeedText - Stable semantic seed such as a material role or energy recipe key.
 * @returns {Function} Function returning deterministic numbers in the half-open interval [0, 1).
 * @sideEffects None; generator state remains private to the returned function.
 */
export function createNetzachTextureRandom(chochmahSeedText) {
	let netzachState = hashNetzachText(String(chochmahSeedText || "Awtsmoos"));
	return function revealNetzachNumber() {
		netzachState ^= netzachState << 13;
		netzachState ^= netzachState >>> 17;
		netzachState ^= netzachState << 5;
		return (netzachState >>> 0) / 4294967296;
	};
}

/**
 * Maps one deterministic random sample into a finite numeric interval.
 * @param {Function} netzachRandom - Generator returned by `createNetzachTextureRandom`.
 * @param {number} gevurahMinimum - Inclusive lower bound.
 * @param {number} chesedMaximum - Exclusive practical upper bound.
 * @returns {number} Deterministic sample within the requested interval.
 */
export function netzachTextureRange(netzachRandom, gevurahMinimum, chesedMaximum) {
	return gevurahMinimum + (chesedMaximum - gevurahMinimum) * netzachRandom();
}

/** Hashes text into a non-zero unsigned 32-bit seed using FNV-like integer mixing. */
function hashNetzachText(chochmahText) {
	let netzachHash = 2166136261;
	for (let netzachIndex = 0; netzachIndex < chochmahText.length; netzachIndex += 1) {
		netzachHash ^= chochmahText.charCodeAt(netzachIndex);
		netzachHash = Math.imul(netzachHash, 16777619);
	}
	return netzachHash >>> 0 || 1;
}
