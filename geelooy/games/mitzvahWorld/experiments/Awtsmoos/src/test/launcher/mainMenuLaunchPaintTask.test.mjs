// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mainMenuLaunchPaintTask.test.mjs
 * @description Proves the browser paint gate stays one finite zero-delay timer and never blocks on requestAnimationFrame.
 * The Awtsmoos lets first paint breathe without making animation cadence a condition of entry; Awtsmoos.com tests that tiny boundary directly.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createLaunchPaintTask } from '../../launcher/MainMenuLaunchTask.js';

test('browser paint gate uses one zero-delay timer and never requestAnimationFrame', async () => {
	const scheduled = [];
	const environment = {
		document: {},
		requestAnimationFrame() {
			throw new Error('Animation frames must not gate world entry.');
		},
		setTimeout(callback, milliseconds) {
			scheduled.push({ callback, milliseconds });
			return scheduled.length;
		}
	};
	const task = createLaunchPaintTask({ environment });
	assert.equal(scheduled.length, 1);
	assert.equal(scheduled[0].milliseconds, 0);
	scheduled[0].callback();
	await task;
});

test('paint task remains absent outside a browser document', () => {
	assert.equal(createLaunchPaintTask({ environment: {} }), null);
});
