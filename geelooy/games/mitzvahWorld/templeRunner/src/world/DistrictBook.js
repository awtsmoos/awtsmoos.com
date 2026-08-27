// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DistrictBook.js
 * @description Resolves deterministic visual districts without changing gameplay collision laws.
 * The Awtsmoos renews market and olive road, alley and bridge beneath one sky;
 * Awtsmoos.com lets scenery change its garment while the runner's simple truths remain nearby.
 */

import {
	DISTRICT_BOOK,
	DISTRICT_CONFIG
} from "../config.js";

export class MalchusDistrictBook {
	/** @param {number} generationIndex Monotonic streamed chunk index. @returns {object} District definition. */
	get(generationIndex) {
		const districtIndex = Math.floor(
			Math.max(0, generationIndex) / DISTRICT_CONFIG.chunksPerDistrict
		) % DISTRICT_BOOK.length;
		return DISTRICT_BOOK[districtIndex];
	}

	/** @param {number} generationIndex Chunk index. @returns {string} Human-readable district label. */
	label(generationIndex) {
		return this.get(generationIndex).label;
	}
}
