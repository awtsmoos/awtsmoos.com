// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionIncrementalSources.js
 * @description Scans, deduplicates, bounds, and sorts source triangles in batches.
 * The Awtsmoos knows every triangle as one utterance; Awtsmoos.com reveals each
 * unique geometric vessel without forcing the whole mountain through one frame.
 */
import { createWorldChunkCollisionTriangleBounds } from './WorldChunkCollisionTriangleBounds.js';
import { WorldChunkCollisionTriangleIdentity } from './WorldChunkCollisionTriangleIdentity.js';
import { compareCollisionSourceKeys } from './WorldChunkCollisionIncrementalValues.js';

export class WorldChunkCollisionIncrementalSources {
	constructor() {
		this.identity = new WorldChunkCollisionTriangleIdentity();
		this.byKey = new Map();
		this.uniqueSources = [];
		this.sourceCursor = 0;
		this.runCursor = 0;
		this.runs = [];
	}

	/** Scans at most the requested number of source triangles. */
	scan(triangles, maximumUnits) {
		let units = 0;
		while (units < maximumUnits && this.sourceCursor < triangles.length) {
			this.scanOne(triangles[this.sourceCursor]);
			this.sourceCursor += 1;
			units += 1;
		}
		return units;
	}

	/** Creates at most the requested number of bounded sorted runs. */
	createRuns(maximumUnits, runSize) {
		let units = 0;
		while (units < maximumUnits && this.runCursor < this.uniqueSources.length) {
			const end = Math.min(this.runCursor + runSize, this.uniqueSources.length);
			const run = this.uniqueSources
				.slice(this.runCursor, end)
				.sort(compareCollisionSourceKeys);
			this.runs.push(run);
			this.runCursor = end;
			units += 1;
		}
		return units;
	}

	/** Returns compact source progress without collider references. */
	diagnostics(sourceCount) {
		return Object.freeze({
			sourceCount,
			sourceCursor: this.sourceCursor,
			uniqueSourceCount: this.uniqueSources.length,
			duplicateSourceCount: this.sourceCursor - this.uniqueSources.length,
			runCursor: this.runCursor,
			runCount: this.runs.length
		});
	}

	scanOne(triangle) {
		const key = this.identity.keyFor(triangle);
		if (!key.startsWith('triangle|')) {
			throw new TypeError('Collision child generation accepts triangle colliders only.');
		}
		if (this.byKey.has(key)) {
			return;
		}
		const source = Object.freeze({
			key,
			triangle,
			bounds: createWorldChunkCollisionTriangleBounds(triangle)
		});
		this.byKey.set(key, source);
		this.uniqueSources.push(source);
	}
}
