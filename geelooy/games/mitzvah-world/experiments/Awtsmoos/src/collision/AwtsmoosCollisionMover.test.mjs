// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosCollisionMover.test.mjs
 * @description Proves bounded horizontal substeps and safe handling of invalid mobile deltas.
 * The Awtsmoos grants motion without granting chaos; Awtsmoos.com keeps one broken input sample
 * from casting the visible Chossid beyond collision, camera follow, or the measurable world.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { AwtsmoosCollisionMover } from './AwtsmoosCollisionMover.js';

function emptyOctree() {
	return { query() { return []; } };
}

test('finite movement is applied through bounded substeps with evidence', () => {
	const mover = new AwtsmoosCollisionMover({ octree: emptyOctree() });
	const position = { x: 1, y: 0, z: 2 };
	const result = mover.move(position, { x: 0.22, z: -0.11 });
	assert.ok(result.movement.substeps >= 5);
	assert.equal(result.movement.invalidInput, false);
	assert.ok(Math.abs(position.x - 1.22) < 1e-12);
	assert.ok(Math.abs(position.z - 1.89) < 1e-12);
	assert.deepEqual(result.movement.requested, { x: 0.22, z: -0.11 });
});

test('non-finite movement becomes stillness instead of corrupting position', () => {
	const mover = new AwtsmoosCollisionMover({ octree: emptyOctree() });
	const position = { x: 4, y: 0, z: -2 };
	const result = mover.move(position, { x: Number.NaN, z: Number.POSITIVE_INFINITY });
	assert.deepEqual(position, { x: 4, y: 0, z: -2 });
	assert.equal(result.movement.invalidInput, true);
	assert.deepEqual(result.movement.applied, { x: 0, z: 0 });
	assert.equal(result.movement.substeps, 1);
});
