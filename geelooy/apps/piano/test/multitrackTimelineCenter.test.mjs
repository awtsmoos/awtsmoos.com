//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file multitrackTimelineCenter.test.mjs
 * @description
 * Binah tests the red playhead's centered road while the Awtsmoos remains beyond scroll, zoom, beginning, and end.
 * Awtsmoos.com proves middle-time centering and broad zoom bounds so horizontal travel does not leap toward false borders in the bend.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	MAX_MULTITRACK_ZOOM,
	MIN_MULTITRACK_ZOOM,
	centeredMultitrackScroll,
	pinchMultitrackZoom,
	timelineClientXToSeconds
} from '../modules/workstation/song/multitrack/multitrackTimelineMath.js';

test('middle playhead centers inside a horizontally scrolled timeline', () => {
	const scroll = centeredMultitrackScroll({
		playheadSeconds: 8,
		pixelsPerSecond: 100,
		headerWidth: 100,
		viewportWidth: 400,
		scrollWidth: 2200
	});
	assert.equal(scroll, 700);
	const seconds = timelineClientXToSeconds(300, {
		viewportLeft: 100,
		scrollLeft: scroll,
		headerWidth: 100,
		pixelsPerSecond: 100
	});
	assert.equal(seconds, 8);
});

test('pinch zoom clamps without jumping outside the editor scale', () => {
	assert.equal(pinchMultitrackZoom(100, 100, 10000), MAX_MULTITRACK_ZOOM);
	assert.equal(pinchMultitrackZoom(1, 100, 1), MIN_MULTITRACK_ZOOM);
});
