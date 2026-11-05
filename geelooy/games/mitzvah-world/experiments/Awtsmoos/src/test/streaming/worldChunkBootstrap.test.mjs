// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldChunkBootstrap.test.mjs
 * @description Proves the inherited complete world becomes one deterministic active
 * root vessel without leaking runtime geometry into serialized Awtsmoos.com truth.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	BOOTSTRAP_WORLD_CHUNK_ID,
	createBootstrapWorldChunk
} from '../../world/streaming/WorldChunkBootstrap.js';
import { serializeWorldChunkRecord } from '../../world/streaming/WorldChunkRecord.js';
import { WORLD_CHUNK_STATES as S } from '../../world/streaming/WorldChunkState.js';

function fixture() {
	const bounds = {
		min: { x: -390, y: -90, z: -390 },
		max: { x: 390, y: 90, z: 390 }
	};
	const terrain = {
		group: { name: 'terrain' },
		colliders: new Array(10).fill({ kind: 'terrain' })
	};
	const mainOctree = {
		bounds: {
			toJSON: () => bounds
		}
	};
	return { bounds, terrain, mainOctree };
}

test('bootstrap chunk preserves exact root bounds and active readiness', () => {
	const { bounds, terrain, mainOctree } = fixture();
	const record = createBootstrapWorldChunk({ terrain, mainOctree });
	assert.equal(record.id, BOOTSTRAP_WORLD_CHUNK_ID);
	assert.equal(record.state, S.ACTIVE);
	assert.deepEqual(record.bounds, bounds);
	assert.deepEqual(record.readiness, {
		visualReady: true,
		collisionPrepared: true,
		safetyValidated: true
	});
	assert.equal(record.parentId, null);
	assert.equal(record.childIds.length, 0);
	assert.equal(record.runtime.collisionOctree, mainOctree);
});

test('bootstrap memory estimate is a collision-position lower bound', () => {
	const { terrain, mainOctree } = fixture();
	const record = createBootstrapWorldChunk({ terrain, mainOctree });
	assert.equal(record.memoryEstimate.geometry, 10 * 3 * 3 * 4);
	assert.equal(record.memoryEstimate.collision, 10 * 3 * 3 * 4);
	assert.equal(
		record.runtime.memoryEstimateMethod,
		'collision-position-lower-bound'
	);
});

test('serialization excludes inherited runtime vessels and stays deterministic', () => {
	const firstFixture = fixture();
	const secondFixture = fixture();
	const first = createBootstrapWorldChunk(firstFixture);
	const second = createBootstrapWorldChunk(secondFixture);
	assert.equal(first.id, second.id);
	assert.equal(first.deterministicSeed, second.deterministicSeed);
	const serialized = serializeWorldChunkRecord(first);
	assert.equal('runtime' in serialized, false);
	assert.deepEqual(serialized.bounds, firstFixture.bounds);
});

test('incomplete terrain or collision inputs are rejected', () => {
	assert.throws(() => createBootstrapWorldChunk(), /terrain package/);
	assert.throws(
		() => createBootstrapWorldChunk({ terrain: { group: {}, colliders: [] } }),
		/octree bounds/
	);
});