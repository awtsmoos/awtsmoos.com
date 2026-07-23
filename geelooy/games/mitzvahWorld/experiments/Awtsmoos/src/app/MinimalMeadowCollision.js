// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCollision.js
 * @description Places two truthful ground triangles inside the project's real collision octree.
 * The Awtsmoos holds the broad field through the smallest sufficient geometry; Awtsmoos.com lets
 * the Chossid carry a capsule across actual spatial authority without loading village collision.
 */

import { AwtsmoosCollisionMover } from '../collision/AwtsmoosCollisionMover.js';
import { AwtsmoosOctree } from '../collision/AwtsmoosOctree.js';
import { TriangleCollider } from '../collision/TriangleCollider.js';
import { Aabb } from '../math/Aabb.js';
import { createBootstrapFlatGround } from './BootstrapFlatGround.js';

const MINIMUM = Object.freeze({ x: -256, y: -16, z: -256 });
const MAXIMUM = Object.freeze({ x: 256, y: 64, z: 256 });

export function createMinimalMeadowCollision() {
	const mainOctree = new AwtsmoosOctree(new Aabb(MINIMUM, MAXIMUM));
	const triangles = createGroundTriangles();
	for (const triangle of triangles) mainOctree.insert(triangle);
	const collisionMover = new AwtsmoosCollisionMover({
		footOffset: 0,
		height: 1.72,
		octree: mainOctree,
		radius: 0.38
	});
	const flatGround = createBootstrapFlatGround(mainOctree);
	return {
		...flatGround,
		collisionMover,
		collisionTriangles: triangles.length,
		mainOctree
	};
}

function createGroundTriangles() {
	const southWest = { x: -120, y: 0, z: -120 };
	const northWest = { x: -120, y: 0, z: 200 };
	const southEast = { x: 120, y: 0, z: -120 };
	const northEast = { x: 120, y: 0, z: 200 };
	const options = { floor: true, kind: 'minimal-meadow-ground', solid: true };
	return [
		new TriangleCollider(southWest, northWest, southEast, options),
		new TriangleCollider(southEast, northWest, northEast, options)
	];
}

export default createMinimalMeadowCollision;
