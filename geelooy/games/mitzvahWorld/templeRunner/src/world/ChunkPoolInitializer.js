//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ChunkPoolInitializer.js
 * @description Allocates the complete finite gameplay record capacity while deferring every unused visual node.
 * The Awtsmoos renews bounded possibility before obstacle, peruta, or gift takes form;
 * Awtsmoos.com lets finite keilim remain ready while invisible geometry sleeps beyond the storm.
 */

import { OLAM_CONFIG } from "../config.js";
import { YesodLazyChunkPoolRecord } from "./LazyChunkPoolRecord.js";

const OBSTACLE_POOL_PER_LAW = 2;

export class YesodChunkPoolInitializer {
	/**
	 * Creates the finite logical pool initializer from shared visual factories.
	 * @param {object} obstacleFactory Obstacle family dispatcher.
	 * @param {object} collectibleFactory Peruta factory.
	 * @param {object} powerUpFactory Power-up factory.
	 */
	constructor(obstacleFactory, collectibleFactory, powerUpFactory) {
		this.obstacleFactory = obstacleFactory;
		this.collectibleFactory = collectibleFactory;
		this.powerUpFactory = powerUpFactory;
	}

	/**
	 * Allocates all fixed logical records without constructing unused nodes.
	 * @param {object} chunk Stable recyclable chunk.
	 * @returns {void}
	 */
	initialize(chunk) {
		chunk.obstacles = [];
		chunk.collectibles = [];
		chunk.powerUps = [];
		this.initializeObstacles(chunk);
		this.initializePerutas(chunk);
		this.initializePowerUps(chunk);
	}

	/**
	 * Allocates two logical records for each obstacle law.
	 * @param {object} chunk Stable recyclable chunk.
	 * @returns {void}
	 */
	initializeObstacles(chunk) {
		for (const law of ["avoid", "jump", "duck"]) {
			for (let index = 0; index < OBSTACLE_POOL_PER_LAW; index += 1) {
				chunk.obstacles.push(this.createRecord(
					chunk,
					() => this.obstacleFactory.createSlot(law),
					{ law, active: false }
				));
			}
		}
	}

	/**
	 * Allocates the configured logical peruta capacity.
	 * @param {object} chunk Stable recyclable chunk.
	 * @returns {void}
	 */
	initializePerutas(chunk) {
		for (let index = 0; index < OLAM_CONFIG.perutaPoolPerChunk; index += 1) {
			chunk.collectibles.push(this.createRecord(
				chunk,
				() => this.collectibleFactory.create(),
				{ active: false, phase: index * 0.61 }
			));
		}
	}

	/**
	 * Allocates the configured logical power-up capacity.
	 * @param {object} chunk Stable recyclable chunk.
	 * @returns {void}
	 */
	initializePowerUps(chunk) {
		for (let index = 0; index < OLAM_CONFIG.powerUpPoolPerChunk; index += 1) {
			chunk.powerUps.push(this.createRecord(
				chunk,
				() => this.powerUpFactory.createSlot(),
				{ active: false, phase: index * 0.83 }
			));
		}
	}

	/**
	 * Creates one lazy logical record attached to the owning chunk only when revealed.
	 * @param {object} chunk Stable recyclable chunk.
	 * @param {() => object} createNode Deferred visual node factory.
	 * @param {object} values Initial record metadata.
	 * @returns {YesodLazyChunkPoolRecord} Lazy finite pool record.
	 */
	createRecord(chunk, createNode, values) {
		return new YesodLazyChunkPoolRecord({
			root: chunk.root,
			createNode,
			values
		});
	}
}
