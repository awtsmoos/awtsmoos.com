// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionIncrementalAssignments.js
 * @description Assigns canonical source triangles to closed child bounds in batches.
 * The Awtsmoos fills every touching vessel without losing the source; Awtsmoos.com
 * records boundary duplication through the canonical identity of each collision child.
 */
import { collisionBoundsClosedOverlap } from './WorldChunkCollisionTriangleBounds.js';
import {
	createCollisionDigestState,
	updateCollisionDigestState
} from './WorldChunkCollisionIncrementalDiagnostics.js';

export class WorldChunkCollisionIncrementalAssignments {
	constructor(children, sourceCount, duplicateSourceCount) {
		this.children = children;
		this.sourceCount = sourceCount;
		this.duplicateSourceCount = duplicateSourceCount;
		this.sourceCursor = 0;
		this.sourceKeys = [];
		this.totalAssignments = 0;
		this.buckets = new Map(children.map((child) => [
			child.chunkId,
			createBucket(child)
		]));
	}

	/** Assigns at most the requested number of canonical sources. */
	step(sources, maximumUnits) {
		let units = 0;
		while (units < maximumUnits && this.sourceCursor < sources.length) {
			this.assignOne(sources[this.sourceCursor]);
			this.sourceCursor += 1;
			units += 1;
		}
		return units;
	}

	/** Returns the public assignment shape preserved by the compatibility factory. */
	result() {
		const runtime = this.runtimeResult();
		return Object.freeze({
			...runtime,
			assignments: Object.freeze(runtime.assignments.map((assigned) => Object.freeze({
				child: assigned.child,
				triangles: assigned.triangles,
				triangleKeys: assigned.triangleKeys
			})))
		});
	}

	/** Returns assignments with private digest state for incremental child builds. */
	runtimeResult() {
		if (this.sourceCursor !== this.sourceKeys.length) {
			throw new Error('Incremental child assignment is incomplete.');
		}
		const assignments = this.children.map((child) => {
			const bucket = this.buckets.get(child.chunkId);
			return Object.freeze({
				child,
				triangles: Object.freeze(bucket.triangles),
				triangleKeys: Object.freeze(bucket.triangleKeys),
				digestState: bucket.digestState
			});
		});
		const uniqueSourceCount = this.sourceKeys.length;
		return Object.freeze({
			assignments: Object.freeze(assignments),
			sourceCount: this.sourceCount,
			uniqueSourceCount,
			duplicateSourceCount: this.duplicateSourceCount,
			totalAssignments: this.totalAssignments,
			overlapDuplicationCount: this.totalAssignments - uniqueSourceCount,
			sourceKeys: Object.freeze(this.sourceKeys)
		});
	}

	/** Returns compact assignment progress. */
	diagnostics() {
		return Object.freeze({
			sourceCursor: this.sourceCursor,
			sourceKeyCount: this.sourceKeys.length,
			totalAssignments: this.totalAssignments
		});
	}

	/** Assigns one canonical source to every closed child bound it touches. */
	assignOne(source) {
		const touchedChildren = this.children.filter((child) => (
			collisionBoundsClosedOverlap(source.bounds, child.bounds)
		));
		if (touchedChildren.length === 0) {
			throw new Error(`Triangle ${source.key} reached no collision child.`);
		}
		for (const child of touchedChildren) {
			const bucket = this.buckets.get(child.chunkId);
			bucket.triangles.push(source.triangle);
			bucket.triangleKeys.push(source.key);
			bucket.digestState = updateCollisionDigestState(
				bucket.digestState,
				source.key,
				bucket.triangleKeys.length - 1
			);
		}
		this.sourceKeys.push(source.key);
		this.totalAssignments += touchedChildren.length;
	}
}

function createBucket(child) {
	return {
		child,
		triangles: [],
		triangleKeys: [],
		digestState: createCollisionDigestState()
	};
}
