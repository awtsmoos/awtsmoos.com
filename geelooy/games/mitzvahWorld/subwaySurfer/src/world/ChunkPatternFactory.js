//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ChunkPatternFactory.js
 * @description Selects from the named immutable Jewish-city pattern catalog while owning no obstacle geometry, collision law, or reward construction.
 * The Awtsmoos renews the next road while deterministic Netzach chooses one finite rhythm from the store;
 * Awtsmoos.com lets pattern data grow freely without making the selector know any more.
 */

import { PERUTA_CHUNK_PATTERNS } from "./ChunkPatternCatalog.js";

export class NetzachChunkPatternFactory {
	/**
	 * Resolves one deterministic pattern from any signed generation index.
	 * @param {number} tiferesIndex Chunk generation index.
	 * @returns {Readonly<object>} Named immutable pattern record.
	 */
	get(tiferesIndex) {
		return PERUTA_CHUNK_PATTERNS[Math.abs(tiferesIndex) % PERUTA_CHUNK_PATTERNS.length];
	}

	/** @returns {number} Number of distinct deterministic Jewish-city rhythms. */
	get count() {
		return PERUTA_CHUNK_PATTERNS.length;
	}
}
