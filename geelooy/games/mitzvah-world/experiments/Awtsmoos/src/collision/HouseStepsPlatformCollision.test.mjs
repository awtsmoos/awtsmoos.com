// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { Aabb } from '../math/Aabb.js';
import { AwtsmoosOctree } from './AwtsmoosOctree.js';
import { AwtsmoosCollisionMover } from './AwtsmoosCollisionMover.js';
import { primitiveColliders } from '../world/Box3D.js';

/**
 * @file HouseStepsPlatformCollision.test.mjs
 * @description Round 7 physics sweep (owner: "fix it all — all physics"):
 * the real collision chain (Box3D primitiveColliders -> AwtsmoosOctree ->
 * AwtsmoosCollisionMover, the same options the live movement path passes)
 * must (a) let the traveler climb a staircase of 0.18 m steps, (b) step
 * onto a 0.5 m platform recording stepped faces, and (c) still BLOCK at a
 * 1.3 m ledge that exceeds maxStepHeight. Proven broken nowhere; recorded
 * here so a regression cannot silently return.
 */

const MOVE = {
	blockSteepFloors: true,
	dynamicColliders: [],
	floorY: 0,
	grounded: true,
	maxSlopeNormal: 0.72,
	maxStepHeight: 0.96
};

function chain(definitions) {
	const octree = new AwtsmoosOctree(new Aabb(
		{ x: -140, y: -48, z: -140 },
		{ x: 140, y: 96, z: 140 }
	), 0, 7);
	for (const definition of definitions) {
		for (const collider of primitiveColliders(definition)) octree.insert(collider);
	}
	return new AwtsmoosCollisionMover({ footOffset: 0, height: 1.72, octree, radius: 0.38 });
}

test('a staircase of 0.18 m steps is climbed, never blocked', () => {
	const definitions = [];
	for (let i = 0; i < 5; i += 1) {
		definitions.push({
			id: `stair-${i}`,
			position: { x: 0, y: (0.18 * (i + 1)) / 2, z: -8 - i * 0.9 - 0.45 },
			shape: 'box',
			size: { x: 3, y: 0.18 * (i + 1), z: 0.9 }
		});
	}
	const mover = chain(definitions);
	const position = { x: 0, y: 0, z: -5 };
	let contacts = 0;
	for (let step = 0; step < 70; step += 1) {
		const result = mover.move(position, { x: 0, y: 0, z: -0.12 }, { ...MOVE, floorY: position.y });
		contacts += result.contacts || 0;
		// The live runtime's ground sampler lifts the traveler onto the
		// highest step top underfoot; the test plays that role.
		const top = definitions
			.filter((d) => Math.abs(position.x - d.position.x) < 1.5
				&& Math.abs(position.z - d.position.z) < 0.45)
			.map((d) => d.size.y)
			.pop();
		if (top !== undefined && position.y < top) position.y = top;
	}
	assert.equal(contacts, 0, 'stairs must never register wall contacts');
	assert.ok(position.y >= 0.89, `traveler should stand on the top step, y=${position.y}`);
	assert.ok(position.z < -12.9, `traveler should pass the staircase, z=${position.z}`);
});

test('a 0.5 m platform is stepped onto (stepped faces recorded)', () => {
	const mover = chain([{
		id: 'platform',
		position: { x: 0, y: 0.25, z: -10 },
		shape: 'box',
		size: { x: 6, y: 0.5, z: 4 }
	}]);
	const position = { x: 0, y: 0, z: -6 };
	const result = mover.move(position, { x: 0, y: 0, z: -6 }, MOVE);
	assert.equal(result.contacts, 0);
	assert.ok(position.z <= -11.9, `traveler crossed the platform, z=${position.z}`);
	assert.ok(mover.lastStepFaces.includes('platform'), 'platform must be recorded as a stepped face');
});

test('a 1.3 m ledge above maxStepHeight blocks like a wall', () => {
	const mover = chain([{
		id: 'ledge',
		position: { x: 0, y: 0.65, z: -10 },
		shape: 'box',
		size: { x: 6, y: 1.3, z: 0.4 }
	}]);
	const position = { x: 0, y: 0, z: -6 };
	const result = mover.move(position, { x: 0, y: 0, z: -6 }, MOVE);
	assert.ok(result.contacts > 0, 'ledge must produce wall contacts');
	assert.ok(Math.abs(position.z - -9.42) < 0.05,
		`traveler must stop at ledge face - radius, z=${position.z}`);
});
