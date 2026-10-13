//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file GroundAndPlacement.test.js
 * @description Proves ground sampling honors collision truth first, caches
 * repeated questions, and samples each path point exactly once.
 * The Awtsmoos measures the earth anew at every coordinate while remembered
 * answers stay honest across collision revisions.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { Aabb } from '../../src/math/Aabb.js';
import { AwtsmoosOctree } from '../../src/collision/AwtsmoosOctree.js';
import { TriangleCollider, trianglesFromIndexed } from '../../src/collision/TriangleCollider.js';
import { v } from '../../src/math/Geometry3D.js';
import { WorldGround } from '../../src/world/WorldGround.js';
import { GroundSampleCache } from '../../src/world/GroundSampleCache.js';
import { createGroundSampler } from '../../src/world/GroundPlacementSystem.js';

const terrainHeightAt = (x, z) => 1 + 0.01 * x + 0.005 * z;

function boxOctree(topY) {
	const octree = new AwtsmoosOctree(new Aabb({ x: -50, y: -50, z: -50 }, { x: 50, y: 50, z: 50 }));
	const tris = trianglesFromIndexed(
		[v(-2, topY, -2), v(2, topY, -2), v(-2, topY, 2), v(2, topY, 2)],
		[0, 2, 1, 1, 2, 3],
		{ floor: true, kind: 'platform', solid: true }
	);
	for (const tri of tris) octree.insert(tri);
	return octree;
}

test('WorldGround prefers the octree platform over raw terrain', () => {
	const ground = new WorldGround({ terrainHeightAt, octree: boxOctree(3) });
	const overPlatform = ground.sample(0, 0);
	assert.equal(overPlatform.source, 'octree-bounded-floor-ray');
	assert.ok(Math.abs(overPlatform.height - 3) < 1e-6, `platform top expected, got ${overPlatform.height}`);
	const away = ground.sample(10, 10);
	assert.equal(away.source, 'terrain-height');
	assert.ok(Math.abs(away.height - terrainHeightAt(10, 10)) < 1e-9);
});

test('WorldGround works without an octree and caches repeated samples', () => {
	const ground = new WorldGround({ terrainHeightAt });
	const first = ground.sample(4, 4);
	const second = ground.sample(4, 4);
	assert.equal(first, second, 'identical coordinates return the cached vessel');
	assert.equal(ground.sampleCache.stats.hits, 1);
	assert.equal(first.height, terrainHeightAt(4, 4));
	const differentMaxY = ground.sample(4, 4, { maxY: 2 });
	assert.notEqual(differentMaxY, first, 'a different maxY opens a fresh cache key');
});

test('WorldGround.isGrounded respects feet and epsilon', () => {
	const ground = new WorldGround({ terrainHeightAt: () => 0 });
	assert.ok(ground.isGrounded({ x: 0, y: 0.05, z: 0 }, 0), 'feet near ground counts as grounded');
	assert.ok(!ground.isGrounded({ x: 0, y: 5, z: 0 }, 0), 'airborne is not grounded');
});

test('WorldGround.terrainNormal is finite and upward on a slope', () => {
	const ground = new WorldGround({ terrainHeightAt: (x, z) => x * 0.5 });
	const normal = ground.terrainNormal(0, 0);
	assert.ok(Number.isFinite(normal.x + normal.y + normal.z));
	assert.ok(normal.y > 0.85, 'normal leans against the slope');
});

test('GroundSampleCache keys include the collision revision', () => {
	const cache = new GroundSampleCache({ maximumEntries: 4 });
	let calls = 0;
	const create = () => ({ height: ++calls });
	const octree = { revision: 1 };
	const args = { x: 1, z: 2, maximumY: 42, octree, terrainHeightAt, create };
	cache.resolve(args);
	cache.resolve(args);
	assert.equal(calls, 1, 'second identical call hits the cache');
	octree.revision = 2;
	cache.resolve({ ...args, octree });
	assert.equal(calls, 2, 'a new collision revision re-samples');
	for (let i = 0; i < 8; i += 1) cache.resolve({ ...args, x: 100 + i });
	assert.ok(cache.entries.size <= 4, 'cache honors its bound');
	assert.ok(cache.stats.evictions > 0);
	cache.clear();
	assert.equal(cache.entries.size, 0);
});

test('GroundSampleCache rejects non-finite coordinates without caching', () => {
	const cache = new GroundSampleCache();
	const sample = cache.resolve({ x: NaN, z: 0, maximumY: 1, octree: null, terrainHeightAt, create: () => ({ height: 7 }) });
	assert.equal(sample.height, 7);
	assert.equal(cache.entries.size, 0);
});

test('createGroundSampler requires a terrain function and answers honestly', () => {
	assert.throws(() => createGroundSampler({}), /terrainHeightAt must be a function/);
	const sampler = createGroundSampler({ terrainHeightAt });
	assert.equal(sampler.heightAt(3, 4).y, terrainHeightAt(3, 4));
	const placed = sampler.placeOnGround((lx, lz) => ({ x: lx, z: lz }), 3, 4);
	assert.deepEqual([placed.x, placed.y, placed.z], [3, terrainHeightAt(3, 4), 4]);
	assert.equal(sampler.stats().mode, 'terrain-height-phase-one');
	const withOctree = sampler.withOctree(boxOctree(3));
	assert.equal(withOctree.stats().mode, 'terrain-height/raycast');
	assert.ok(Math.abs(withOctree.heightAt(0, 0).y - 3) < 1e-6);
});

test('createGroundSampler.samplePath samples each point exactly once', () => {
	let fullSamples = 0;
	let terrainTaps = 0;
	const counting = (x, z) => { terrainTaps += 1; return x + z; };
	const octree = {
		// One raycast per full sample; returns no hit so terrain truth answers.
		raycast() { fullSamples += 1; return null; }
	};
	const sampler = createGroundSampler({ terrainHeightAt: counting, octree });
	const results = sampler.samplePath([{ x: 1, z: 2 }, { x: 3, z: 4 }]);
	assert.equal(fullSamples, 2, `each path point triggers one raycast sample, got ${fullSamples}`);
	assert.equal(terrainTaps, 10, 'one terrain tap + four finite-difference normal taps per point');
	assert.deepEqual(results.map(r => r.y), [3, 7]);
	assert.equal(results[0].sample.y, 3);
	assert.equal(results[1].sample.source, 'terrain-height');
});

test('WorldGround rejects a hit below terrain in favor of terrain truth', () => {
	// Platform BELOW the terrain surface: the octree hit must not sink the player.
	const ground = new WorldGround({ terrainHeightAt: () => 5, octree: boxOctree(2) });
	const sample = ground.sample(0, 0);
	assert.equal(sample.source, 'terrain-height', 'sub-terrain hits are discarded');
	assert.equal(sample.height, 5);
});

test('TriangleCollider import path keeps the octree bounds closed', () => {
	const tri = new TriangleCollider(v(0, 0, 0), v(1, 0, 0), v(0, 0, 1), { kind: 't' });
	const octree = new AwtsmoosOctree(new Aabb(v(-10, -10, -10), v(10, 10, 10)));
	assert.ok(octree.insert(tri));
	const found = octree.query(new Aabb(v(-1, -1, -1), v(2, 1, 2)));
	assert.ok(found.includes(tri));
	octree.remove(tri);
	assert.ok(!octree.query(new Aabb(v(-1, -1, -1), v(2, 1, 2))).includes(tri));
});
