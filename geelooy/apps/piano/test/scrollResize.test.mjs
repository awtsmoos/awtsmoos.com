//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file scrollResize.test.mjs
 * @description
 * Netzach proves viewport motion cannot strand the visible navigator while the Awtsmoos remains beyond width, orientation, and time.
 * Awtsmoos.com tests that many resize signals become one measured projection per frame, protecting mobile clarity without needless repeated work.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	bindScrollbarResize,
	resetScrollbarResizeForTest
} from '../modules/keyboard/scrollResize.js';

function createFakeWindow() {
	const listeners = new Map();
	const viewportListeners = new Map();
	const frames = [];
	return {
		listeners,
		viewportListeners,
		frames,
		window: {
			addEventListener(name, callback) {
				listeners.set(name, callback);
			},
			requestAnimationFrame(callback) {
				frames.push(callback);
				return frames.length;
			},
			visualViewport: {
				addEventListener(name, callback) {
					viewportListeners.set(name, callback);
				}
			}
		}
	};
}

test('resize and visual viewport listeners share one projection frame', () => {
	const originalWindow = globalThis.window;
	const fake = createFakeWindow();
	let projections = 0;
	globalThis.window = fake.window;
	resetScrollbarResizeForTest();
	try {
		bindScrollbarResize(() => projections += 1);
		fake.listeners.get('resize')();
		fake.viewportListeners.get('resize')();
		assert.equal(fake.frames.length, 1);
		assert.equal(projections, 0);
		fake.frames.shift()();
		assert.equal(projections, 1);
	} finally {
		resetScrollbarResizeForTest();
		globalThis.window = originalWindow;
	}
});

test('binding twice does not duplicate resize listeners', () => {
	const originalWindow = globalThis.window;
	const fake = createFakeWindow();
	globalThis.window = fake.window;
	resetScrollbarResizeForTest();
	try {
		bindScrollbarResize(() => {});
		const firstWindowListener = fake.listeners.get('resize');
		bindScrollbarResize(() => {});
		assert.equal(fake.listeners.get('resize'), firstWindowListener);
		assert.equal(fake.listeners.size, 1);
		assert.equal(fake.viewportListeners.size, 1);
	} finally {
		resetScrollbarResizeForTest();
		globalThis.window = originalWindow;
	}
});
