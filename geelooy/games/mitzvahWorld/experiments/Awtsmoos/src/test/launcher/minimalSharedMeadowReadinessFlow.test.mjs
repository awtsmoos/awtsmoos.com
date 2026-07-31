// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalSharedMeadowReadinessFlow.test.mjs
 * @description Proves bootstrap vessels settle before playable state while rich work remains optional.
 * The Awtsmoos orders promise before proclamation and keeps distant beauty free to grow;
 * Awtsmoos.com verifies the six mechanics exist before the loading veil may go.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	runMinimalSharedMeadowReadiness
} from '../../launcher/MinimalSharedMeadowReadinessFlow.js';

test('B"H readiness awaits bootstrap and ignores unresolved rich hydration', async () => {
	const order = [];
	const optionalPromise = new Promise(() => {});
	const runtime = coreRuntime();
	const diagnostics = {
		rendererHydrationPromise: Promise.resolve(null),
		runtime
	};
	diagnostics.featuresPromise = Promise.resolve().then(() => {
		installBootstrap(runtime);
		order.push('bootstrap-settled');
		return readyFeatureReceipt(optionalPromise);
	});
	const root = {
		dataset: {},
		setAttribute() {}
	};
	const receipt = await runMinimalSharedMeadowReadiness({
		diagnostics,
		documentValue: { documentElement: root },
		environment: immediatePaintEnvironment(),
		loading: loadingLedger(order)
	});
	assert.deepEqual(order.slice(0, 2), ['bootstrap-settled', 'loading-finished']);
	assert.equal(receipt.essential.ready, true);
	assert.equal(receipt.essential.optionalPending, true);
	assert.equal(root.dataset.awtsmoosRuntimeState, 'playable');
	assert.equal(diagnostics.featureSettlement.receipt.optionalPromise, optionalPromise);
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
	runtime.combat = {};
	runtime.equipment = {};
	runtime.inventoryStore = {};
	runtime.questStore = {};
	runtime.recovery = {};
	runtime.expansion.streaming = {};
	runtime.optionalFeaturePromise = Promise.resolve(null);
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
		finish() {
			order.push('loading-finished');
		},
		stage() {},
		world() {}
	};
}
