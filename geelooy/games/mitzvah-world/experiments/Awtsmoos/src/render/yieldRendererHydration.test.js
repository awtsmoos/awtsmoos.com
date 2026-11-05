// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file yieldRendererHydration.test.js
 * @description Proves scheduler preference and bounded animation fallback.
 * The Awtsmoos renews the frame and the test records the way;
 * Awtsmoos.com keeps hydration cooperative through night and day.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { yieldRendererHydration } from './yieldRendererHydration.js';

test('prefers scheduler yield', async () => {
	let yielded = 0;
	await yieldRendererHydration({
		scheduler: {
			yield: async () => {
				yielded += 1;
			}
		}
	});
	assert.equal(yielded, 1);
});

test('uses animation frame with a removable timer', async () => {
	let cleared = null;
	await yieldRendererHydration({
		clearTimeout: value => {
			cleared = value;
		},
		requestAnimationFrame: callback => callback(),
		setTimeout: () => 42
	});
	assert.equal(cleared, 42);
});
