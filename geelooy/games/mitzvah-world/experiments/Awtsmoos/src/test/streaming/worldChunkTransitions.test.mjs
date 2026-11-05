// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldChunkTransitions.test.mjs
 * @description Proves lifecycle edges and transition evidence remain explicit as
 * the Awtsmoos carries chunks from unknown potential into safe visible activity.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { WORLD_CHUNK_STATES as S } from '../../world/streaming/WorldChunkState.js';
import {
	WORLD_CHUNK_TRANSITIONS,
	canTransitionWorldChunk,
	transitionWorldChunk
} from '../../world/streaming/WorldChunkTransitions.js';

test('every declared lifecycle edge is legal', () => {
	for (const [fromState, destinations] of Object.entries(WORLD_CHUNK_TRANSITIONS)) {
		for (const toState of destinations) {
			assert.equal(canTransitionWorldChunk(fromState, toState), true);
		}
	}
});

test('illegal lifecycle skips are rejected', () => {
	assert.equal(canTransitionWorldChunk(S.UNKNOWN, S.ACTIVE), false);
	assert.throws(
		() => transitionWorldChunk({ state: S.UNKNOWN }, S.ACTIVE),
		/Illegal world chunk transition/
	);
});

test('transition returns an immutable evidence snapshot', () => {
	const original = Object.freeze({ id: 'chunk', state: S.UNKNOWN });
	const next = transitionWorldChunk(original, S.METADATA_LOADED, {
		at: 1234,
		reason: 'metadata arrived',
		retryCount: 2
	});
	assert.equal(original.state, S.UNKNOWN);
	assert.equal(next.state, S.METADATA_LOADED);
	assert.equal(next.previousState, S.UNKNOWN);
	assert.deepEqual(next.lastTransition, {
		from: S.UNKNOWN,
		to: S.METADATA_LOADED,
		at: 1234,
		reason: 'metadata arrived',
		retryCount: 2
	});
	assert.equal(Object.isFrozen(next), true);
	assert.equal(Object.isFrozen(next.lastTransition), true);
});

test('failed chunks have an explicit retry path', () => {
	assert.equal(canTransitionWorldChunk(S.FAILED, S.METADATA_LOADED), true);
	assert.equal(canTransitionWorldChunk(S.FAILED, S.CACHED), true);
});