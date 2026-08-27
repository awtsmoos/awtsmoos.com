// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowFeatureScheduler.test.mjs
 * @description Proves map-complete essentials resolve before rich hydration and survive rich failure.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	scheduleMinimalMeadowFeatures
} from '../../app/MinimalMeadowFeatureScheduler.js';

test('B"H essential readiness waits for the real minimap', async () => {
	const stages = [];
	const map = deferred();
	let richImports = 0;
	const runtime = runtimeLedger([]);
	const promise = scheduleMinimalMeadowFeatures(runtime, {}, {
		importer: () => {
			richImports += 1;
			return new Promise(() => {});
		},
		installMinimalMeadowBootstrapFeatures: () => bootstrapHandle(map.promise),
		timeline: timelineSpy(stages)
	});
	await Promise.resolve();
	assert.equal(runtime.featureStage, 'bootstrapping');
	assert.equal(richImports, 0);
	map.resolve({ diagnostics() { return { mounted: true }; } });
	const receipt = await promise;
	assert.equal(receipt.ready, true);
	assert.equal(receipt.minimap.status, 'ready');
	assert.equal(runtime.featureStage, 'ready');
	assert.equal(runtime.richFeatureStage, 'loading');
	assert.equal(richImports, 1);
	assert.deepEqual(stages.slice(0, 5), [
		'essential-bootstrap-start',
		'bootstrap-minimap-wait',
		'bootstrap-minimap-ready',
		'essential-bootstrap-installed',
		'rich-import-start'
	]);
});

test('B"H missing minimap fails essential readiness with stable evidence', async () => {
	const runtime = runtimeLedger([]);
	await assert.rejects(
		scheduleMinimalMeadowFeatures(runtime, {}, {
			installMinimalMeadowBootstrapFeatures: () => bootstrapHandle(Promise.resolve(null)),
			timeline: timelineSpy([])
		}),
		error => {
			assert.equal(error.code, 'MINIMAL_MEADOW_MINIMAP_UNAVAILABLE');
			assert.deepEqual(error.details.missing, ['minimap']);
			return true;
		}
	);
	assert.equal(runtime.featureStage, 'failed');
});

test('B"H rich failure preserves map-complete bootstrap play', async () => {
	const stages = [];
	const runtime = runtimeLedger([]);
	await scheduleMinimalMeadowFeatures(runtime, {}, {
		importer: async () => {
			throw new Error('rich boundary unavailable');
		},
		installMinimalMeadowBootstrapFeatures: () => bootstrapHandle(Promise.resolve({})),
		timeline: timelineSpy(stages)
	});
	const optionalReceipt = await runtime.optionalFeaturePromise;
	assert.equal(runtime.featureStage, 'ready');
	assert.equal(runtime.richFeatureStage, 'failed');
	assert.equal(optionalReceipt.bootstrapPreserved, true);
	assert.equal(stages.includes('rich-failed'), true);
});

function bootstrapHandle(minimapPromise) {
	return {
		diagnostics() { return { minimap: { pending: true } }; },
		essential: essential(false),
		readyPromise: Promise.resolve(minimapPromise).then(map => essential(Boolean(map))),
		destroy() {},
		resume() {},
		suspend() {}
	};
}

function essential(minimap) {
	return {
		combat: true,
		equipment: true,
		inventory: true,
		minimap,
		missing: minimap ? [] : ['minimap'],
		quest: true,
		ready: minimap,
		recovery: true,
		streaming: true,
		ui: true
	};
}

function deferred() {
	let resolve;
	const promise = new Promise(done => { resolve = done; });
	return { promise, resolve };
}

function runtimeLedger(events) {
	return { bus: { emit(name) { events.push(name); } } };
}

function timelineSpy(stages) {
	return { mark(stage) { stages.push(stage); } };
}
