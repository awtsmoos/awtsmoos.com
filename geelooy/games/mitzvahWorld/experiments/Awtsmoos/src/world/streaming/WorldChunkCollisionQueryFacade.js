// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionQueryFacade.js
 * @description Merges accepted active octrees behind the existing query surface.
 * The Awtsmoos reveals one collision world through many vessels; Awtsmoos.com takes
 * one ownership snapshot, hides retained children, and merges deterministic truth.
 */
import { WorldChunkCollisionQueryEvidence } from './WorldChunkCollisionQueryEvidence.js';
import {
	selectWorldChunkCollisionQueryEntries,
	worldChunkCollisionQueryOwnerIds,
	worldChunkCollisionQueryRevision
} from './WorldChunkCollisionQuerySelection.js';
import {
	appendUniqueCollisionTriangles,
	WorldChunkCollisionTriangleIdentity
} from './WorldChunkCollisionTriangleIdentity.js';

export class WorldChunkCollisionQueryFacade {
	constructor(index) {
		if (typeof index?.activeSnapshot !== 'function') {
			throw new TypeError('Composite collision query requires an active collision index.');
		}
		this.index = index;
		this.identity = new WorldChunkCollisionTriangleIdentity();
		this.evidence = new WorldChunkCollisionQueryEvidence();
	}

	/** Returns the canonical active-ownership revision for dependent caches. */
	get revision() {
		return this.createContext().revision;
	}

	/** Appends unique candidates from one immutable selected-owner snapshot. */
	query(aabb, output = []) {
		return this.collectTriangles('query', aabb, output);
	}

	/** Returns the nearest predicate-approved hit across active owners. */
	raycast(ray, maximumDistance = Infinity, predicate = () => true) {
		const context = this.createContext();
		let nearest = null;
		let candidates = 0;
		for (const owner of context.owners) {
			const hit = owner.runtime.octree.raycast(
				ray,
				maximumDistance,
				predicate
			);
			if (!hit || !Number.isFinite(hit.distance)) {
				continue;
			}
			candidates += 1;
			if (!nearest || hit.distance < nearest.distance) {
				nearest = hit;
			}
		}
		this.evidence.record(
			'raycast',
			context,
			candidates,
			nearest ? 1 : 0,
			0
		);
		return nearest;
	}

	/** Appends every unique triangle from canonical active query owners. */
	all(output = []) {
		return this.collectTriangles('all', null, output);
	}

	/** Returns frozen deterministic metrics from one ownership snapshot. */
	diagnostics() {
		return this.evidence.diagnostics(this.createContext());
	}

	collectTriangles(type, aabb, output) {
		const context = this.createContext();
		const startingLength = output.length;
		const seen = new Set();
		let candidates = 0;
		let duplicatesRemoved = 0;
		for (const owner of context.owners) {
			const octree = owner.runtime.octree;
			const found = type === 'query'
				? octree.query(aabb, [])
				: octree.all([]);
			candidates += found.length;
			duplicatesRemoved += appendUniqueCollisionTriangles(
				found,
				output,
				this.identity,
				seen
			);
		}
		this.evidence.record(
			type,
			context,
			candidates,
			output.length - startingLength,
			duplicatesRemoved
		);
		return output;
	}

	createContext() {
		const activeEntries = this.index.activeSnapshot();
		const owners = selectWorldChunkCollisionQueryEntries(activeEntries);
		return Object.freeze({
			owners,
			ownerIds: worldChunkCollisionQueryOwnerIds(owners),
			revision: worldChunkCollisionQueryRevision(activeEntries)
		});
	}
}
