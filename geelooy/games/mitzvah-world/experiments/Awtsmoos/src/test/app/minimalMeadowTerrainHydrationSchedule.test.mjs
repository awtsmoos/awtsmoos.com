// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowTerrainHydrationSchedule.test.mjs
 * @description Proves authored terrain textures are the default post-playable destination while explicit policy may still preserve procedural fallback.
 * The Awtsmoos lets movement arrive before bitmap work, then clothes the earth after a guarded breath;
 * Awtsmoos.com keeps the fast doorway open without sentencing the living ground to flat color until death.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { POST_PLAYABLE_VISUAL_DELAY_MILLISECONDS } from '../../app/PostPlayableVisualTiming.js';
import { scheduleMinimalMeadowTerrainHydration } from '../../app/MinimalMeadowTerrainHydrationSchedule.js';

test('B"H default terrain hydration begins once after the shared visual quiet window', async () => {
	const timers = [];
	let starts = 0;
	const runtime = runtimeFixture(() => {
		starts += 1;
		return Promise.resolve({ phase: 'ready' });
	});
	const environment = queuedTimers(timers);
	const first = scheduleMinimalMeadowTerrainHydration(runtime, environment);
	const second = scheduleMinimalMeadowTerrainHydration(runtime, environment);
	assert.equal(first, second);
	assert.equal(first.status, 'scheduled');
	assert.equal(timers.length, 1);
	assert.equal(timers[0].delay, POST_PLAYABLE_VISUAL_DELAY_MILLISECONDS);
	timers.shift().callback();
	assert.equal(timers[0].delay, 250);
	const idleCallback = timers.shift().callback;
	idleCallback();
	await first.promise;
	assert.equal(starts, 1);
	assert.equal(first.status, 'ready');
	assert.deepEqual(await runtime.terrainTexturePromise, { phase: 'ready' });
	idleCallback();
	assert.equal(starts, 1);
});

test('B"H explicit texture opt-out schedules no timers and reports its policy truthfully', async () => {
	const timers = [];
	let starts = 0;
	const runtime = runtimeFixture(() => {
		starts += 1;
		return Promise.resolve({ phase: 'ready' });
	});
	runtime.terrainTextureHydrationEnabled = false;
	const schedule = scheduleMinimalMeadowTerrainHydration(runtime, queuedTimers(timers));
	assert.equal(schedule.status, 'disabled-by-explicit-policy');
	assert.equal(timers.length, 0);
	assert.equal(starts, 0);
	assert.deepEqual(await schedule.promise, { phase: 'disabled-by-explicit-policy' });
});

test('B"H destroyed runtime never begins deferred texture hydration', async () => {
	const timers = [];
	let starts = 0;
	const runtime = runtimeFixture(() => {
		starts += 1;
		return Promise.resolve();
	});
	runtime.destroyed = true;
	const schedule = scheduleMinimalMeadowTerrainHydration(runtime, queuedTimers(timers));
	timers.shift().callback();
	timers.shift().callback();
	await schedule.promise;
	assert.equal(starts, 0);
	assert.equal(schedule.status, 'cancelled');
	assert.equal(runtime.terrainTexturePromise, undefined);
});

function runtimeFixture(startTextureHydration) {
	return { terrain: { startTextureHydration } };
}

function queuedTimers(timers) {
	return {
		setTimeout(callback, delay) {
			timers.push({ callback, delay });
			return { unref() {} };
		}
	};
}
