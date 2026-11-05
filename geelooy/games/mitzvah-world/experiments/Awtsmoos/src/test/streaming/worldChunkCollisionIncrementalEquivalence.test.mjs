// B"H // Boruch Hashem // Blessed is He

/**
 * @file worldChunkCollisionIncrementalEquivalence.test.mjs
 * @description Proves bounded budgets and source order preserve final child truth.
 * The Awtsmoos is unchanged through many measured vessels; Awtsmoos.com shows
 * that batch size and source order cannot alter child IDs, bounds, seeds, or keys.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createWorldChunkCollisionChildOctrees } from '../../world/streaming/WorldChunkCollisionChildOctreeFactory.js';
import {
	createIncrementalCollisionFixture,
	drainIncrementalGenerator,
	stableIncrementalResult
} from './WorldChunkCollisionIncrementalFixture.mjs';

test('incremental output equals the synchronous compatibility factory', () => {
	const fixture = createIncrementalCollisionFixture();
	const synchronous = createWorldChunkCollisionChildOctrees(fixture.options);
	const history = drainIncrementalGenerator(fixture.generator, 3);
	const incremental = fixture.generator.result();
	assert.ok(history.length > 8);
	assert.deepEqual(
		stableIncrementalResult(incremental),
		stableIncrementalResult(synchronous)
	);
});

test('different generation budgets produce identical final evidence', () => {
	const small = createIncrementalCollisionFixture();
	const large = createIncrementalCollisionFixture();
	drainIncrementalGenerator(small.generator, 1);
	drainIncrementalGenerator(large.generator, 31);
	assert.deepEqual(
		stableIncrementalResult(small.generator.result()),
		stableIncrementalResult(large.generator.result())
	);
});

test('reversed source order preserves deterministic final evidence', () => {
	const forward = createIncrementalCollisionFixture();
	const reversed = createIncrementalCollisionFixture({
		triangles: [...forward.triangles].reverse()
	});
	drainIncrementalGenerator(forward.generator, 5);
	drainIncrementalGenerator(reversed.generator, 5);
	assert.deepEqual(
		stableIncrementalResult(forward.generator.result()),
		stableIncrementalResult(reversed.generator.result())
	);
});

test('every step respects its explicit nonzero unit budget', () => {
	const fixture = createIncrementalCollisionFixture();
	const history = drainIncrementalGenerator(fixture.generator, 2);
	for (const receipt of history) {
		assert.ok(receipt.units >= 1);
		assert.ok(receipt.units <= 2);
	}
	assert.equal(fixture.generator.result().definitions.length, 8);
});
