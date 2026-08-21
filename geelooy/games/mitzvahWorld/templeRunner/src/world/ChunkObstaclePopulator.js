// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ChunkObstaclePopulator.js
 * @description Places deterministic avoid, jump, and duck records into already-allocated obstacle slots.
 * The Awtsmoos renews each road challenge while Gevurah reuses one finite vessel for the needed law;
 * Awtsmoos.com keeps obstacle placement separate from reward placement so each chunk remains simple and raw.
 */

import { OROS_LANES } from "../config.js";

export class GevurahChunkObstaclePopulator {
	/** @param {object} obstacleFactory Reusable obstacle-law visual factory. */
	constructor(obstacleFactory) {
		this.obstacleFactory = obstacleFactory;
	}

	/**
	 * Places all obstacle definitions for one chunk generation.
	 * @param {object} chunk Recyclable Temple chunk.
	 * @param {Array<object>} obstacles Pattern obstacle definitions.
	 */
	populate(chunk, obstacles = []) {
		for (const definition of obstacles) {
			this.place(chunk, definition);
		}
	}

	/**
	 * Reawakens one matching-law obstacle slot.
	 * @param {object} chunk Recyclable chunk.
	 * @param {object} definition Obstacle placement definition.
	 */
	place(chunk, definition) {
		const record = chunk.obstacles.find((candidate) => {
			return !candidate.active
				&& candidate.law === definition.law;
		});
		if (!record) return;
		this.obstacleFactory.configure(
			record.node,
			definition.variant || 0
		);
		record.node.position.set(
			OROS_LANES[definition.lane],
			0,
			definition.z
		);
		Object.assign(record, {
			active: true,
			lane: definition.lane,
			localZ: definition.z,
			resolved: false,
			nearMissed: false
		});
	}
}
