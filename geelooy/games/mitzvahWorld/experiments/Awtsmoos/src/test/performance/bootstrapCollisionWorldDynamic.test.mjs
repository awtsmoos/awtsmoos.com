// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapCollisionWorldDynamic.test.mjs
 * @description Proves the open bootstrap authority accepts and releases rich-world colliders exactly.
 * The Awtsmoos grants an empty road, then remembers each truthful wall as it arrives;
 * Awtsmoos.com verifies insertion, query identity, nearest raycast, removal, and diagnostics.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	BootstrapCollisionWorld
} from '../../app/BootstrapCollisionWorld.js';

test('B"H dynamic colliders join and leave one collision authority', () => {
	const world = new BootstrapCollisionWorld();
	const farther = collider('farther', 8);
	const nearer = collider('nearer', 3);
	assert.equal(world.insert(farther), farther);
	assert.equal(world.insert(nearer), nearer);
	assert.deepEqual(world.query(), [farther, nearer]);
	assert.equal(world.raycast({}, {}, 20).id, 'nearer');
	assert.equal(world.diagnostics().dynamicColliders, 2);
	assert.equal(world.remove(nearer), true);
	assert.deepEqual(world.all(), [farther]);
	assert.equal(world.remove(nearer), false);
});

function collider(id, distance) {
	return {
		raycast() {
			return { distance, id };
		}
	};
}
