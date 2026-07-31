// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowFeatureScheduler.test.mjs
 * @description Proves immediate bootstrap readiness and atomic background rich-feature handoff.
 * The Awtsmoos opens the road without a paint gate while fuller garments approach;
 * Awtsmoos.com verifies one promise, one receipt, uninterrupted play, cleanup, and failure preservation.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	scheduleMinimalMeadowFeatures
} from '../../app/MinimalMeadowFeatureScheduler.js';

const ESSENTIAL = Object.freeze({
	animation: true,
	combat: true,
	equipment: true,
	inventory: true,
	missing: Object.freeze([]),
	quest: true,
	ready: true,
	recovery: true,
	streaming: true,
	ui: true,
	world: true
});

test('B"H bootstrap remains active until rich hydration succeeds', async () => {
	const events = [];
	const state = lifecycleState();
	let resolveRich;
	const richGate = new Promise(resolve => {
		resolveRich = resolve;
	});
	const runtime = {
		bus: { emit: (...values) => events.push(values) }
	};
	const dependencies = dependenciesFor(state, async () => richGate);
	const first = scheduleMinimalMeadowFeatures(runtime, {}, dependencies);
	const second = scheduleMinimalMeadowFeatures(runtime, {}, dependencies);
	assert.equal(first, second);
	const receipt = await first;
	assert.equal(receipt.ready, true);
	assert.equal(runtime.featureStage, 'ready');
	assert.equal(state.bootstrapInstalls, 1);
	assert.equal(state.suspends, 0);
	assert.equal(state.destroys, 0);
	assert.equal(events[0][0], 'world:essential-ready');
	resolveRich({ ready: true });
	const richReceipt = await runtime.optionalFeaturePromise;
	assert.equal(richReceipt.ready, true);
	assert.equal(runtime.richFeatureStage, 'ready');
	assert.equal(state.suspends, 1);
	assert.equal(state.destroys, 1);
});

test('B"H failed rich hydration preserves uninterrupted bootstrap play', async () => {
	const events = [];
	const state = lifecycleState();
	const runtime = {
		bus: { emit: (...values) => events.push(values) }
	};
	const dependencies = dependenciesFor(state, async () => {
		throw new Error('RICH_INSTALL_FAILED');
	});
	const receipt = await scheduleMinimalMeadowFeatures(
		runtime,
		{},
		dependencies
	);
	assert.equal(receipt.ready, true);
	const richReceipt = await runtime.optionalFeaturePromise;
	assert.equal(richReceipt.ready, false);
	assert.equal(richReceipt.bootstrapPreserved, true);
	assert.equal(runtime.richFeatureStage, 'failed');
	assert.equal(state.suspends, 0);
	assert.equal(state.resumes, 0);
	assert.equal(state.destroys, 0);
	assert.equal(events.at(-1)[0], 'world:rich-features-failed');
});

function dependenciesFor(state, installRich) {
	return {
		installMinimalMeadowBootstrapFeatures() {
			state.bootstrapInstalls += 1;
			return {
				destroy() {
					state.destroys += 1;
				},
				essential: ESSENTIAL,
				resume() {
					state.resumes += 1;
				},
				suspend() {
					state.suspends += 1;
				}
			};
		},
		installMinimalMeadowFeatures: installRich
	};
}

function lifecycleState() {
	return {
		bootstrapInstalls: 0,
		destroys: 0,
		resumes: 0,
		suspends: 0
	};
}
