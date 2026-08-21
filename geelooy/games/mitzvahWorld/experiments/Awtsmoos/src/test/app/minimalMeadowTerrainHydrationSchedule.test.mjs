// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowTerrainHydrationSchedule.test.mjs
 * @description Proves terrain bitmap decoding is disabled by default and remains explicit opt-in.
 * The Awtsmoos lets gameplay breathe without a delayed image storm;
 * Awtsmoos.com preserves the experiment doorway while procedural earth remains the normal form.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { gameplayQuietWindowPolicy } from '../../app/GameplayQuietWindow.js';
import { scheduleMinimalMeadowTerrainHydration } from '../../app/MinimalMeadowTerrainHydrationSchedule.js';

test('B"H default terrain hydration schedules no timers and decodes no images', async () => {
	const timers = [];
	let starts = 0;
	const runtime = runtimeFixture(() => {
		starts += 1;
		return Promise.resolve({ phase: 'ready' });
	});
	const first = scheduleMinimalMeadowTerrainHydration(runtime, queuedTimers(timers));
	const second = scheduleMinimalMeadowTerrainHydration(runtime, queuedTimers(timers));
	assert.equal(first, second);
	assert.equal(first.status, 'disabled-procedural-default');
	assert.equal(timers.length, 0);
	assert.equal(starts, 0);
	assert.deepEqual(await first.promise, { phase: 'disabled-procedural-default' });
});

test('B"H explicit opt-in waits for quiet and idle timers exactly once', async () => {
	const timers = [];
	let starts = 0;
	const runtime = runtimeFixture(() => {
		starts += 1;
		return Promise.resolve({ phase: 'ready' });
	});
	runtime.terrainTextureHydrationEnabled = true;
	const schedule = scheduleMinimalMeadowTerrainHydration(runtime, queuedTimers(timers));
	assert.equal(timers.length, 1);
	assert.equal(timers[0].delay, gameplayQuietWindowPolicy().delayMilliseconds);
	timers.shift().callback();
	assert.equal(timers[0].delay, 250);
	const idleCallback = timers.shift().callback;
	idleCallback();
	await schedule.promise;
	assert.equal(starts, 1);
	assert.deepEqual(await runtime.terrainTexturePromise, { phase: 'ready' });
	idleCallback();
	assert.equal(starts, 1);
});

test('B"H destroyed opt-in runtime never begins deferred hydration', async () => {
	const timers = [];
	let starts = 0;
	const runtime = runtimeFixture(() => {
		starts += 1;
		return Promise.resolve();
	});
	runtime.destroyed = true;
	runtime.terrainTextureHydrationEnabled = true;
	const schedule = scheduleMinimalMeadowTerrainHydration(runtime, queuedTimers(timers));
	timers.shift().callback();
	timers.shift().callback();
	await schedule.promise;
	assert.equal(starts, 0);
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
