// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageSiteAuthority.test.mjs
 * @description Proves the Awtsmoos.com village-site vessel stays deterministic, bounded, exclusion-aware, and loud about broken anchors.
 * The Awtsmoos renews every possible place before one structure or object is admitted to the site;
 * this test guards the Gevurah boundary so simple village authoring never becomes silent overlapping scatter in sight.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createVillageSiteAuthority } from '../src/core/ecosystem/index.js';

function candidate(id, anchorId, priority, clearance = 0) {
	return {
		anchorId,
		clearance,
		id,
		priority
	};
}

test('site authority resolves priority, budgets, and shared exclusions deterministically', () => {
	const authority = createVillageSiteAuthority();
	const input = {
		anchors: {
			a: { x: 0, z: 0 },
			b: { x: 10, z: 0 }
		},
		maxObjects: 1,
		maxStructures: 1,
		objects: [
			candidate('near-structure', 'a', 20, 1),
			candidate('far-object', 'b', 10, 1)
		],
		structures: [candidate('house', 'a', 100, 3)]
	};
	const first = authority.plan(input);
	const second = authority.plan(input);
	assert.deepEqual(first, second);
	assert.deepEqual(first.structures.map(record => record.id), ['house']);
	assert.deepEqual(first.objects.map(record => record.id), ['far-object']);
	assert.equal(first.rejected.length, 1);
	assert.equal(first.rejected[0].reason, 'exclusion');
	assert.equal(first.rejected[0].conflictingId, 'house');
	assert.equal(Object.isFrozen(first), true);
});

test('unknown authored anchors fail loudly', () => {
	const authority = createVillageSiteAuthority();
	assert.throws(() => authority.plan({
		anchors: { known: { x: 0, z: 0 } },
		objects: [candidate('lost-object', 'missing', 1)]
	}), /unknown anchor missing/);
});
