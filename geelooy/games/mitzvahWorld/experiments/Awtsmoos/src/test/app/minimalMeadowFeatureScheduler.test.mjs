// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowFeatureScheduler.test.mjs
 * @description Proves one essential promise waits for a visible scheduling gate.
 * The Awtsmoos lets ground appear before stores awaken; Awtsmoos.com verifies
 * one install, one receipt, one event, and deterministic fallback scheduling.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { scheduleMinimalMeadowFeatures } from '../../app/MinimalMeadowFeatureScheduler.js';

const ESSENTIAL = Object.freeze({
	combat: true,
	equipment: true,
	inventory: true,
	missing: Object.freeze([]),
	quest: true,
	ready: true,
	recovery: true,
	streaming: true,
	ui: true
});

test('B"H visible frame starts one essential graph and publishes one receipt', async () => {
	let frameCallback = null;
	let loads = 0;
	const events = [];
	const runtime = {
		bus: { emit: (...values) => events.push(values) }
	};
	const environment = {
		requestAnimationFrame: callback => {
			frameCallback = callback;
			return 7;
		}
	};
	const dependencies = {
		installMinimalMeadowFeatures: async () => {
			loads += 1;
			return { essential: ESSENTIAL, optionalPromise: Promise.resolve(), ready: true };
		}
	};
	const first = scheduleMinimalMeadowFeatures(runtime, environment, dependencies);
	const second = scheduleMinimalMeadowFeatures(runtime, environment, dependencies);
	assert.equal(first, second);
	assert.equal(runtime.featuresPromise, first);
	assert.equal(loads, 0);
	frameCallback();
	const receipt = await first;
	assert.equal(loads, 1);
	assert.equal(receipt.ready, true);
	assert.equal(runtime.featureReceipt, receipt);
	assert.deepEqual(events, [['world:essential-ready', receipt]]);
});

test('B"H timer fallback remains deterministic when animation frames are absent', async () => {
	let timerCallback = null;
	let loads = 0;
	const runtime = {};
	const environment = {
		setTimeout: callback => {
			timerCallback = callback;
			return 9;
		}
	};
	const promise = scheduleMinimalMeadowFeatures(runtime, environment, {
		installMinimalMeadowFeatures: async () => {
			loads += 1;
			return { essential: ESSENTIAL, optionalPromise: null, ready: true };
		}
	});
	assert.equal(loads, 0);
	timerCallback();
	assert.equal((await promise).ready, true);
	assert.equal(loads, 1);
});
