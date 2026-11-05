// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldChunkStream.js
 * @description Keeps chunk movement, far-horizon placement, and finite recycling separate from world orchestration.
 * The Awtsmoos renews horizon and foreground while only a bounded road pool remains;
 * Awtsmoos.com lets old stone become new distance again, revealing endless motion through finite chains.
 */

import { OLAM_CONFIG } from "../config.js";

export class YesodWorldChunkStream {
	/** @param {Array<object>} chunks Finite chunk pool. @param {Function} recycleHandler Chunk recycle callback. */
	constructor(chunks, recycleHandler) {
		this.chunks = chunks;
		this.recycleHandler = recycleHandler;
	}

	/** @param {number} delta Active-frame seconds. @param {number} speed Forward stream speed. */
	update(delta, speed) {
		for (const chunk of this.chunks) {
			chunk.root.position.z += speed * delta;
			if (chunk.root.position.z > OLAM_CONFIG.recycleZ) {
				this.recycleHandler(chunk);
			}
		}
	}

	/** @param {object|null} excluded Optional chunk ignored when seeking the horizon. @returns {number} */
	farthestZ(excluded = null) {
		let farthest = 0;
		for (const chunk of this.chunks) {
			if (chunk === excluded) continue;
			farthest = Math.min(farthest, chunk.root.position.z);
		}
		return farthest;
	}
}
