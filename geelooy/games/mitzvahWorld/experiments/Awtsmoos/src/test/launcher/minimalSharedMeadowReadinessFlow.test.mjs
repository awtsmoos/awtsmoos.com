// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalSharedMeadowReadinessFlow.test.mjs
 * @description Proves loader dismissal and playable publication from the same world-loading predecessor production uses.
 * The Awtsmoos lets Awtsmoos.com open one truthful gate: painted world, grounded traveler, live collision,
 * camera and control first; then the veil departs; only afterward may the public playable word unfold.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { runMinimalSharedMeadowReadiness } from '../../launcher/MinimalSharedMeadowReadinessFlow.js';
import {
	fakeDocument,
	readyFeatureReceipt,
	readyRuntime,
	webGlRenderer
} from '../app/RendererReadinessTestHarness.mjs';
import { prepareMitzvahWorldWorldLoading } from './MitzvahWorldBootStateTestHarness.mjs';

test('loader dismissal is verified before playable publication', async () => {
	const order = [];
	const documentValue = fakeDocument();
	const environment = immediatePaintEnvironment(order);
	prepareMitzvahWorldWorldLoading(environment, documentValue);
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
	const receipt = await runMinimalSharedMeadowReadiness({
		diagnostics,
		documentValue,
		environment,
		loading: loadingLedger(order, documentValue)
	});
	assert.deepEqual(order.slice(0, 4), [
		'features-ready', 'paint', 'paint', 'loading-finished'
	]);
	assert.equal(receipt.essential.ready, true);
	assert.equal(receipt.playable.overlay.ready, true);
	assert.equal(documentValue.overlay.hidden, true);
	assert.equal(documentValue.overlay.dataset.loadingComplete, 'true');
	assert.equal(documentValue.documentElement.dataset.awtsmoosRuntimeState, 'playable');
	assert.ok(receipt.fullPromise instanceof Promise);
});

test('structural failure never dismisses the loader', async () => {
	const order = [];
	const documentValue = fakeDocument();
	const environment = immediatePaintEnvironment(order);
	prepareMitzvahWorldWorldLoading(environment, documentValue);
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
			documentValue,
			environment,
			loading: loadingLedger(order, documentValue)
		}),
		/MINIMAL_MEADOW_NOT_PLAYABLE:bootstrap-player/
	);
	assert.equal(order.includes('loading-finished'), false);
	assert.notEqual(documentValue.documentElement.dataset.awtsmoosRuntimeState, 'playable');
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

function loadingLedger(order, documentValue) {
	return {
		finish() {
			order.push('loading-finished');
			documentValue.overlay.hidden = true;
			documentValue.overlay.setAttribute('aria-hidden', 'true');
			documentValue.overlay.dataset.loadingComplete = 'true';
		},
		stage() {},
		world() {}
	};
}
