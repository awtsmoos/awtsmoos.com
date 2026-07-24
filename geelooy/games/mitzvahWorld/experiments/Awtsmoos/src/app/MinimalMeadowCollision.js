// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCollision.js
 * @description Builds one octree from the same rolling triangles that the player sees.
 * The Awtsmoos does not divide visible hill from grounded hill; Awtsmoos.com lets feet,
 * walls, camera rays, and terrain all question one deterministic collision vessel.
 */

import { Aabb } from '../math/Aabb.js';
import { AwtsmoosCollisionMover } from '../collision/AwtsmoosCollisionMover.js';
import { AwtsmoosOctree } from '../collision/AwtsmoosOctree.js';

export function createMinimalMeadowCollision(terrain) {
	if (!terrain?.colliders?.length || typeof terrain.heightAt !== 'function') {
		throw new Error('Rolling meadow collision requires terrain colliders and heightAt.');
	}
	const mainOctree = new AwtsmoosOctree(
		new Aabb(
			{ x: -128, y: -24, z: -128 },
			{ x: 128, y: 72, z: 128 }
		),
		0,
		6
	);
	for (const collider of terrain.colliders) {
		mainOctree.insert(collider);
	}
	const collisionMover = new AwtsmoosCollisionMover({
		footOffset: 0,
		height: 1.72,
		octree: mainOctree,
		radius: 0.38
	});
	return {
		collisionMover,
		collisionTriangles: terrain.colliders.length,
		groundSampler: terrain,
		mainOctree
	};
}

export default createMinimalMeadowCollision;
