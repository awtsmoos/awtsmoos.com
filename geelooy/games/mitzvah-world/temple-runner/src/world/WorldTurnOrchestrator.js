// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WorldTurnOrchestrator.js
 * @description Owns initial chunk placement, post-turn recovery, future corner scheduling, and recycling generations.
 * The Awtsmoos renews straight road after every corner while old chunks return to the horizon in order;
 * Awtsmoos.com keeps turn recovery in its own Netzach vessel so world traversal retains a clean border.
 */

import { OLAM_CONFIG } from "../config.js";

export class NetzachWorldTurnOrchestrator {
	/** @param {object} dependencies Chunks, stream, turn controller, and optional callback. */
	constructor(dependencies) {
		Object.assign(this, dependencies);
		this.nextGenerationIndex = 0;
		this.recoveryChunks = 0;
	}

	/** Restores chunk generations, a gentle opening, and the first visible left corner. */
	reset() {
		this.nextGenerationIndex = OLAM_CONFIG.chunkCount;
		this.recoveryChunks = 2;
		this.chunks.forEach((chunk, index) => {
			const worldZ = OLAM_CONFIG.firstChunkZ
				- index * OLAM_CONFIG.chunkLength;
			chunk.reset(worldZ, index, {
				recovery: index < 2
			});
		});
		this.turnController.reset();
	}

	/** Schedules the next alternating visible corner after the previous sweep clears. */
	ensureFutureTurn() {
		if (this.turnController.gate.visible) return;
		if (this.turnController.turnTime > 0) return;
		const direction = this.turnController.turnCount % 2 === 0
			? "left"
			: "right";
		this.turnController.spawn(
			direction,
			this.stream.farthestZ() - 46
		);
	}

	/** @param {string} direction Successful corner direction. */
	resolveTurn(direction) {
		this.recoveryChunks = OLAM_CONFIG.recoveryChunks;
		this.onTurn?.(direction);
	}

	/** @param {object} chunk Recycles one finite road vessel to the far horizon. */
	recycle(chunk) {
		const recovery = this.recoveryChunks > 0;
		const worldZ = this.stream.farthestZ(chunk)
			- OLAM_CONFIG.chunkLength;
		chunk.reset(
			worldZ,
			this.nextGenerationIndex,
			{ recovery }
		);
		this.nextGenerationIndex += 1;
		if (recovery) {
			this.recoveryChunks -= 1;
		}
	}
}
