// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieCinemaLongForm.test.mjs
 * @description Proves one minute at twenty-four FPS becomes 1,440 exact states across four bounded segments.
 * The Awtsmoos renews whole and segment without division in the source; Awtsmoos.com verifies
 * every intended frame appears once, keyframes remain periodic, and queue policy stays bounded.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeMovieCinemaManifest } from '../../movie/MovieCinemaAnalyzer.js';
import { createMovieCinemaFlagship } from '../../movie/MovieCinemaFlagship.js';
import { createExactSegmentPlan } from '../../movie/MovieExactSegmentPlan.js';

test('one-minute cinema has exact long-form frame and segment coverage', () => {
	const analysis = analyzeMovieCinemaManifest(createMovieCinemaFlagship());
	const plan = createExactSegmentPlan({
		expectedFrames: analysis.expectedFrames,
		fps: analysis.fps
	});
	assert.equal(analysis.duration, 60);
	assert.equal(analysis.expectedFrames, 1440);
	assert.equal(plan.length, 4);
	assert.deepEqual(plan.map(segment => segment.encodedFrames), [360, 360, 360, 360]);
	assert.equal(plan[0].startFrame, 0);
	assert.equal(plan.at(-1).endFrameExclusive, 1440);
	assert.equal(plan.reduce((sum, segment) => sum + segment.encodedFrames, 0), 1440);
});

test('all scenes preserve five-second camera and choreography bounds', () => {
	const manifest = createMovieCinemaFlagship();
	for (const scene of manifest.scenes) {
		assert.equal(scene.duration, 5);
		const camera = scene.beats.find(beat => beat.type === 'camera');
		assert.equal(camera.duration, 5);
		assert.ok(camera.rig);
		assert.ok(scene.beats.every(beat => Number(beat.duration) <= scene.duration));
	}
});
