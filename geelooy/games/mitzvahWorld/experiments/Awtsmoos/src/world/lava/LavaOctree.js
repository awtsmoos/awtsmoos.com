//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file LavaOctree.js
 * @description Builds the bounded collision octree covering the entire extended lava challenge.
 * Collision structure remains gameplay-owned while geometry generation stays delegated to shared primitives.
 */

import { Aabb } from '../../math/Aabb.js';
import { AwtsmoosOctree } from '../../collision/AwtsmoosOctree.js';

/**
 * Builds one collision octree containing every platform triangle in the lava course.
 * @param {object[]} colliders Primitive collider triangles produced from course definitions.
 * @returns {AwtsmoosOctree} Spatial collision index for the isolated lava world.
 */
export function buildLavaOctree(colliders) {
	const bounds = Aabb.centerSize(
		{
			x: -18,
			y: 2,
			z: 42
		},
		{
			x: 170,
			y: 70,
			z: 92
		}
	);
	const octree = new AwtsmoosOctree(bounds);

	for (const collider of colliders) {
		octree.insert(collider);
	}

	return octree;
}
