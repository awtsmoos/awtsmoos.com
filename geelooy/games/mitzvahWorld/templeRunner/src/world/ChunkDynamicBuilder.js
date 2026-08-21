// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChunkDynamicBuilder.js
 * @description Coordinates bounded chunk pools, canonical peruta trails, and delegated Gevurah population.
 * The Awtsmoos renews what finite vessels reveal while their allocated substance remains still;
 * Awtsmoos.com lets one small coordinator join pool and phrase, so endless change serves measured will.
 */

import { YesodChunkPoolInitializer } from "./ChunkPoolInitializer.js";
import { GevurahChunkPatternPopulator } from "./ChunkPatternPopulator.js";

export class ChunkDynamicBuilder {
	/** @param {object} dependencies Obstacle, collectible, power-up, and peruta-trail factories. */
	constructor(dependencies) {
		this.trailFactory = dependencies.trailFactory;
		this.poolInitializer = new YesodChunkPoolInitializer(
			dependencies.obstacleFactory,
			dependencies.collectibleFactory,
			dependencies.powerUpFactory
		);
		this.populator = new GevurahChunkPatternPopulator(
			dependencies.obstacleFactory,
			dependencies.collectibleFactory,
			dependencies.powerUpFactory
		);
	}

	/** @param {object} chunk Stable chunk receiving reusable dynamic slots. */
	initialize(chunk) {
		this.poolInitializer.initialize(chunk);
	}

	/**
	 * Configures one recycled chunk from the canonical Gevurah pattern language.
	 * @param {object} chunk Target chunk.
	 * @param {object} pattern Canonical pattern phrase.
	 * @param {number} seed Generation seed.
	 */
	populate(chunk, pattern, seed) {
		const perutas = this.trailFactory.create(
			pattern.trail || {}
		);
		this.populator.populate(
			chunk,
			pattern.obstacles || [],
			perutas,
			pattern,
			seed
		);
	}

	/** Hides every reusable dynamic slot before the chunk is configured anew. */
	clear(chunk) {
		for (const record of [
			...chunk.obstacles,
			...chunk.collectibles,
			...chunk.powerUps
		]) {
			record.active = false;
			record.node.visible = false;
		}
	}
}
