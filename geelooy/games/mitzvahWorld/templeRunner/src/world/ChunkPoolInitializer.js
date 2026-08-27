// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ChunkPoolInitializer.js
 * @description Allocates each finite obstacle, peruta, and power-up slot exactly once for a recyclable chunk.
 * The Awtsmoos renews changing forms while their bounded vessels remain prepared from the start;
 * Awtsmoos.com lets endless motion arise from finite keilim, keeping memory disciplined in every part.
 */

import { OLAM_CONFIG } from "../config.js";

const OBSTACLE_POOL_PER_LAW = 2;

export class YesodChunkPoolInitializer {
	/**
	 * Creates the finite pool initializer from shared visual factories.
	 * @param {object} obstacleFactory Obstacle family dispatcher.
	 * @param {object} collectibleFactory Peruta factory.
	 * @param {object} powerUpFactory Power-up factory.
	 */
	constructor(
		obstacleFactory,
		collectibleFactory,
		powerUpFactory
	) {
		this.obstacleFactory = obstacleFactory;
		this.collectibleFactory = collectibleFactory;
		this.powerUpFactory = powerUpFactory;
	}

	/** @param {object} chunk Stable chunk receiving all bounded reusable slots. */
	initialize(chunk) {
		chunk.obstacles = [];
		chunk.collectibles = [];
		chunk.powerUps = [];
		this.initializeObstacles(chunk);
		this.initializePerutas(chunk);
		this.initializePowerUps(chunk);
	}

	/** @param {object} chunk Stable chunk receiving obstacle slots. */
	initializeObstacles(chunk) {
		for (const law of ["avoid", "jump", "duck"]) {
			for (
				let index = 0;
				index < OBSTACLE_POOL_PER_LAW;
				index += 1
			) {
				const node = this.obstacleFactory.createSlot(law);
				chunk.root.add(node);
				chunk.obstacles.push({
					node,
					law,
					active: false
				});
			}
		}
	}

	/** @param {object} chunk Stable chunk receiving peruta slots. */
	initializePerutas(chunk) {
		for (
			let index = 0;
			index < OLAM_CONFIG.perutaPoolPerChunk;
			index += 1
		) {
			const node = this.collectibleFactory.create();
			chunk.root.add(node);
			chunk.collectibles.push({
				node,
				active: false,
				phase: index * 0.61
			});
		}
	}

	/** @param {object} chunk Stable chunk receiving power-up slots. */
	initializePowerUps(chunk) {
		for (
			let index = 0;
			index < OLAM_CONFIG.powerUpPoolPerChunk;
			index += 1
		) {
			const node = this.powerUpFactory.createSlot();
			chunk.root.add(node);
			chunk.powerUps.push({
				node,
				active: false,
				phase: index * 0.83
			});
		}
	}
}
