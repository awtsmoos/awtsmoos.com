// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowTerrainHydrationSchedule.test.mjs
 * @description Proves optional texture decoding begins once after the protected gameplay minute.
 * The Awtsmoos lets movement, battle, quests, and UI breathe before heavier garments arrive;
 * Awtsmoos.com verifies quiet delay, idle settlement, duplicate scheduling, and teardown truth.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { gameplayQuietWindowPolicy } from '../../app/GameplayQuietWindow.js';
import {
	scheduleMinimalMeadowTerrainHydration
} from '../../app/MinimalMeadowTerrainHydrationSchedule.js';

test('B"H terrain hydration waits for quiet and idle timers exactly once', async () => {
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
	const environment = queuedTimers(timers);
	const first = scheduleMinimalMeadowTerrainHydration(runtime, environment);
	const second = scheduleMinimalMeadowTerrainHydration(runtime, environment);
	assert.equal(first, second);
	assert.equal(starts, 0);
	assert.equal(timers.length, 1);
	assert.equal(timers[0].delay, gameplayQuietWindowPolicy().delayMilliseconds);
	timers.shift().callback();
	assert.equal(starts, 0);
	assert.equal(timers[0].delay, 250);
	const idleCallback = timers.shift().callback;
	idleCallback();
	await first.promise;
	assert.equal(starts, 1);
	assert.deepEqual(await runtime.terrainTexturePromise, { phase: 'ready' });
	idleCallback();
	assert.equal(starts, 1);
});

test('B"H destroyed runtime never begins deferred texture hydration', async () => {
	const timers = [];
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
	const schedule = scheduleMinimalMeadowTerrainHydration(
		runtime,
		queuedTimers(timers)
	);
	timers.shift().callback();
	timers.shift().callback();
	await schedule.promise;
	assert.equal(starts, 0);
	assert.equal(runtime.terrainTexturePromise, undefined);
});

function queuedTimers(timers) {
	return {
		setTimeout(callback, delay) {
			timers.push({ callback, delay });
			return { unref() {} };
		}
	};
}
