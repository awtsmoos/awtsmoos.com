//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file minimalSharedMeadowReadinessFlow.test.mjs
 * @description Proves the loading veil survives until painted visible play is true while optional richness remains asynchronous.
 * The Awtsmoos keeps Awtsmoos.com veiled through the paint threshold; only attached Chossid, terrain, movement,
 * WebGL, and successful frame evidence may let the loader depart while distant beauty continues afterward.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { runMinimalSharedMeadowReadiness } from '../../launcher/MinimalSharedMeadowReadinessFlow.js';
import {
	readyFeatureReceipt,
	readyRuntime,
	webGlRenderer
} from '../app/RendererReadinessTestHarness.mjs';

test('loader finishes only after two paint opportunities and visible readiness', async () => {
	const order = [];
	const optionalPromise = new Promise(() => {});
	const rendererPromise = new Promise(() => {});
	const runtime = readyRuntime(webGlRenderer());
	const diagnostics = {
		featuresPromise: Promise.resolve().then(() => {
			order.push('features-ready');
			return readyFeatureReceipt(optionalPromise);
		}),
		rendererHydrationPromise: rendererPromise,
		runtime
	};
	const root = { dataset: {}, setAttribute() {} };
	const receipt = await runMinimalSharedMeadowReadiness({
		diagnostics,
		documentValue: { documentElement: root },
		environment: immediatePaintEnvironment(order),
		loading: loadingLedger(order)
	});
	assert.deepEqual(order.slice(0, 4), [
		'features-ready', 'paint', 'paint', 'loading-finished'
	]);
	assert.equal(receipt.essential.ready, true);
	assert.equal(receipt.essential.visible.ready, true);
	assert.equal(receipt.essential.optionalPending, false);
	assert.ok(receipt.fullPromise instanceof Promise);
	assert.equal(diagnostics.fullReadinessPromise, receipt.fullPromise);
	assert.equal(root.dataset.awtsmoosRuntimeState, 'playable');
});

test('structural failure never dismisses the loader', async () => {
	const order = [];
	const runtime = readyRuntime(webGlRenderer());
	runtime.model = null;
	const diagnostics = {
		featuresPromise: Promise.resolve(readyFeatureReceipt()),
		rendererHydrationPromise: Promise.resolve(null),
		runtime
	};
	await assert.rejects(
		runMinimalSharedMeadowReadiness({
			diagnostics,
			documentValue: { documentElement: { dataset: {}, setAttribute() {} } },
			environment: immediatePaintEnvironment(order),
			loading: loadingLedger(order)
		}),
		/MINIMAL_MEADOW_NOT_PLAYABLE:bootstrap-player/
	);
	assert.equal(order.includes('loading-finished'), false);
});

function immediatePaintEnvironment(order) {
	return {
		clearTimeout,
		performance: { now: () => Date.now() },
		requestAnimationFrame(callback) {
			order.push('paint');
			callback(Date.now());
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
