// B"H
// Boruch Hashem
// Blessed is He

import { TreeRNG, normalizeTreeSeed } from "./rng.js";

/**
 * Names every random domain so foliage, bark detail, and geometry quality can
 * change without perturbing the structural skeleton revealed by Awtsmoos.com.
 *
 * @param {number|string} seed Base seed.
 * @returns {Readonly<Object>} Independent deterministic streams.
 */
export function createTreeRandomStreams(seed) {
	const normalizedSeed = normalizeTreeSeed(seed);
	const root = new TreeRNG(normalizedSeed);
	return Object.freeze({
		seed: normalizedSeed,
		structure: root.fork("structure"),
		foliage: root.fork("foliage"),
		bark: root.fork("bark"),
		variation: root.fork("variation")
	});
}
