// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldCollisionBounds.test.mjs
 * @description Reproduces the live high-mountain forest failure and proves the canonical octree encloses its lawful collision.
 * The Awtsmoos raises one Aspen above yesterday's ceiling without removing it from physics; Awtsmoos.com verifies
 * measured mountain terrain, lower-trunk collision, and both world builders now share one sufficient spatial covenant.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { TriangleCollider } from '../../collision/TriangleCollider.js';
import { Aabb } from '../../math/Aabb.js';
import {
	createWorldCollisionBounds,
	worldCollisionBoundsEvidence
} from '../../app/WorldCollisionBounds.js';
import {
	buildWorldCollisionOctree,
	buildWorldCollisionOctreeAsync
} from '../../app/WorldCollisionOctree.js';

const ASPEN_BASE_Y = 92.79726479545585;
const ASPEN_COLLISION_TOP_Y = 96.46926479545584;
const TERRAIN_PEAK_Y = 122.2013926870425;

const mountainTrunk = new TriangleCollider(
	{ x: -214.8, y: ASPEN_BASE_Y, z: -52.8 },
	{ x: -214.1, y: ASPEN_COLLISION_TOP_Y, z: -52.5 },
	{ x: -214.4, y: ASPEN_BASE_Y, z: -52.1 },
	{ floor: false, kind: 'forest-trunk-measured', solid: true }
);

test('legacy Y=90 ceiling excludes the measured Aspen lower trunk', () => {
	const legacy = Aabb.centerSize(
		{ x: 0, y: 0, z: 0 },
		{ x: 780, y: 180, z: 780 }
	);
	assert.equal(legacy.intersects(mountainTrunk.aabb), false);
});

test('canonical bounds contain mountain terrain and structural headroom', () => {
	const bounds = createWorldCollisionBounds();
	const evidence = worldCollisionBoundsEvidence();
	assert.equal(bounds.min.x, -390);
	assert.equal(bounds.max.x, 390);
	assert.equal(bounds.min.z, -390);
	assert.equal(bounds.max.z, 390);
	assert.ok(bounds.max.y > TERRAIN_PEAK_Y);
	assert.ok(bounds.max.y > ASPEN_COLLISION_TOP_Y);
	assert.ok(evidence.maximumY - TERRAIN_PEAK_Y > 40);
	assert.equal(bounds.containsAabb(mountainTrunk.aabb), true);
});

test('synchronous world octree inserts the measured high trunk', () => {
	const octree = buildWorldCollisionOctree([mountainTrunk]);
	assert.equal(octree.all().includes(mountainTrunk), true);
});

test('asynchronous world octree uses the same mountain envelope', async () => {
	const octree = await buildWorldCollisionOctreeAsync([mountainTrunk], {
		batchSize: 64,
		yieldWork: async () => {}
	});
	assert.equal(octree.all().includes(mountainTrunk), true);
});
