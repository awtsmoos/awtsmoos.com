// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowReadinessRendererIdentity.test.mjs
 * @description Proves playable readiness publishes current renderer identity only.
 * The Awtsmoos reveals the finite renderer carrying the first playable frame;
 * Awtsmoos.com leaves optional hydration detached from essential gameplay truth.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { awaitMinimalMeadowReadiness } from '../../launcher/MinimalMeadowReadiness.js';
import {
	diagnosticsWith,
	fakeDocument,
	fallbackRenderer,
	loadingPresenter,
	webGlRenderer
} from './RendererReadinessTestHarness.mjs';

test('B"H fallback readiness publishes honest Canvas2D identity', async () => {
	const documentValue = fakeDocument();
	const loading = loadingPresenter();
	const diagnostics = diagnosticsWith(fallbackRenderer());
	const receipt = await awaitMinimalMeadowReadiness(
		diagnostics,
		loading,
		documentValue
	);
	const dataset = documentValue.documentElement.dataset;
	assert.equal(receipt.ready, true);
	assert.equal(dataset.awtsmoosRuntimeState, 'playable');
	assert.equal(dataset.awtsmoosGameplay, 'true');
	assert.equal(dataset.awtsmoosRenderer, 'canvas-2d-fallback');
	assert.equal(dataset.awtsmoosRendererHydration, 'fallback-2d');
	assert.equal(dataset.awtsmoosRendererFallback, 'webgl-unavailable');
	assert.equal(dataset.awtsmoosRendererContextAttempts, 'webgl');
	assert.equal(loading.stages.at(-1)[0], 'ready');
});

test('B"H WebGL readiness does not invoke optional hydration', async () => {
	let hydrations = 0;
	const documentValue = fakeDocument();
	const diagnostics = diagnosticsWith(webGlRenderer(async () => {
		hydrations += 1;
		return { ready: true };
	}));
	await awaitMinimalMeadowReadiness(
		diagnostics,
		loadingPresenter(),
		documentValue
	);
	const dataset = documentValue.documentElement.dataset;
	assert.equal(dataset.awtsmoosRuntimeState, 'playable');
	assert.equal(dataset.awtsmoosRenderer, 'webgl');
	assert.equal(dataset.awtsmoosRendererHydration, 'idle');
	assert.equal(dataset.awtsmoosRendererContextAttempts, 'webgl');
	assert.equal(hydrations, 0);
});

test('B"H malformed feature receipts fail closed without throwing TypeError', async () => {
	const diagnostics = diagnosticsWith(webGlRenderer(), { ready: true });
	await assert.rejects(
		awaitMinimalMeadowReadiness(
			diagnostics,
			loadingPresenter(),
			fakeDocument()
		),
		/MINIMAL_MEADOW_NOT_PLAYABLE:feature-receipt/
	);
});
