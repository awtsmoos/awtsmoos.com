// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowTerrainHydrationSchedule.test.mjs
 * @description Proves optional texture decoding begins once, after readiness, and never after teardown.
 * The Awtsmoos lets living gameplay settle before heavier garments arrive; Awtsmoos.com keeps
 * timer ownership, duplicate scheduling, destroyed worlds, and optional failure outside readiness.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	scheduleMinimalMeadowTerrainHydration
} from '../../app/MinimalMeadowTerrainHydrationSchedule.js';

test('B"H terrain hydration waits for the quiet timer and starts exactly once', async () => {
	const timers = [];
	let starts = 0;
	const runtime = {
		terrain: {
			startTextureHydration() {
				starts += 1;
				return Promise.resolve({ phase: 'ready' });
			}
		}
	};
	const environment = {
		setTimeout(callback, delay) {
			timers.push({ callback, delay });
			return { unref() {} };
		}
	};
	const first = scheduleMinimalMeadowTerrainHydration(runtime, environment);
	const second = scheduleMinimalMeadowTerrainHydration(runtime, environment);
	assert.equal(first, second);
	assert.equal(starts, 0);
	assert.equal(timers.length, 1);
	assert.equal(timers[0].delay, 2500);
	timers[0].callback();
	assert.equal(starts, 1);
	assert.deepEqual(await runtime.terrainTexturePromise, { phase: 'ready' });
	timers[0].callback();
	assert.equal(starts, 1);
});

test('B"H destroyed runtime never begins deferred texture hydration', () => {
	let timer = null;
	let starts = 0;
	const runtime = {
		destroyed: true,
		terrain: {
			startTextureHydration() {
				starts += 1;
				return Promise.resolve();
			}
		}
	};
	scheduleMinimalMeadowTerrainHydration(runtime, {
		setTimeout(callback) {
			timer = callback;
			return { unref() {} };
		}
	});
	timer();
	assert.equal(starts, 0);
	assert.equal(runtime.terrainTexturePromise, undefined);
});
