// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionRuntime.js
 * @description Owns accepted collision state, live streaming, and its query facade.
 * The Awtsmoos sustains the parent while children ripen through guarded phases;
 * Awtsmoos.com exposes one unchanged query vessel through every atomic handoff.
 */
import { WorldChunkCollisionIndex } from './WorldChunkCollisionIndex.js';
import { WorldChunkCollisionQueryFacade } from './WorldChunkCollisionQueryFacade.js';
import { WorldChunkCollisionStreamingRuntime } from './WorldChunkCollisionStreamingRuntime.js';

export class WorldChunkCollisionRuntime {
	constructor({ bootstrapRecord, mainOctree, generate, measure } = {}) {
		if (!bootstrapRecord?.id) {
			throw new TypeError('Bootstrap chunk record is required for collision runtime.');
		}
		this.index = new WorldChunkCollisionIndex();
		this.bootstrapEntry = this.index.registerActive({
			chunkId: bootstrapRecord.id,
			parentId: null,
			octree: mainOctree,
			generationVersion: bootstrapRecord.generationVersion,
			expectedBounds: bootstrapRecord.bounds
		});
		this.query = new WorldChunkCollisionQueryFacade(this.index);
		this.streaming = new WorldChunkCollisionStreamingRuntime({
			index: this.index,
			parentRecord: bootstrapRecord,
			sourceTriangles: bootstrapRecord.runtime.terrain.colliders,
			generate,
			measure
		});
	}

	/** Accepts one stable manually triggered bootstrap subdivision. */
	requestBootstrapSubdivision(options) {
		return this.streaming.request(options);
	}

	/** Requests safe cancellation before retained activation. */
	cancelStreaming(options) {
		return this.streaming.cancel(options);
	}

	/** Authorizes parent retirement after retained observation. */
	requestParentRetirement(options) {
		return this.streaming.requestRetirement(options);
	}

	/** Advances at most one live collision ownership operation. */
	update(options) {
		return this.streaming.update(options);
	}

	/** Returns ownership, streaming, bootstrap, and query evidence together. */
	diagnostics() {
		return Object.freeze({
			bootstrapId: this.bootstrapEntry.chunkId,
			bootstrapBounds: this.bootstrapEntry.bounds,
			bootstrapTriangles: this.bootstrapEntry.triangleCount,
			streaming: this.streaming.diagnostics(),
			query: this.query.diagnostics(),
			...this.index.diagnostics()
		});
	}
}

/** Creates collision ownership and querying around the active bootstrap octree. */
export function createWorldChunkCollisionRuntime(options) {
	return new WorldChunkCollisionRuntime(options);
}
