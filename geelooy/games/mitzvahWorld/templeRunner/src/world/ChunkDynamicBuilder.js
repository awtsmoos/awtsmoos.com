//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ChunkDynamicBuilder.js
 * @description Coordinates lazy bounded chunk records, canonical peruta trails, and delegated Gevurah population.
 * The Awtsmoos renews each finite record while unseen forms remain peacefully concealed;
 * Awtsmoos.com lets one small coordinator reveal only what the living road has truly revealed.
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

	/** @param {object} chunk Stable chunk receiving fixed logical dynamic records. @returns {void} */
	initialize(chunk) {
		this.poolInitializer.initialize(chunk);
	}

	/**
	 * Configures one recycled chunk from the canonical Gevurah pattern language.
	 * @param {object} chunk Target chunk.
	 * @param {object} pattern Canonical pattern phrase.
	 * @param {number} seed Generation seed.
	 * @returns {void}
	 */
	populate(chunk, pattern, seed) {
		const perutas = this.trailFactory.create(pattern.trail || {});
		this.populator.populate(
			chunk,
			pattern.obstacles || [],
			perutas,
			pattern,
			seed
		);
	}

	/**
	 * Deactivates every logical record while hiding only nodes that already exist.
	 * @param {object} chunk Recyclable chunk being cleared.
	 * @returns {void}
	 */
	clear(chunk) {
		for (const record of [
			...chunk.obstacles,
			...chunk.collectibles,
			...chunk.powerUps
		]) {
			this.hideRecord(record);
		}
	}

	/**
	 * Hides one record without accidentally materializing a lazy reserve.
	 * Plain legacy records remain supported for tests and compatibility.
	 * @param {object} record Dynamic pool record.
	 * @returns {void}
	 */
	hideRecord(record) {
		record.active = false;
		const node = typeof record.peekNode === "function"
			? record.peekNode()
			: record.node;
		if (node) {
			node.visible = false;
		}
	}
}
