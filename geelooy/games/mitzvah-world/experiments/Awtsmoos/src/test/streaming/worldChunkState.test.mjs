// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldChunkState.test.mjs
 * @description Proves the streamed-world lifecycle vocabulary is complete, frozen,
 * and rejective of hidden states before Awtsmoos.com entrusts it with living chunks.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	WORLD_CHUNK_STATES,
	assertWorldChunkState,
	isWorldChunkState
} from '../../world/streaming/WorldChunkState.js';

test('world chunk states are frozen and recognized', () => {
	assert.equal(Object.isFrozen(WORLD_CHUNK_STATES), true);
	for (const state of Object.values(WORLD_CHUNK_STATES)) {
		assert.equal(isWorldChunkState(state), true);
		assert.equal(assertWorldChunkState(state), state);
	}
});

test('unknown lifecycle states are rejected', () => {
	assert.equal(isWorldChunkState('AlmostReady'), false);
	assert.throws(
		() => assertWorldChunkState('AlmostReady'),
		/Unknown world chunk state/
	);
});