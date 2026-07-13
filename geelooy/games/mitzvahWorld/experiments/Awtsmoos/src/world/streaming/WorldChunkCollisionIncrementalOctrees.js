// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionIncrementalOctrees.js
 * @description Creates, fills, verifies, and freezes child octrees in bounded units.
 * The Awtsmoos gives every child its exact place; Awtsmoos.com turns serialized
 * bounds into living spatial vessels before one triangle is permitted to enter.
 */
import { AwtsmoosOctree } from '../../collision/AwtsmoosOctree.js';
import { Aabb } from '../../math/Aabb.js';
import {
	createIncrementalChildDefinition,
	createIncrementalChildDiagnostics
} from './WorldChunkCollisionIncrementalChildResult.js';

export class WorldChunkCollisionIncrementalOctrees {
	constructor(assignment, parentId, generationVersion) {
		this.assignment = assignment;
		this.parentId = parentId;
		this.generationVersion = generationVersion;
		this.builds = [];
		this.initializeCursor = 0;
		this.insertChildCursor = 0;
		this.insertTriangleCursor = 0;
		this.verifyCursor = 0;
		this.finalizeCursor = 0;
		this.definitions = [];
		this.childDiagnostics = [];
	}

	/** Creates at most the requested number of child octrees. */
	initialize(maximumUnits) {
		let units = 0;
		while (units < maximumUnits && this.initializeCursor < this.assignment.assignments.length) {
			const assigned = this.assignment.assignments[this.initializeCursor];
			const { min, max } = assigned.child.bounds;
			this.builds.push({
				assigned,
				octree: new AwtsmoosOctree(new Aabb(min, max)),
				inserted: 0
			});
			this.initializeCursor += 1;
			units += 1;
		}
		return units;
	}

	/** Inserts at most the requested number of assigned triangles. */
	insert(maximumUnits) {
		let units = 0;
		while (units < maximumUnits && this.insertChildCursor < this.builds.length) {
			const build = this.builds[this.insertChildCursor];
			if (this.insertTriangleCursor >= build.assigned.triangles.length) {
				this.insertChildCursor += 1;
				this.insertTriangleCursor = 0;
				continue;
			}
			const triangle = build.assigned.triangles[this.insertTriangleCursor];
			if (!build.octree.insert(triangle)) {
				throw new Error(`Child octree rejected triangle for ${build.assigned.child.chunkId}.`);
			}
			build.inserted += 1;
			this.insertTriangleCursor += 1;
			units += 1;
		}
		return units;
	}

	/** Verifies at most the requested number of complete child builds. */
	verify(maximumUnits) {
		let units = 0;
		while (units < maximumUnits && this.verifyCursor < this.builds.length) {
			const build = this.builds[this.verifyCursor];
			const childId = build.assigned.child.chunkId;
			if (build.inserted !== build.assigned.triangleKeys.length) {
				throw new Error(`Child octree count mismatch for ${childId}.`);
			}
			const actualBounds = JSON.stringify(build.octree.bounds.toJSON());
			const expectedBounds = JSON.stringify(build.assigned.child.bounds);
			if (actualBounds !== expectedBounds) {
				throw new Error(`Child octree bounds mismatch for ${childId}.`);
			}
			this.verifyCursor += 1;
			units += 1;
		}
		return units;
	}

	/** Freezes at most the requested number of child results. */
	finalize(maximumUnits) {
		let units = 0;
		while (units < maximumUnits && this.finalizeCursor < this.builds.length) {
			const { assigned, octree } = this.builds[this.finalizeCursor];
			this.definitions.push(createIncrementalChildDefinition({
				assigned,
				octree,
				parentId: this.parentId,
				generationVersion: this.generationVersion
			}));
			this.childDiagnostics.push(createIncrementalChildDiagnostics(assigned));
			this.finalizeCursor += 1;
			units += 1;
		}
		return units;
	}

	/** Returns compact octree-build progress. */
	diagnostics() {
		return Object.freeze({
			initializedChildren: this.initializeCursor,
			insertChildCursor: this.insertChildCursor,
			insertTriangleCursor: this.insertTriangleCursor,
			verifiedChildren: this.verifyCursor,
			finalizedChildren: this.finalizeCursor
		});
	}
}
