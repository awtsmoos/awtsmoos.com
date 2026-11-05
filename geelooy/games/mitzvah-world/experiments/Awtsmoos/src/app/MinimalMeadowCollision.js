// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCollision.js
 * @description Builds collision bounds from the same full terrain size the player can see.
 * The Awtsmoos does not divide visible hill from grounded hill; Awtsmoos.com lets feet,
 * gateways, camera rays, and every outer district share one deterministic collision vessel.
 */
import { Aabb } from '../math/Aabb.js';
import { AwtsmoosCollisionMover } from '../collision/AwtsmoosCollisionMover.js';
import { AwtsmoosOctree } from '../collision/AwtsmoosOctree.js';

export function createMinimalMeadowCollision(terrain) {
	if (!terrain?.colliders?.length || typeof terrain.heightAt !== 'function') {
		throw new Error('Rolling meadow collision requires terrain colliders and heightAt.');
	}
	const half = Math.max(128, Number(terrain.size) * 0.5 + 8 || 128);
	const mainOctree = new AwtsmoosOctree(
		new Aabb(
			{ x: -half, y: -48, z: -half },
			{ x: half, y: 96, z: half }
		),
		0,
		7
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
		collisionBounds: Object.freeze({
			half,
			maximumY: 96,
			minimumY: -48
		}),
		collisionMover,
		collisionTriangles: terrain.colliders.length,
		groundSampler: terrain,
		mainOctree
	};
}

export default createMinimalMeadowCollision;
