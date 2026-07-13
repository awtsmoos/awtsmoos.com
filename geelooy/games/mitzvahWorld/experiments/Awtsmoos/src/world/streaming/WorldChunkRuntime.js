// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkRuntime.js
 * @description Installs visual ownership and one live collision streaming vessel.
 * The Awtsmoos renews the valley through bounded lifecycle work; Awtsmoos.com keeps
 * bootstrap identity and query continuity while collision children ripen across frames.
 */
import { LodTransitionQueue } from '../../lod/LodTransitionQueue.js';
import {
	BOOTSTRAP_WORLD_CHUNK_ID,
	createBootstrapWorldChunk
} from './WorldChunkBootstrap.js';
import { createWorldChunkCollisionRuntime } from './WorldChunkCollisionRuntime.js';
import { WorldChunkRegistry } from './WorldChunkRegistry.js';

export class WorldChunkRuntime {
	constructor({
		terrain,
		mainOctree,
		transitionQueue,
		collisionGenerate,
		collisionMeasure
	} = {}) {
		this.registry = new WorldChunkRegistry({
			transitionQueue: transitionQueue || new LodTransitionQueue()
		});
		this.bootstrapRecord = createBootstrapWorldChunk({ terrain, mainOctree });
		if (!this.registry.register(this.bootstrapRecord)) {
			throw new Error('Bootstrap world chunk registration failed.');
		}
		this.collisionRuntime = createWorldChunkCollisionRuntime({
			bootstrapRecord: this.bootstrapRecord,
			mainOctree,
			generate: collisionGenerate,
			measure: collisionMeasure
		});
		this.collisionQuery = this.collisionRuntime.query;
		this.lastProcess = null;
	}

	/** Advances visual work and at most one collision operation. */
	update({
		at,
		maximumTransitions = 2,
		maximumCost = 4,
		maximumCollisionOperations = 1
	} = {}) {
		const visual = this.registry.process({
			maximumTransitions,
			maximumCost
		});
		const collision = this.collisionRuntime.update({
			at,
			maximumOperations: maximumCollisionOperations
		});
		this.lastProcess = Object.freeze({
			...visual,
			visual,
			collision
		});
		return this.lastProcess;
	}

	/** Accepts one manually triggered bootstrap collision subdivision. */
	requestBootstrapSubdivision(options) {
		return this.collisionRuntime.requestBootstrapSubdivision(options);
	}

	/** Requests safe pre-activation collision rollback. */
	cancelCollisionStreaming(options) {
		return this.collisionRuntime.cancelStreaming(options);
	}

	/** Authorizes parent retirement after retained observation. */
	requestCollisionParentRetirement(options) {
		return this.collisionRuntime.requestParentRetirement(options);
	}

	/** Returns visual registry, collision ownership, and query diagnostics. */
	diagnostics() {
		return Object.freeze({
			bootstrapId: BOOTSTRAP_WORLD_CHUNK_ID,
			bootstrapSeed: this.bootstrapRecord.deterministicSeed,
			bootstrapBounds: this.bootstrapRecord.bounds,
			collision: this.collisionRuntime.diagnostics(),
			...this.registry.diagnostics()
		});
	}
}

/** Creates one runtime around the already built terrain and collision world. */
export function createWorldChunkRuntime(options) {
	return new WorldChunkRuntime(options);
}
