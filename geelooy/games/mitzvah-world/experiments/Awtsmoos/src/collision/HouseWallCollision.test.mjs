// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HouseWallCollision.test.mjs
 * @description Round-6 conclusive wall/door proof on the real collision chain:
 * house wall primitives (Box3D primitiveColliders, the same records
 * installMinimalMeadowHouseDefinitions inserts into the runtime octree),
 * the real AwtsmoosOctree, and the real AwtsmoosCollisionMover.
 * Earlier live mover tests "proved" nothing because their aim lines crossed
 * house lots and floor slabs, never an actual wall segment. Here the wall
 * segment is the target: a solid wall must stop the traveler at its face,
 * and the standard 2.25m doorway gap must let the traveler through.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Aabb } from '../math/Aabb.js';
import { AwtsmoosOctree } from './AwtsmoosOctree.js';
import { AwtsmoosCollisionMover } from './AwtsmoosCollisionMover.js';
import { primitiveColliders } from '../world/Box3D.js';

const MOVE_OPTIONS = Object.freeze({
	grounded: true,
	maxStepHeight: 0.96,
	floorY: 0,
	maxSlopeNormal: 0.72,
	blockSteepFloors: true,
	dynamicColliders: []
});

function buildMover(definitions) {
	const octree = new AwtsmoosOctree(
		new Aabb({ x: -140, y: -48, z: -140 }, { x: 140, y: 96, z: 140 }),
		0,
		7
	);
	for (const definition of definitions) {
		for (const collider of primitiveColliders(definition)) {
			octree.insert(collider);
		}
	}
	return new AwtsmoosCollisionMover({
		footOffset: 0,
		height: 1.72,
		octree,
		radius: 0.38
	});
}

test('a solid house wall stops the traveler at its face', () => {
	const mover = buildMover([
		{ id: 'test-solid-wall', shape: 'box', position: { x: 0, y: 1.625, z: -10 }, size: { x: 16, y: 3.25, z: 0.4 } }
	]);
	const position = { x: -3, y: 0, z: -6 };
	const result = mover.move(position, { x: 0, y: 0, z: -6 }, MOVE_OPTIONS);
	const moved = Math.hypot(position.x + 3, position.z + 6);
	assert.ok(result.contacts > 0, 'wall contact must be reported');
	assert.ok(moved < 4, `traveler must be stopped by the wall, moved ${moved}`);
	assert.ok(
		Math.abs(position.z - -9.42) < 0.05,
		`traveler rests at wall face minus radius, z=${position.z}`
	);
});

test('the standard 2.25m doorway gap lets the traveler through', () => {
	const gap = 2.25;
	const half = gap / 2;
	const segmentWidth = 8 - half;
	const mover = buildMover([
		{ id: 'test-door-wall-left', shape: 'box', position: { x: -(half + segmentWidth / 2), y: 1.625, z: -10 }, size: { x: segmentWidth, y: 3.25, z: 0.4 } },
		{ id: 'test-door-wall-right', shape: 'box', position: { x: half + segmentWidth / 2, y: 1.625, z: -10 }, size: { x: segmentWidth, y: 3.25, z: 0.4 } }
	]);
	const stepped = { x: 0, y: 0, z: -6 };
	for (let step = 0; step < 60; step += 1) {
		mover.move(stepped, { x: 0, y: 0, z: -0.12 }, MOVE_OPTIONS);
	}
	assert.ok(stepped.z < -11, `traveler walks through the doorway, z=${stepped.z}`);
	const direct = { x: 0, y: 0, z: -6 };
	const result = mover.move(direct, { x: 0, y: 0, z: -6 }, MOVE_OPTIONS);
	assert.equal(result.contacts, 0, 'doorway passage must be contact-free');
	assert.ok(direct.z <= -12, `traveler crosses the wall line, z=${direct.z}`);
});
