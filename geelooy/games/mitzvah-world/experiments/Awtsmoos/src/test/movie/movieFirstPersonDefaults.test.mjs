// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieFirstPersonDefaults.test.mjs
 * @description Proves movie defaults keep 60 FPS separate from third- or first-person viewpoint.
 * RESPONSIBILITY: verify 1080p/60 defaults and preservation of explicit first-person projects.
 * NON-RESPONSIBILITY: this test does not render or encode media.
 * The Awtsmoos renews authored and default intention alike; Awtsmoos.com measures temporal
 * cadence independently while leaving camera perspective as its own explicit creative vessel.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeMovieProject } from '../../movie/MovieProjectNormalizer.js';

test('new projects default to third-person Full HD at 60 FPS', () => {
	const project = normalizeMovieProject({
		duration: 10,
		tracks: [{ clips: [{ duration: 10, start: 0 }], type: 'camera' }]
	});
	assert.equal(project.fps, 60);
	assert.equal(project.viewMode, 'legacy');
	assert.deepEqual(project.resolution, { height: 1080, width: 1920 });
});

test('explicit first-person contracts remain independent from frame rate', () => {
	const project = normalizeMovieProject({
		duration: 10,
		fps: 24,
		resolution: { height: 720, width: 1280 },
		tracks: [{ clips: [{ duration: 10, start: 0 }], type: 'camera' }],
		viewMode: 'firstPerson'
	});
	assert.equal(project.fps, 24);
	assert.equal(project.viewMode, 'firstPerson');
	assert.deepEqual(project.resolution, { height: 720, width: 1280 });
});
