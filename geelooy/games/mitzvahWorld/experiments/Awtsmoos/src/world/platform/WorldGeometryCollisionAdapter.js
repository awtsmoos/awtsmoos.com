// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldGeometryCollisionAdapter.js
 * @description Gives generated surfaces exact project-native triangle boundaries.
 */
import { trianglesFromIndexed } from '../../collision/TriangleCollider.js';

export function worldGeometryColliders(geometry, position = {}, options = {}) {
	const offset = {
		x: Number(position.x) || 0,
		y: Number(position.y) || 0,
		z: Number(position.z) || 0
	};
	const vertices = geometry.vertices.map(point => ({
		x: point[0] + offset.x,
		y: point[1] + offset.y,
		z: point[2] + offset.z
	}));
	const indices = geometry.faces.flat();
	return trianglesFromIndexed(vertices, indices, {
		floor: options.floor,
		kind: options.kind || geometry.role || 'procedural-world',
		solid: options.solid !== false
	});
}

export function insertWorldGeometryColliders(octree, geometry, position, options = {}) {
	const colliders = worldGeometryColliders(geometry, position, options);
	let inserted = 0;
	for (const collider of colliders) {
		if (octree.insert(collider)) inserted += 1;
	}
	return {
		created: colliders.length,
		inserted,
		kind: options.kind || geometry.role || 'procedural-world'
	};
}
