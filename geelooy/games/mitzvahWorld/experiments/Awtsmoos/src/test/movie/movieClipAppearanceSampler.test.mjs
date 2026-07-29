// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { sampleMovieClipAppearance } from '../../movie/MovieClipAppearanceSampler.js';

function state(localTime) {
	return {
		clip: {
			duration: 4,
			effects: [
				{
					id: 'opacity',
					keyframes: [{ time: 0, value: 0 }, { time: 2, value: 1 }],
					kind: 'opacity'
				},
				{ id: 'blur', kind: 'blur', value: 8 },
				{ id: 'color', kind: 'saturate', value: 1.5 }
			],
			transitionIn: { duration: 1, easing: 'linear', type: 'fade' },
			transitionOut: { duration: 1, easing: 'linear', type: 'dissolve' }
		},
		localTime
	};
}

test('samples keyframes and multiplies transition opacity at clip-local time', () => {
	const sampled = sampleMovieClipAppearance(state(0.5));
	assert.equal(sampled.opacity, 0.125);
	assert.equal(sampled.blur, 8);
	assert.equal(sampled.saturate, 1.5);
	assert.deepEqual(sampled.transition.active, ['in:fade']);
	assert.match(sampled.filter, /saturate\(1.5\).*blur\(8px\)/);
});

test('samples transition out and returns neutral defaults without a scene', () => {
	const sampled = sampleMovieClipAppearance(state(3.5));
	assert.equal(sampled.opacity, 0.5);
	assert.deepEqual(sampled.transition.active, ['out:dissolve']);
	const neutral = sampleMovieClipAppearance(null);
	assert.equal(neutral.opacity, 1);
	assert.equal(neutral.blur, 0);
	assert.match(neutral.filter, /brightness\(1\)/);
});
