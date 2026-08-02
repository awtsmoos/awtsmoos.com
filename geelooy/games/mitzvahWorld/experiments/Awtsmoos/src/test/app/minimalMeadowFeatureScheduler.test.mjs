// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowFeatureScheduler.test.mjs
 * @description Proves essential readiness resolves while the rich module boundary remains pending.
 * The Awtsmoos grants the traveler six usable vessels before distant garments arrive;
 * Awtsmoos.com keeps optional beauty from holding essential play captive.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	scheduleMinimalMeadowFeatures
} from '../../app/MinimalMeadowFeatureScheduler.js';

test('B"H essential receipt resolves before the rich importer', async () => {
	const events = [];
	const runtime = {
		bus: {
			emit(name) {
				events.push(name);
			}
		}
	};
	const neverSettlingImport = new Promise(() => {});
	const receipt = await scheduleMinimalMeadowFeatures(
		runtime,
		{},
		{
			importer: () => neverSettlingImport,
			installMinimalMeadowBootstrapFeatures: () => bootstrapHandle()
		}
	);
	assert.equal(receipt.ready, true);
	assert.equal(runtime.featureStage, 'ready');
	assert.equal(runtime.richFeatureStage, 'loading');
	assert.equal(runtime.optionalFeaturePromise instanceof Promise, true);
	assert.deepEqual(events, ['world:essential-ready']);
});

test('B"H rich failure preserves bootstrap play', async () => {
	const runtime = { bus: { emit() {} } };
	await scheduleMinimalMeadowFeatures(runtime, {}, {
		importer: async () => {
			throw new Error('rich boundary unavailable');
		},
		installMinimalMeadowBootstrapFeatures: () => bootstrapHandle()
	});
	const optionalReceipt = await runtime.optionalFeaturePromise;
	assert.equal(runtime.featureStage, 'ready');
	assert.equal(runtime.richFeatureStage, 'failed');
	assert.equal(optionalReceipt.bootstrapPreserved, true);
});

function bootstrapHandle() {
	const ready = true;
	return {
		destroy() {},
		essential: {
			combat: ready,
			equipment: ready,
			inventory: ready,
			missing: [],
			quest: ready,
			ready,
			recovery: ready,
			streaming: ready,
			ui: ready
		},
		suspend() {}
	};
}
