// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldChunkRuntime.js
 * @description Owns visual transitions and every collision layer behind one shared indexed authority.
 * The Awtsmoos renews essential ground before distant stone is dressed;
 * Awtsmoos.com lets one collision source index follow each foot while deeper streaming remains measured and blessed.
 */

import { LodTransitionQueue } from '../../lod/LodTransitionQueue.js';
import {
	BOOTSTRAP_WORLD_CHUNK_ID,
	createBootstrapWorldChunk
} from './WorldChunkBootstrap.js';
import { createWorldChunkCollisionRuntime } from './WorldChunkCollisionRuntime.js';
import { updateWorldChunkRuntime } from './WorldChunkRuntimeUpdate.js';
import { WorldChunkRegistry } from './WorldChunkRegistry.js';
import { WorldLocalCollisionStreamingRuntime } from './WorldLocalCollisionStreamingRuntime.js';

export class WorldChunkRuntime {
	constructor({
		terrain,
		mainOctree,
		collisionSourceIndex,
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
		this.localCollisionStreaming = new WorldLocalCollisionStreamingRuntime({
			octree: mainOctree,
			sourceIndex: collisionSourceIndex,
			sourceTriangles: terrain.colliders,
			terrainGridSteps: terrain.worldMetadata?.terrainGridSteps
		});
		this.collisionQuery = this.collisionRuntime.query;
		this.lastProcess = null;
	}

	update(options) {
		this.lastProcess = updateWorldChunkRuntime(this, options);
		return this.lastProcess;
	}

	ensureLocalCollision(position, radius) {
		if (!this.isBootstrapCollisionActive()) {
			throw new Error('Local collision bootstrap is no longer the active parent.');
		}
		return this.localCollisionStreaming.ensureLocalCollision(position, radius);
	}

	registerActiveCollisionChunk(definition) {
		return this.collisionRuntime.registerActiveCollisionChunk(definition);
	}

	requestBootstrapSubdivision(options) {
		return this.collisionRuntime.requestBootstrapSubdivision(options);
	}

	cancelCollisionStreaming(options) {
		return this.collisionRuntime.cancelStreaming(options);
	}

	requestCollisionParentRetirement(options) {
		return this.collisionRuntime.requestParentRetirement(options);
	}

	diagnostics() {
		return Object.freeze({
			bootstrapId: BOOTSTRAP_WORLD_CHUNK_ID,
			bootstrapSeed: this.bootstrapRecord.deterministicSeed,
			bootstrapBounds: this.bootstrapRecord.bounds,
			localCollision: this.localCollisionStreaming.diagnostics(),
			collision: this.collisionRuntime.diagnostics(),
			...this.registry.diagnostics()
		});
	}

	updateLocalCollision(options) {
		if (!options.playerPosition || !this.isBootstrapCollisionActive()) {
			return Object.freeze({ processed: 0, ...this.localCollisionStreaming.diagnostics() });
		}
		return this.localCollisionStreaming.update(options);
	}

	isBootstrapCollisionActive() {
		return this.collisionRuntime.index.hasActive(this.bootstrapRecord.id);
	}
}

export function createWorldChunkRuntime(options) {
	return new WorldChunkRuntime(options);
}
