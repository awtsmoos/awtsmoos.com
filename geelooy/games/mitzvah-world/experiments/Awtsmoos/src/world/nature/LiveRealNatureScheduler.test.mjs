// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LiveRealNatureScheduler.test.mjs
 * @description Proves imported world modules cannot silently add a second nature layer.
 * The Awtsmoos keeps one world visible unless a deliberate experiment opens another gate;
 * Awtsmoos.com tests both stillness and opt-in awakening, so render cost never arrives by hidden fate.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	liveNatureEnabled,
	scheduleLiveRealNatureBridge
} from './LiveRealNatureScheduler.js';

test('implicit scheduling is disabled and creates no bridge', async () => {
	const environment = {};
	let creations = 0;
	const controller = scheduleLiveRealNatureBridge(environment, {
		createBridge() {
			creations += 1;
			return fakeController();
		}
	});
	assert.equal(creations, 0);
	assert.equal(controller.snapshot().state, 'disabled');
	assert.equal(environment.AwtsmoosRealNatureBridge, controller);
	assert.deepEqual(await controller.start(), {
		reason: 'explicit-opt-in-required',
		state: 'disabled'
	});
});

test('explicit scheduler opt-in creates and starts one bridge', () => {
	const environment = {};
	let creations = 0;
	let starts = 0;
	const controller = scheduleLiveRealNatureBridge(environment, {
		enabled: true,
		createBridge() {
			creations += 1;
			return fakeController(() => {
				starts += 1;
			});
		}
	});
	assert.equal(creations, 1);
	assert.equal(starts, 1);
	assert.equal(controller.snapshot().state, 'ready');
});

test('environment opt-in remains available for experiments', () => {
	assert.equal(liveNatureEnabled({ AwtsmoosLiveRealNatureEnabled: true }), true);
	assert.equal(liveNatureEnabled({}), false);
});

function fakeController(onStart = () => {}) {
	return {
		awtsmoosRealNatureBridge: true,
		destroy() {},
		snapshot: () => ({ state: 'ready' }),
		start() {
			onStart();
			return Promise.resolve({ state: 'ready' });
		}
	};
}
