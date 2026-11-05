// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	normalizeMovieClipEffects,
	normalizeMovieClipTransition,
	validateMovieClipAppearance
} from '../../movie/MovieClipAppearanceContract.js';

test('appearance contract normalizes bounded transitions, effects, and ordered keyframes', () => {
	assert.deepEqual(normalizeMovieClipTransition({ duration: 99, type: 'fade' }, 4), {
		duration: 4,
		easing: 'smoothstep',
		type: 'fade'
	});
	const effects = normalizeMovieClipEffects([{
		id: 'blur-main',
		keyframes: [
			{ time: 3, value: 100 },
			{ easing: 'smoothstep', time: 1, value: 4 }
		],
		kind: 'blur',
		value: -2
	}], 4);
	assert.equal(effects[0].value, 0);
	assert.deepEqual(effects[0].keyframes.map(frame => [frame.time, frame.value]), [
		[1, 4],
		[3, 64]
	]);
	assert.equal(validateMovieClipAppearance({ duration: 4, effects }), true);
});

test('appearance contract rejects unknown kinds, duplicate ids, times, and excessive arrays', () => {
	assert.throws(() => normalizeMovieClipTransition({ type: 'wipe' }, 4), /Unknown transition/);
	assert.throws(() => normalizeMovieClipEffects([{ kind: 'grain' }], 4), /Unknown movie effect/);
	assert.throws(() => normalizeMovieClipEffects([
		{ id: 'same', kind: 'opacity' },
		{ id: 'same', kind: 'blur' }
	], 4), /Duplicate movie effect/);
	assert.throws(() => normalizeMovieClipEffects([{
		id: 'opacity',
		keyframes: [{ time: 1, value: 0 }, { time: 1, value: 1 }],
		kind: 'opacity'
	}], 4), /duplicate keyframe time/i);
});
