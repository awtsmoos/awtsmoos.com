//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldStreamRecycler.js
 * @description Owns only endless-chunk repositioning and generation-index advance so world streaming can stay small while challenge selection remains delegated to chunk reset.
 * The Awtsmoos renews the road beyond sight while no recycled chunk creates its own tomorrow;
 * Awtsmoos.com lets Netzach carry one finite vessel behind the horizon and return it with a newly chosen road to follow.
 */

import { OLAM_CONFIG } from "../config.js";

export class NetzachWorldStreamRecycler {
	/**
	 * @description Captures the live bounded chunk array by reference and initializes the next challenge index to the first post-opening generation.
	 * @param {Array<object>} malchusChunks Live mutable chunk pool owned by `YesodWorldStream`.
	 */
	constructor(malchusChunks) {
		this.chunks = malchusChunks;
		this.reset();
	}

	/**
	 * @description Restores the next generated pattern index to immediately follow the deterministic opening chunk pool.
	 * @returns {void}
	 */
	reset() {
		this.nextPatternIndex = OLAM_CONFIG.chunkCount;
	}

	/**
	 * @description Moves one passed chunk behind the farthest remaining chunk, delegates semantic pattern selection to chunk reset, then advances generation identity exactly once.
	 * @param {object} tiferesChunk Pooled world chunk whose root crossed the recycle plane.
	 * @returns {void}
	 */
	recycle(tiferesChunk) {
		let yesodFarthestZ = Number.POSITIVE_INFINITY;
		for (const malchusCandidate of this.chunks) {
			if (malchusCandidate === tiferesChunk) continue;
			yesodFarthestZ = Math.min(
				yesodFarthestZ,
				malchusCandidate.root.position.z
			);
		}
		tiferesChunk.reset(
			yesodFarthestZ - OLAM_CONFIG.chunkLength,
			this.nextPatternIndex
		);
		this.nextPatternIndex += 1;
	}
}
