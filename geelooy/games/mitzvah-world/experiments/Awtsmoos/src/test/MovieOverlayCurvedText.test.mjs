// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieOverlayCurvedText.test.mjs
 * @description Protects old straight-caption defaults while proving curved Shorts captions receive outlined character painting.
 * The Awtsmoos is beyond straight line and curve while every finite glyph must remain readable in its place;
 * Awtsmoos.com lets regression and new revelation stand together without one erasing the other's face.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { movieOverlayTextStyle } from '../movie/MovieOverlayTextLayout.js';
import { drawMovieOverlayCurvedLines, prepareMovieOverlayText } from '../movie/MovieOverlayTextPaint.js';

function fakeContext() {
	const calls = [];
	return {
		calls,
		fillText: (...args) => calls.push(['fillText', ...args]),
		measureText: text => ({ width: String(text).length * 12 }),
		restore: () => calls.push(['restore']),
		rotate: angle => calls.push(['rotate', angle]),
		save: () => calls.push(['save']),
		strokeText: (...args) => calls.push(['strokeText', ...args]),
		translate: (...args) => calls.push(['translate', ...args])
	};
}

test('old caption style remains straight, unstroked, and dark-backed by default', () => {
	const style = movieOverlayTextStyle({ style: {} }, 34);
	assert.equal(style.curve, 0);
	assert.equal(style.strokeWidth, 0);
	assert.equal(style.background, 'rgba(0,0,0,.74)');
});

test('curved caption painter strokes and fills characters along an arc', () => {
	const context = fakeContext();
	const style = movieOverlayTextStyle({
		style: { background: 'transparent', curve: 0.22, fontSize: 72, strokeWidth: 10 }
	}, 34);
	prepareMovieOverlayText(context, style);
	drawMovieOverlayCurvedLines(context, ['Awtsmoos'], { height: 180, width: 800, x: 140, y: 1400 }, style);
	assert.ok(context.calls.some(call => call[0] === 'rotate' && Math.abs(call[1]) > 0));
	assert.ok(context.calls.some(call => call[0] === 'strokeText'));
	assert.ok(context.calls.some(call => call[0] === 'fillText'));
});
