// B"H // Boruch Hashem // Blessed is He

/**
 * @file groundSampleCache.test.mjs
 * @description Proves exact cache reuse, bounded eviction, and revision invalidation.
 * The Awtsmoos renews ground inside one stable object; Awtsmoos.com therefore tests
 * that a changed collision revelation opens a fresh ray without changing identity.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { GroundSampleCache } from '../../world/GroundSampleCache.js';
import { createGroundSampleFixture } from './GroundSampleCacheFixtures.mjs';

test('exact repeated ground inputs reuse one sample without new work', () => {
	const fixture = createGroundSampleFixture();
	const first = fixture.ground.sample(2, 3, { maxY: 6 });
	const counts = { ...fixture.counts };
	const repeated = fixture.ground.sample(2, 3, { maxY: 6 });
	assert.equal(repeated, first);
	assert.deepEqual(fixture.counts, counts);
	assert.equal(first.height, 3);
	assert.equal(first.kind, 'fixture-floor');
});

test('coordinates, identities, and revision changes invalidate reuse', () => {
	const fixture = createGroundSampleFixture();
	fixture.ground.sample(2, 3, { maxY: 6 });
	fixture.ground.sample(2.1, 3, { maxY: 6 });
	fixture.ground.sample(2, 3.1, { maxY: 6 });
	fixture.ground.sample(2, 3, { maxY: 6.1 });
	assert.equal(fixture.ground.sampleCache.stats.misses, 4);
	fixture.ground.octree = fixture.createOctree(4);
	const replacementFloor = fixture.ground.sample(2, 3, { maxY: 6 });
	assert.equal(replacementFloor.height, 4);
	fixture.ground.terrainHeightAt = fixture.createTerrain(5);
	const replacementTerrain = fixture.ground.sample(2, 3, { maxY: 2 });
	assert.ok(replacementTerrain.height > 5);
	assert.equal(replacementTerrain.source, 'terrain-height');
	const stableOctree = fixture.createOctree(4, 'revision-floor');
	stableOctree.revision = 'ownership-one';
	fixture.ground.octree = stableOctree;
	const firstRevision = fixture.ground.sample(7, 8, { maxY: 10 });
	const rayCount = fixture.counts.rays;
	assert.equal(fixture.ground.sample(7, 8, { maxY: 10 }), firstRevision);
	assert.equal(fixture.counts.rays, rayCount);
	stableOctree.revision = 'ownership-two';
	const secondRevision = fixture.ground.sample(7, 8, { maxY: 10 });
	assert.notEqual(secondRevision, firstRevision);
	assert.equal(fixture.counts.rays, rayCount + 1);
});

test('unknown options bypass while terrain-only samples remain reusable', () => {
	const fixture = createGroundSampleFixture();
	const first = fixture.ground.sample(7, 8, {
		maxY: 10,
		futureOption: true
	});
	const second = fixture.ground.sample(7, 8, {
		maxY: 10,
		futureOption: true
	});
	assert.notEqual(first, second);
	fixture.ground.octree = null;
	const terrainOnly = fixture.ground.sample(9, 4, { maxY: 20 });
	assert.equal(
		fixture.ground.sample(9, 4, { maxY: 20 }),
		terrainOnly
	);
	assert.equal(fixture.ground.heightAt(9, 4, { maxY: 20 }), terrainOnly.height);
	assert.equal(
		fixture.ground.isGrounded(
			{ x: 9, y: terrainOnly.height + 0.04, z: 4 },
			0,
			0.055
		),
		true
	);
});

test('bounded cache evicts oldest exact entries', () => {
	const fixture = createGroundSampleFixture();
	const cache = new GroundSampleCache({ maximumEntries: 2 });
	let creations = 0;
	const resolve = (x) => cache.resolve({
		x,
		z: 0,
		maximumY: 1,
		octree: fixture.octree,
		terrainHeightAt: fixture.ground.terrainHeightAt,
		create: () => ({ x, creation: ++creations })
	});
	resolve(1);
	resolve(2);
	resolve(3);
	resolve(1);
	assert.equal(creations, 4);
	assert.equal(cache.stats.evictions, 2);
});
