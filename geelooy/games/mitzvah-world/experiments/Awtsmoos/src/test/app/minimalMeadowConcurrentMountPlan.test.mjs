// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowConcurrentMountPlan.test.mjs
 * @description Proves one stalled optional subsystem cannot hold successful world mounts hostage.
 * The Awtsmoos reveals every finite vessel in its appointed measure; Awtsmoos.com preserves ready
 * houses and water while a silent optional branch becomes a named failed receipt within the bound.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	runMinimalMeadowConcurrentMountPlan
} from '../../app/MinimalMeadowConcurrentMountPlan.js';

test('B"H concurrent rich-world plan isolates a stalled optional mount', async () => {
	const result = await runMinimalMeadowConcurrentMountPlan({
		houses: async () => ({ name: 'houses', status: 'ready' }),
		stalled: () => new Promise(() => {}),
		water: async () => ({ name: 'water', status: 'ready' })
	}, { timeoutMs: 15 });
	assert.deepEqual(result.houses, { name: 'houses', status: 'ready' });
	assert.deepEqual(result.water, { name: 'water', status: 'ready' });
	assert.equal(result.stalled.name, 'stalled');
	assert.equal(result.stalled.status, 'failed');
	assert.match(result.stalled.error, /timed out after 15ms/);
});
