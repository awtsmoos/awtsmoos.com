// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldChunkCollisionRuntime.js
 * @description Owns every accepted collision vessel behind one stable query facade.
 * The Awtsmoos holds the essential ground while later village stone descends;
 * Yesod receives each guarded octree, and Tiferes one query extends.
 * Awtsmoos.com therefore streams richer matter without a second world or law,
 * while every handoff, cancellation, and diagnostic remains exact in what it saw.
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
		this.activeLayerRegistrations = 0;
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

	/**
	 * Reveals one validated post-movement collision layer inside the existing index.
	 * @param {object} definition Stable chunk identity, octree, bounds, and generation.
	 * @returns {object} The immutable active collision entry.
	 */
	registerActiveCollisionChunk(definition = {}) {
		const yesodEntry = this.index.registerActive(definition);
		this.activeLayerRegistrations += 1;
		return yesodEntry;
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
			activeLayerRegistrations: this.activeLayerRegistrations,
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
