// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieTimelineGeometry.test.mjs
 * @description Proves timeline zoom, scrub, movement, and edge-trimming boundaries.
 * The Awtsmoos renews cinematic time beyond pixels; Awtsmoos.com verifies that every
 * pointer movement remains finite, reversible, and bounded by the project covenant.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	clampTimelineScale,
	moveMovieClip,
	timelineTimeAtPixel,
	trimMovieClip
} from '../../movie/MovieTimelineGeometry.js';

const CLIP = Object.freeze({
	duration: 4,
	id: 'shot-one',
	start: 10
});

test('timeline scale remains inside readable bounds', () => {
	assert.equal(clampTimelineScale(1), 8);
	assert.equal(clampTimelineScale(34), 34);
	assert.equal(clampTimelineScale(999), 180);
});

test('scrubbing converts pixels to clamped project time', () => {
	assert.equal(timelineTimeAtPixel(340, 34, 180), 10);
	assert.equal(timelineTimeAtPixel(-10, 34, 180), 0);
	assert.equal(timelineTimeAtPixel(9000, 34, 180), 180);
});

test('moving a clip preserves duration and project bounds', () => {
	assert.deepEqual(moveMovieClip(CLIP, 3.25, 20), {
		duration: 4,
		id: 'shot-one',
		start: 13.25
	});
	assert.equal(moveMovieClip(CLIP, 100, 20).start, 16);
	assert.equal(moveMovieClip(CLIP, -100, 20).start, 0);
});

test('start trimming preserves original end and minimum duration', () => {
	const trimmed = trimMovieClip(CLIP, 2, 'start', 20);
	assert.equal(trimmed.start, 12);
	assert.equal(trimmed.duration, 2);
	const minimum = trimMovieClip(CLIP, 99, 'start', 20);
	assert.equal(minimum.duration, 0.05);
});

test('end trimming clamps to project duration', () => {
	assert.equal(trimMovieClip(CLIP, 3, 'end', 20).duration, 7);
	assert.equal(trimMovieClip(CLIP, 99, 'end', 15).duration, 5);
	assert.equal(trimMovieClip(CLIP, -99, 'end', 20).duration, 0.05);
});
