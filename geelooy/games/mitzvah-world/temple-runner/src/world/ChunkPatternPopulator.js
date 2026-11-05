// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ChunkPatternPopulator.js
 * @description Composes Gevurah obstacle placement with Chesed reward placement while preserving the historical chunk-population contract.
 * The Awtsmoos renews challenge and reward through separate vessels before one recycled road may live again;
 * Awtsmoos.com keeps this coordinator tiny, so placement laws stay clear while endless variation returns without strain.
 */

import { GevurahChunkObstaclePopulator } from "./ChunkObstaclePopulator.js";
import { ChesedChunkRewardPopulator } from "./ChunkRewardPopulator.js";

export class GevurahChunkPatternPopulator {
	/**
	 * @param {object} obstacleFactory Obstacle facade.
	 * @param {object} collectibleFactory Peruta factory.
	 * @param {object} powerUpFactory Power-up factory.
	 */
	constructor(
		obstacleFactory,
		collectibleFactory,
		powerUpFactory
	) {
		this.obstacles = new GevurahChunkObstaclePopulator(
			obstacleFactory
		);
		this.rewards = new ChesedChunkRewardPopulator(
			collectibleFactory,
			powerUpFactory
		);
	}

	/**
	 * Configures one recycled chunk from canonical pattern components.
	 * @param {object} chunk Target chunk.
	 * @param {Array<object>} obstacles Obstacle phrases.
	 * @param {Array<object>} perutas Peruta placements.
	 * @param {object} pattern Canonical pattern phrase.
	 * @param {number} seed Generation seed.
	 */
	populate(chunk, obstacles, perutas, pattern, seed) {
		this.obstacles.populate(chunk, obstacles);
		this.rewards.populate(
			chunk,
			{
				placements: perutas,
				lane: pattern.trail?.lane
			},
			seed
		);
	}
}
