// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapCollisionWorldDynamic.test.mjs
 * @description Proves compatibility, local candidate reduction, overflow, raycast, and removal.
 * The Awtsmoos grants an ordered road and measured neighborhoods together;
 * Awtsmoos.com verifies old vessels remain safe while finite walls answer from nearby cells first.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { BootstrapCollisionWorld } from '../../app/BootstrapCollisionWorld.js';
import { Aabb } from '../../math/Aabb.js';

test('B"H dynamic authority preserves order while narrowing bounded queries', () => {
	const world = new BootstrapCollisionWorld({ cellSize: 10 });
	const farther = rayCollider('farther', 8);
	const nearer = rayCollider('nearer', 3);
	assert.equal(world.insert(farther), farther);
	assert.equal(world.insert(nearer), nearer);
	assert.equal(world.insert(nearer), nearer);
	assert.deepEqual(world.query(), [farther, nearer]);
	assert.equal(world.raycast({}, {}, 20).id, 'nearer');
	assert.equal(world.diagnostics().dynamicColliders, 2);
	assert.equal(world.remove(nearer), true);
	assert.equal(world.remove(nearer), false);
	const local = boundedCollider('local', 1, 2);
	const distant = boundedCollider('distant', 100, 102);
	world.insert(local);
	world.insert(distant);
	const matches = world.query(new Aabb(
		{ x: 0, y: -1, z: 0 },
		{ x: 5, y: 3, z: 5 }
	));
	assert.deepEqual(matches, [farther, local]);
	const diagnostics = world.diagnostics();
	assert.equal(diagnostics.spatialIndex.indexedColliders, 2);
	assert.equal(diagnostics.spatialIndex.overflowColliders, 1);
	assert.equal(diagnostics.spatialIndex.lastCandidateCount, 2);
	assert.equal(diagnostics.spatialIndex.lastMatchCount, 2);
	assert.ok(diagnostics.spatialIndex.lastCandidateCount < world.all().length);
});

function rayCollider(id, distance) {
	return {
		raycast() {
			return { distance, id };
		}
	};
}

function boundedCollider(id, minimum, maximum) {
	return {
		aabb: new Aabb(
			{ x: minimum, y: 0, z: minimum },
			{ x: maximum, y: 2, z: maximum }
		),
		id
	};
}
