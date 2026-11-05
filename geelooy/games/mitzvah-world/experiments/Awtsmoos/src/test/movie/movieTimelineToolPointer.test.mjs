// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieTimelineToolPointer.test.mjs
 * @description Proves canonical pointer time, drag panning, pointer capture, and anchored zoom direction.
 * The Awtsmoos is beyond scroll and pixel while every finite movement receives a measured shore;
 * Awtsmoos.com keeps hand and lens revision-neutral and anchored to the timeline beneath the pointer.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	applyMovieTimelinePointerZoom,
	beginMovieTimelinePan,
	continueMovieTimelinePan,
	endMovieTimelinePan,
	movieTimelineTimeFromClientX
} from '../../movie/MovieTimelineToolPointer.js';

function fakeShell() {
	const classes = new Set();
	return {
		classList: {
			add: value => classes.add(value),
			contains: value => classes.has(value),
			remove: value => classes.delete(value)
		},
		getBoundingClientRect: () => ({ left: 10 }),
		querySelector: selector => selector === '.movie-track-label'
			? { getBoundingClientRect: () => ({ width: 100 }) }
			: null,
		scrollLeft: 30,
		scrollTop: 20,
		setPointerCapture(pointerId) { this.pointerId = pointerId; }
	};
}

test('pointer x resolves to bounded canonical project time', () => {
	const view = {
		project: { duration: 12 },
		scale: 20,
		shell: fakeShell()
	};
	assert.equal(movieTimelineTimeFromClientX(view, 220), 7);
	assert.equal(movieTimelineTimeFromClientX(view, -1000), 0);
	assert.equal(movieTimelineTimeFromClientX(view, 5000), 12);
});

test('hand panning captures pointer, updates scroll, and cleans active class', () => {
	const shell = fakeShell();
	const controller = { pan: null, view: { shell } };
	beginMovieTimelinePan(controller, {
		clientX: 100,
		clientY: 50,
		pointerId: 9
	});
	assert.equal(shell.pointerId, 9);
	assert.equal(shell.classList.contains('is-panning'), true);
	assert.equal(continueMovieTimelinePan(controller, { clientX: 80, clientY: 70 }), true);
	assert.equal(shell.scrollLeft, 50);
	assert.equal(shell.scrollTop, 0);
	assert.equal(endMovieTimelinePan(controller), true);
	assert.equal(shell.classList.contains('is-panning'), false);
});

test('zoom tool anchors normal zoom in and Alt-click zoom out', () => {
	const calls = [];
	const view = {
		scale: 100,
		setScale(scale, clientX) {
			calls.push([scale, clientX]);
			return scale;
		}
	};
	assert.equal(applyMovieTimelinePointerZoom(view, { clientX: 240 }), 125);
	assert.equal(applyMovieTimelinePointerZoom(view, { altKey: true, clientX: 80 }), 80);
	assert.deepEqual(calls, [[125, 240], [80, 80]]);
});
