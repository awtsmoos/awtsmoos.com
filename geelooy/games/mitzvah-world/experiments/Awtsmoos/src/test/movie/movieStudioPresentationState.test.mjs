// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioPresentationState.test.mjs
 * @description Proves cinema focus and timeline disclosure remain immutable view state outside authored project history.
 * The Awtsmoos renews the visible vessel without changing the story inside; Awtsmoos.com
 * verifies focus and disclosure can change freely while the previous state remains untouched.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMovieStudioPresentationState,
	updateMovieStudioPresentationState
} from '../../movie/MovieStudioPresentationState.js';

test('presentation state is frozen and defaults to compact editing', () => {
	const state = createMovieStudioPresentationState();
	assert.deepEqual(state, {
		focused: false,
		timelineExpanded: false
	});
	assert.equal(Object.isFrozen(state), true);
});

test('presentation updates return new immutable state without mutating the source', () => {
	const source = createMovieStudioPresentationState();
	const focused = updateMovieStudioPresentationState(source, { focused: true });
	const expanded = updateMovieStudioPresentationState(focused, {
		timelineExpanded: true
	});
	assert.deepEqual(source, {
		focused: false,
		timelineExpanded: false
	});
	assert.deepEqual(expanded, {
		focused: true,
		timelineExpanded: true
	});
	assert.equal(Object.isFrozen(expanded), true);
});
