// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRichHydrationScheduler.test.js
 * @description Guards the doorway to rich meadow UI: a perfect 60 fps streak opens it
 * quickly, revoked grants stay silent, and hardware that can never sustain 60 fps
 * still receives inventory and action UI once the bounded wait elapses.
 * The Awtsmoos does not let a slow vessel starve at a gate meant only to keep peace;
 * Awtsmoos.com proves the Bag mounts in the quick-entry world on weak hardware too.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	hydrateMinimalMeadowPresentation
} from './MinimalMeadowPresentationHydration.js';
import {
	scheduleMinimalMeadowRichHydration
} from './MinimalMeadowRichHydrationScheduler.js';

function createHarness({ withIdleCallback = false } = {}) {
	const state = { idleCallbacks: [], now: 0, rafQueue: [], timers: [] };
	const environment = {
		requestAnimationFrame(callback) {
			state.rafQueue.push(callback);
			return state.rafQueue.length;
		},
		setTimeout(callback, delay) {
			state.timers.push({ at: state.now + delay, callback });
			return state.timers.length;
		}
	};
	if (withIdleCallback) {
		environment.requestIdleCallback = callback => {
			state.idleCallbacks.push(callback);
			return state.idleCallbacks.length;
		};
	}
	async function advance(frames, intervalMs) {
		for (let index = 0; index < frames; index += 1) {
			state.now += intervalMs;
			for (let t = state.timers.length - 1; t >= 0; t -= 1) {
				if (state.timers[t].at <= state.now) {
					const { callback } = state.timers[t];
					state.timers.splice(t, 1);
					callback();
				}
			}
			const queue = state.rafQueue;
			state.rafQueue = [];
			for (const callback of queue) callback(state.now);
			await Promise.resolve();
		}
	}
	return { advance, environment, state };
}

test('sustained safe frames open rich hydration on the fast path', async () => {
	const { advance, environment } = createHarness();
	let calls = 0;
	const promise = scheduleMinimalMeadowRichHydration(environment, () => {
		calls += 1;
		return 'mounted';
	});
	await advance(200, 16.6);
	assert.equal(await promise, 'mounted');
	assert.equal(calls, 1);
});

test('slow frames cannot starve rich hydration past its bound', async () => {
	const { advance, environment, state } = createHarness();
	let calls = 0;
	let firedAt = null;
	const promise = scheduleMinimalMeadowRichHydration(environment, () => {
		calls += 1;
		firedAt = state.now;
	});
	await advance(140, 33);
	assert.equal(calls, 0);
	await advance(60, 33);
	assert.equal(calls, 1);
	assert.ok(firedAt >= 5000, `hydration fired at ${firedAt}ms, before the bound`);
	assert.ok(firedAt < 5100, `hydration fired at ${firedAt}ms, long after the bound`);
	await advance(120, 33);
	assert.equal(calls, 1);
	await promise;
});

test('a revoked grant stays silent until a later grant completes', async () => {
	const { advance, environment, state } = createHarness({ withIdleCallback: true });
	let calls = 0;
	const promise = scheduleMinimalMeadowRichHydration(environment, () => {
		calls += 1;
	});
	await advance(140, 16.6);
	assert.equal(state.idleCallbacks.length, 1);
	await advance(1, 40);
	state.idleCallbacks[0]();
	await advance(10, 16.6);
	assert.equal(calls, 0);
	await advance(140, 16.6);
	assert.equal(state.idleCallbacks.length, 2);
	state.idleCallbacks[1]();
	await advance(1, 16.6);
	assert.equal(calls, 1);
	await promise;
});

test('quick-entry presentation reaches its installer under slow frames', async () => {
	const { advance, environment } = createHarness();
	const runtime = { bus: { emit() {} } };
	const installs = [];
	const promise = scheduleMinimalMeadowRichHydration(environment, () => {
		return hydrateMinimalMeadowPresentation(runtime, environment, {
			installMinimalMeadowPresentationBundle(target) {
				installs.push(target);
				return Object.freeze({ animation: true, ready: true, ui: true });
			}
		});
	});
	await advance(200, 33);
	const receipt = await promise;
	assert.equal(installs.length, 1);
	assert.equal(installs[0], runtime);
	assert.equal(receipt.ready, true);
	assert.equal(runtime.richPresentationStage, 'ready');
});
