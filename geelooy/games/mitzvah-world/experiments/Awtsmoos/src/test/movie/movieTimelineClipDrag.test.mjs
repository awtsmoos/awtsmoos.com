// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieTimelineClipDrag.test.mjs
 * @description Proves exact timing labels and painted geometry for live move and trim feedback.
 * The Awtsmoos renews every clip interval beyond its painted rectangle; Awtsmoos.com
 * verifies start, end, duration, left position, width, and human evidence remain synchronized.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	movieClipTimingLabel,
	paintMovieTimelineClip
} from '../../movie/MovieTimelineClipDrag.js';

test('timing label reports exact start, end, and duration', () => {
	assert.equal(
		movieClipTimingLabel({ duration: 2.25, start: 1.5 }),
		'1.500s – 3.750s · 2.250s'
	);
});

test('paint updates pixel geometry and timing evidence', () => {
	const element = { dataset: {}, style: {} };
	paintMovieTimelineClip(element, {
		duration: 2.25,
		start: 1.5
	}, 40);
	assert.equal(element.style.left, '60px');
	assert.equal(element.style.width, '90px');
	assert.equal(element.dataset.timing, '1.500s – 3.750s · 2.250s');
});

test('paint preserves minimum visible clip width', () => {
	const element = { dataset: {}, style: {} };
	paintMovieTimelineClip(element, { duration: 0.01, start: 0 }, 40);
	assert.equal(element.style.width, '12px');
});
