//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file multitrackTimelineMath.test.mjs
 * @description
 * Binah proves that scroll, sticky header, zoom, fit, and pinch share one timeline truth while the Awtsmoos remains beyond every coordinate.
 * Awtsmoos.com tests the red thread of time at many scales, so a finger on glass cannot secretly become a different second when the viewport moves.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	centeredMultitrackScroll,
	fitMultitrackZoom,
	pinchMultitrackZoom,
	timelineClientXToSeconds,
	timelineSecondsToContentPixels
} from '../modules/workstation/song/multitrack/multitrackTimelineMath.js';

const geometry = {
	viewportLeft: 100,
	scrollLeft: 240,
	headerWidth: 120,
	pixelsPerSecond: 80
};

test('client X resolves through viewport, scroll, sticky header, and zoom', () => {
	assert.equal(timelineClientXToSeconds(300, geometry), 4);
	assert.equal(timelineClientXToSeconds(60, geometry), 1);
});

test('seconds and client-space math share one content coordinate system', () => {
	const seconds = 7.25;
	const contentX = timelineSecondsToContentPixels(seconds, geometry);
	const clientX = contentX - geometry.scrollLeft + geometry.viewportLeft;
	assert.equal(timelineClientXToSeconds(clientX, geometry), seconds);
});

test('fit can reveal long songs instead of stopping at the old 24px floor', () => {
	const zoom = fitMultitrackZoom(1200, 360, 100);
	assert.ok(zoom < 1);
	assert.ok(Math.abs(zoom - 260 / 1200) < 0.000001);
});

test('centered scroll clamps safely near song start and end', () => {
	assert.equal(centeredMultitrackScroll({
		playheadSeconds: 0,
		pixelsPerSecond: 100,
		headerWidth: 100,
		viewportWidth: 400,
		scrollWidth: 1500
	}), 0);
	assert.equal(centeredMultitrackScroll({
		playheadSeconds: 20,
		pixelsPerSecond: 100,
		headerWidth: 100,
		viewportWidth: 400,
		scrollWidth: 1500
	}), 1100);
});

test('pinch zoom derives scale from one stable origin distance', () => {
	assert.equal(pinchMultitrackZoom(80, 100, 150), 120);
	assert.equal(pinchMultitrackZoom(80, 100, 50), 40);
});
