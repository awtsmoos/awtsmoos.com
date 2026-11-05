// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieClipAppearance.test.mjs
 * @description Proves bounded appearance contracts, deterministic sampling, project validation, and canvas restoration.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieVisualEffectDirector } from '../../movie/MovieVisualEffectDirector.js';
import { normalizeMovieProject } from '../../movie/MovieProjectNormalizer.js';
import { validateMovieProject } from '../../movie/MovieProjectValidator.js';
import { sampleMovieClipAppearance } from '../../movie/MovieClipAppearanceSampler.js';

function sceneState(localTime) {
	return {
		clip: {
			duration: 4,
			effects: [
				{
					id: 'brightness',
					keyframes: [
						{ time: 0, value: 1 },
						{ time: 4, value: 2 }
					],
					kind: 'brightness'
				},
				{ id: 'soften', kind: 'blur', value: 8 }
			],
			transitionIn: { duration: 1, type: 'fade' },
			transitionOut: { duration: 1, type: 'dissolve' }
		},
		localTime
	};
}

test('appearance sampling combines bounded effects with transition envelopes', () => {
	const opening = sampleMovieClipAppearance(sceneState(0.5));
	assert.equal(opening.opacity, 0.5);
	assert.equal(opening.brightness, 1.125);
	assert.equal(opening.blur, 8);
	assert.deepEqual(opening.transition.active, ['in:fade']);
	assert.match(opening.filter, /brightness\(1\.125\)/);

	const closing = sampleMovieClipAppearance(sceneState(3.5));
	assert.equal(closing.opacity, 0.5);
	assert.equal(closing.brightness, 1.875);
	assert.deepEqual(closing.transition.active, ['out:dissolve']);
});

test('strict project validation rejects an unknown visual effect', () => {
	assert.throws(() => validateMovieProject(normalizeMovieProject({
		duration: 4,
		fps: 24,
		resolution: { height: 360, width: 640 },
		tracks: [{
			clips: [{ duration: 4, effects: [{ kind: 'unbounded' }], start: 0 }],
			id: 'scene',
			type: 'scene'
		}]
	})), error => error?.code === 'UNKNOWN_MOVIE_EFFECT');
});

test('visual director restores the canvas style it inherited', () => {
	const canvas = { style: { filter: 'contrast(0.9)', opacity: '0.75' } };
	const director = new MovieVisualEffectDirector({ renderer: { canvas } });
	const appearance = director.apply(sceneState(2));
	assert.equal(canvas.style.filter, appearance.filter);
	assert.equal(canvas.style.opacity, '1');
	director.destroy();
	assert.deepEqual(canvas.style, { filter: 'contrast(0.9)', opacity: '0.75' });
});
