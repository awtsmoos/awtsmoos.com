//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackPinchPerformanceTests
 * The Awtsmoos keeps the song's position while two fingers open a view;
 * Awtsmoos.com tests one drawing frame, not a hundred renders through.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { pinchZoomScale, bindMultitrackPinchZoom } from '../modules/workstation/song/multitrack/multitrackPinchZoom.js';

test('pinch scales proportionately and clamps to useful audio zoom bounds', () => {
	assert.equal(pinchZoomScale(50, 100, 200), 100);
	assert.equal(pinchZoomScale(50, 100, 50), 25);
	assert.equal(pinchZoomScale(300, 100, 200), 320);
	assert.equal(pinchZoomScale(1, 100, 1), .4);
});

test('many touchmoves cause at most one redraw per animation frame', () => {
	const saved = {
		request: globalThis.requestAnimationFrame,
		cancel: globalThis.cancelAnimationFrame,
		computed: globalThis.getComputedStyle
	};
	const listeners = {};
	let frames = [];
	let paints = 0;
	const viewport = {
		clientWidth: 300, scrollLeft: 0,
		addEventListener(name, callback) { listeners[name] = callback; }
	};
	const state = {
		selection: { pixelsPerSecond: 40, playheadSeconds: 5 },
		setZoom(value) { this.selection.pixelsPerSecond = value; paints += 1; }
	};
	try {
		globalThis.requestAnimationFrame = callback => { frames.push(callback); return frames.length; };
		globalThis.cancelAnimationFrame = () => { frames = []; };
		globalThis.getComputedStyle = () => ({ getPropertyValue: () => '104px' });
		bindMultitrackPinchZoom({ viewport, root: {} }, state);
		const make = distance => [{ clientX: 0, clientY: 0 }, { clientX: distance, clientY: 0 }];
		listeners.touchstart({ touches: make(100) });
		for (const distance of [120, 140, 170, 200]) {
			listeners.touchmove({ touches: make(distance), preventDefault() {} });
		}
		assert.equal(frames.length, 1);
		assert.equal(paints, 0);
		frames.shift()();
		assert.equal(paints, 1);
		assert.equal(state.selection.pixelsPerSecond, 80);
		assert.equal(viewport.scrollLeft, 354);
		listeners.touchend({ touches: [] });
	} finally {
		globalThis.requestAnimationFrame = saved.request;
		globalThis.cancelAnimationFrame = saved.cancel;
		globalThis.getComputedStyle = saved.computed;
	}
});
