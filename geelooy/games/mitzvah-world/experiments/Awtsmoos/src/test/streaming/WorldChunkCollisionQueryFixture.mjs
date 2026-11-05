// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionQueryFixture.mjs
 * @description Builds deterministic active owners, octree doubles, and cloned faces.
 * The Awtsmoos reveals one measured collision world; Awtsmoos.com gives each test
 * enough control to prove owner selection, call counts, rays, and duplicate removal.
 */
import { TriangleCollider } from '../../collision/TriangleCollider.js';
import { Vec3 } from '../../math/Vec3.js';
import { collisionChunkId } from './WorldChunkCollisionTestFixture.mjs';

/** Returns one mutable index double that counts immutable snapshot requests. */
export function collisionQueryIndex(initialEntries = []) {
	let entries = [...initialEntries];
	const index = {
		snapshotCount: 0,
		activeSnapshot() {
			this.snapshotCount += 1;
			return Object.freeze([...entries]);
		},
		setEntries(nextEntries) {
			entries = [...nextEntries];
		}
	};
	return index;
}

/** Returns one active ownership entry around the supplied octree contract. */
export function activeQueryEntry({
	chunkId = collisionChunkId(),
	parentId = null,
	octree = collisionQueryOctree(),
	generationVersion = 1,
	handoffId = 'fixture-handoff'
} = {}) {
	return Object.freeze({
		chunkId,
		parentId,
		generationVersion,
		state: 'active',
		triangleCount: octree.all([]).length,
		handoff: Object.freeze({ id: handoffId }),
		runtime: Object.freeze({ octree })
	});
}

/** Returns an octree double with real query, all, and raycast output contracts. */
export function collisionQueryOctree({
	items = [],
	hit = null,
	bounds = fixtureBounds()
} = {}) {
	const calls = { query: 0, all: 0, raycast: 0 };
	return {
		calls,
		bounds: {
			toJSON: () => bounds
		},
		query(aabb, output = []) {
			calls.query += 1;
			output.push(...items);
			return output;
		},
		all(output = []) {
			calls.all += 1;
			output.push(...items);
			return output;
		},
		raycast(ray, maximumDistance, predicate) {
			calls.raycast += 1;
			const resolved = typeof hit === 'function'
				? hit({ ray, maximumDistance, predicate })
				: hit;
			if (!resolved || (predicate && !predicate(resolved.item))) {
				return null;
			}
			return resolved;
		}
	};
}

/** Returns a cloned triangle sharing exact geometry but not object identity. */
export function clonedBoundaryTriangle(kind = 'boundary-wall') {
	return new TriangleCollider(
		new Vec3(0, 0, -1),
		new Vec3(0, 2, -1),
		new Vec3(0, 2, 1),
		{
			kind,
			floor: false,
			normal: new Vec3(1, 0, 0)
		}
	);
}

/** Returns one deterministic ray hit at the supplied distance. */
export function collisionRayHit(distance, kind = 'wall') {
	const item = clonedBoundaryTriangle(kind);
	return {
		distance,
		point: { x: distance, y: 1, z: 0 },
		item,
		kind
	};
}

/** Returns simple positive-volume test bounds. */
export function fixtureBounds() {
	return {
		min: { x: -10, y: -5, z: -10 },
		max: { x: 10, y: 5, z: 10 }
	};
}
