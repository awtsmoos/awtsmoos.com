//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MainMenuWebGlPrewarm.test.js
 * @description Proves menu-time GPU warmup waits for a paint, uses the exact canonical WebGL attributes, and records failure without counterfeiting readiness.
 * The Awtsmoos gives Awtsmoos.com one real canvas and one truthful receipt; the chooser may awaken the context early,
 * but only a genuine browser WebGL vessel may ever be called ready beneath the same living light.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	MAIN_MENU_WEBGL_CONTEXT_OPTIONS,
	scheduleMainMenuWebGlPrewarm
} from './MainMenuWebGlPrewarm.js';

function harness(contextFactory = () => ({})) {
	const frames = [];
	const tasks = [];
	const calls = [];
	let now = 100;
	const environment = {
		performance: { now: () => now += 5 },
		requestAnimationFrame: callback => frames.push(callback),
		setTimeout: callback => tasks.push(callback)
	};
	const canvas = {
		getContext(type, options) {
			calls.push({ options, type });
			return contextFactory();
		}
	};
	return { calls, canvas, environment, frames, tasks };
}

test('prewarm waits for paint/task and opens exact renderer WebGL context', () => {
	const setup = harness();
	const receipt = scheduleMainMenuWebGlPrewarm(setup.canvas, setup.environment);
	assert.equal(receipt.status, 'scheduled');
	assert.equal(setup.calls.length, 0);
	assert.equal(setup.frames.length, 1);
	setup.frames.shift()(0);
	assert.equal(setup.calls.length, 0);
	assert.equal(setup.tasks.length, 1);
	setup.tasks.shift()();
	assert.equal(setup.calls.length, 1);
	assert.equal(setup.calls[0].type, 'webgl');
	assert.deepEqual(setup.calls[0].options, MAIN_MENU_WEBGL_CONTEXT_OPTIONS);
	assert.equal(receipt.status, 'ready');
	assert.equal(receipt.contextReady, true);
	assert.ok(receipt.durationMs >= 0);
});

test('prewarm is idempotent while scheduled or ready', () => {
	const setup = harness();
	const first = scheduleMainMenuWebGlPrewarm(setup.canvas, setup.environment);
	const second = scheduleMainMenuWebGlPrewarm(setup.canvas, setup.environment);
	assert.equal(second, first);
	assert.equal(setup.frames.length, 1);
	setup.frames.shift()(0);
	setup.tasks.shift()();
	const third = scheduleMainMenuWebGlPrewarm(setup.canvas, setup.environment);
	assert.equal(third, first);
	assert.equal(setup.calls.length, 1);
});

test('prewarm records unavailable or throwing WebGL without claiming readiness', () => {
	const unavailable = harness(() => null);
	const unavailableReceipt = scheduleMainMenuWebGlPrewarm(unavailable.canvas, unavailable.environment);
	unavailable.frames.shift()(0);
	unavailable.tasks.shift()();
	assert.equal(unavailableReceipt.status, 'unavailable');
	assert.equal(unavailableReceipt.contextReady, false);
	assert.match(unavailableReceipt.error, /required WebGL context/i);

	const failing = harness(() => { throw new Error('GPU denied'); });
	const failingReceipt = scheduleMainMenuWebGlPrewarm(failing.canvas, failing.environment);
	failing.frames.shift()(0);
	failing.tasks.shift()();
	assert.equal(failingReceipt.status, 'failed');
	assert.equal(failingReceipt.contextReady, false);
	assert.equal(failingReceipt.error, 'GPU denied');
});
