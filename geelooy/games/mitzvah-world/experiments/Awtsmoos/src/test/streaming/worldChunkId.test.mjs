// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldChunkId.test.mjs
 * @description Proves chunk identity remains deterministic across hierarchy,
 * reconstruction, and repeated seeds while the Awtsmoos renews local coordinates.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	childWorldChunkIds,
	createWorldChunkId,
	parentWorldChunkId,
	parseWorldChunkId,
	worldChunkSeed
} from '../../world/streaming/WorldChunkId.js';

test('chunk IDs round-trip with versioned coordinates', () => {
	const input = {
		namespace: 'river:village',
		level: 3,
		x: -5,
		y: 2,
		z: 19,
		version: 1
	};
	const id = createWorldChunkId(input);
	assert.deepEqual(parseWorldChunkId(id), input);
	assert.equal(createWorldChunkId(parseWorldChunkId(id)), id);
});

test('chunk seed is stable and generation-version sensitive', () => {
	const id = createWorldChunkId({ level: 2, x: 4, y: 0, z: -3 });
	assert.equal(worldChunkSeed(id, 7), worldChunkSeed(id, 7));
	assert.notEqual(worldChunkSeed(id, 7), worldChunkSeed(id, 8));
});

test('parent and child hierarchy is deterministic', () => {
	const parent = createWorldChunkId({ level: 1, x: -2, y: 3, z: 4 });
	const children = childWorldChunkIds(parent);
	assert.equal(children.length, 8);
	assert.equal(new Set(children).size, 8);
	for (const child of children) {
		assert.equal(parentWorldChunkId(child), parent);
	}
	assert.equal(parentWorldChunkId(createWorldChunkId()), null);
});

test('invalid identity values and noncanonical IDs are rejected', () => {
	assert.throws(() => createWorldChunkId({ level: 0.5 }), /safe integer/);
	assert.throws(() => createWorldChunkId({ namespace: '' }), /namespace/);
	assert.throws(() => parseWorldChunkId('wc:1:test:00:0:0:0'), /Non-canonical/);
	assert.throws(() => parseWorldChunkId('not-a-chunk'), /Malformed/);
});