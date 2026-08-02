// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalSharedMeadowReadinessFlow.test.mjs
 * @description Proves playable readiness returns while full renderer and optional beauty remain pending.
 * The Awtsmoos opens the near road before distant garments finish descending;
 * Awtsmoos.com verifies essential mechanics, loading release, paint, and continuing full-quality truth.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	runMinimalSharedMeadowReadiness
} from '../../launcher/MinimalSharedMeadowReadinessFlow.js';

test('B"H readiness publishes play without awaiting full renderer settlement', async () => {
	const order = [];
	const optionalPromise = new Promise(() => {});
	const rendererPromise = new Promise(() => {});
	const runtime = coreRuntime();
	const diagnostics = {
		rendererHydrationPromise: rendererPromise,
		runtime
	};
	diagnostics.featuresPromise = Promise.resolve().then(() => {
		installBootstrap(runtime);
		order.push('bootstrap-settled');
		return readyFeatureReceipt(optionalPromise);
	});
	const root = { dataset: {}, setAttribute() {} };
	const receipt = await runMinimalSharedMeadowReadiness({
		diagnostics,
		documentValue: { documentElement: root },
		environment: immediatePaintEnvironment(),
		loading: loadingLedger(order)
	});
	assert.deepEqual(order.slice(0, 2), [
		'bootstrap-settled',
		'loading-finished'
	]);
	assert.equal(receipt.essential.ready, true);
	assert.equal(receipt.essential.optionalPending, true);
	assert.ok(receipt.fullPromise instanceof Promise);
	assert.equal(diagnostics.fullReadinessPromise, receipt.fullPromise);
	assert.equal(root.dataset.awtsmoosRuntimeState, 'playable');
	assert.equal(
		diagnostics.featureSettlement.receipt.optionalPromise,
		optionalPromise
	);
});

function coreRuntime() {
	return {
		camera: {},
		expansion: {},
		ground: {},
		input: {},
		model: {},
		renderer: null,
		terrain: {
			textureHydration: {
				diagnostics: () => ({ phase: 'deferred' })
			}
		}
	};
}

function installBootstrap(runtime) {
	Object.assign(runtime, {
		combat: {},
		equipment: {},
		inventoryStore: {},
		optionalFeaturePromise: Promise.resolve(null),
		questStore: {},
		recovery: {}
	});
	runtime.expansion.streaming = {};
}

function readyFeatureReceipt(optionalPromise) {
	const ready = Object.freeze({ status: 'ready' });
	return Object.freeze({
		combat: ready,
		equipment: ready,
		inventory: ready,
		optionalPromise,
		quest: ready,
		ready: true,
		recovery: ready,
		streaming: ready,
		ui: ready
	});
}

function immediatePaintEnvironment() {
	return {
		clearTimeout,
		requestAnimationFrame(callback) {
			callback();
			return 1;
		},
		setTimeout
	};
}

function loadingLedger(order) {
	return {
		finish() { order.push('loading-finished'); },
		stage() {},
		world() {}
	};
}
