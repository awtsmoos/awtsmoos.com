// B"H
import assert from 'node:assert/strict';
import { GroundSampleCache } from '../../world/GroundSampleCache.js';
import { createGroundSampleFixture } from './GroundSampleCacheFixtures.mjs';

const fixture = createGroundSampleFixture();
const first = fixture.ground.sample(2, 3, { maxY: 6 });
const firstCounts = { ...fixture.counts };
const repeated = fixture.ground.sample(2, 3, { maxY: 6 });

assert.equal(repeated, first, 'exact repeated inputs should reuse the sample object');
assert.deepEqual(fixture.counts, firstCounts, 'cache hits should perform no new ground work');
assert.equal(first.height, 3, 'octree floor should remain above terrain');
assert.equal(first.kind, 'fixture-floor', 'floor kind should remain visible');

fixture.ground.sample(2.1, 3, { maxY: 6 });
fixture.ground.sample(2, 3.1, { maxY: 6 });
fixture.ground.sample(2, 3, { maxY: 6.1 });
assert.equal(fixture.ground.sampleCache.stats.misses, 4, 'each exact coordinate change should miss');

fixture.ground.octree = fixture.createOctree(4);
const replacementFloor = fixture.ground.sample(2, 3, { maxY: 6 });
assert.equal(replacementFloor.height, 4, 'octree identity changes should invalidate reuse');

fixture.ground.terrainHeightAt = fixture.createTerrain(5);
const replacementTerrain = fixture.ground.sample(2, 3, { maxY: 2 });
assert.ok(replacementTerrain.height > 5, 'terrain function identity should invalidate reuse');
assert.equal(replacementTerrain.source, 'terrain-height');

const beforeBypass = { ...fixture.counts };
const bypassOne = fixture.ground.sample(7, 8, { maxY: 10, futureOption: true });
const bypassTwo = fixture.ground.sample(7, 8, { maxY: 10, futureOption: true });
assert.notEqual(bypassOne, bypassTwo, 'unknown options should bypass the cache');
assert.ok(fixture.counts.terrain > beforeBypass.terrain, 'bypasses should recompute terrain');

fixture.ground.octree = null;
const terrainOnly = fixture.ground.sample(9, 4, { maxY: 20 });
const terrainOnlyRepeat = fixture.ground.sample(9, 4, { maxY: 20 });
assert.equal(terrainOnlyRepeat, terrainOnly, 'terrain-only samples should be reusable');
assert.equal(fixture.ground.heightAt(9, 4, { maxY: 20 }), terrainOnly.height);
assert.equal(
	fixture.ground.isGrounded(
		{ x: 9, y: terrainOnly.height + 0.04, z: 4 },
		0,
		0.055
	),
	true,
	'isGrounded should preserve its feet-and-epsilon contract'
);

const bounded = new GroundSampleCache({ maximumEntries: 2 });
let creations = 0;
const resolve = (x) => bounded.resolve({
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
assert.equal(creations, 4, 'oldest entries should be evicted beyond the bound');
assert.equal(bounded.stats.evictions, 2, 'eviction evidence should remain exact');

console.log(JSON.stringify({
	ok: true,
	worldCache: fixture.ground.sampleCache.stats,
	boundedCache: bounded.stats,
	counts: fixture.counts
}, null, 2));
