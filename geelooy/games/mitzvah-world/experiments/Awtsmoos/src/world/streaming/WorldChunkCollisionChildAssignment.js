// B"H // Boruch Hashem // Blessed is He

/**
 * @file WorldChunkCollisionChildAssignment.js
 * @description Assigns canonical source triangles to every touching child octant.
 * The Awtsmoos lets one boundary face illuminate neighboring vessels; Awtsmoos.com
 * preserves that continuity while measuring exact source duplicates and assignments.
 */
import {
	collisionBoundsClosedOverlap,
	createWorldChunkCollisionTriangleBounds
} from './WorldChunkCollisionTriangleBounds.js';
import { WorldChunkCollisionTriangleIdentity } from './WorldChunkCollisionTriangleIdentity.js';

/** Returns immutable deterministic triangle assignments for a child layout. */
export function assignWorldChunkCollisionChildren({
	triangles = [],
	children = []
} = {}) {
	if (!Array.isArray(triangles) || !Array.isArray(children) || children.length === 0) {
		throw new TypeError('Collision child assignment requires triangles and children.');
	}
	const identity = new WorldChunkCollisionTriangleIdentity();
	const uniqueSources = canonicalUniqueSources(triangles, identity);
	const assignmentMaps = new Map(
		children.map((child) => [child.chunkId, []])
	);
	for (const source of uniqueSources) {
		const touching = children.filter((child) => (
			collisionBoundsClosedOverlap(source.bounds, child.bounds)
		));
		if (touching.length === 0) {
			throw new Error(`Collision triangle reaches no child bounds: ${source.key}`);
		}
		for (const child of touching) {
			assignmentMaps.get(child.chunkId).push(source);
		}
	}
	const assignments = children.map((child) => freezeAssignment(
		child,
		assignmentMaps.get(child.chunkId)
	));
	const totalAssignments = assignments.reduce(
		(total, assignment) => total + assignment.triangleCount,
		0
	);
	return Object.freeze({
		assignments: Object.freeze(assignments),
		sourceCount: triangles.length,
		uniqueSourceCount: uniqueSources.length,
		duplicateSourceCount: triangles.length - uniqueSources.length,
		totalAssignments,
		overlapDuplicationCount: totalAssignments - uniqueSources.length,
		sourceKeys: Object.freeze(uniqueSources.map((source) => source.key))
	});
}

function canonicalUniqueSources(triangles, identity) {
	const byKey = new Map();
	for (const triangle of triangles) {
		const key = identity.keyFor(triangle);
		if (!key.startsWith('triangle|')) {
			throw new TypeError('Collision child generation accepts triangle colliders only.');
		}
		if (!byKey.has(key)) {
			byKey.set(key, Object.freeze({
				key,
				triangle,
				bounds: createWorldChunkCollisionTriangleBounds(triangle)
			}));
		}
	}
	return [...byKey.values()].sort((left, right) => left.key.localeCompare(right.key));
}

function freezeAssignment(child, sources) {
	const ordered = [...sources].sort((left, right) => left.key.localeCompare(right.key));
	return Object.freeze({
		child,
		chunkId: child.chunkId,
		bounds: child.bounds,
		triangles: Object.freeze(ordered.map((source) => source.triangle)),
		triangleKeys: Object.freeze(ordered.map((source) => source.key)),
		triangleCount: ordered.length
	});
}
