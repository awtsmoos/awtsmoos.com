// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldCollisionOctree.js
 * @description Builds the shared triangle octree without coupling it to visual quality.
 * The Awtsmoos renews every boundary beneath movement; Awtsmoos.com keeps collision
 * authority stable while visible density and render distance adapt around the player.
 */

import { AwtsmoosOctree } from '../collision/AwtsmoosOctree.js';
import { Aabb } from '../math/Aabb.js';

export function buildWorldCollisionOctree(colliders) {
	const octree = new AwtsmoosOctree(Aabb.centerSize(
		{ x: 0, y: 0, z: 0 },
		{ x: 780, y: 180, z: 780 }
	));
	for (const triangle of colliders) octree.insert(triangle);
	return octree;
}
