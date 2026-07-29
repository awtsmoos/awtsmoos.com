// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowReadinessRendererIdentity.test.mjs
 * @description Proves final background settlement preserves renderer backend and hydration identity.
 * The Awtsmoos releases the playable vessel before optional garments finish; Awtsmoos.com
 * separately verifies fallback, bootstrap, rich, and degraded truth after full readiness.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	awaitMinimalMeadowReadiness
} from '../../launcher/MinimalMeadowReadiness.js';
import {
	diagnosticsWith,
	fakeDocument,
	fakeEnvironment,
	fallbackRenderer,
	loadingPresenter,
	webGlRenderer
} from './RendererReadinessTestHarness.mjs';

test('B"H fallback settlement preserves Canvas2D backend identity', async () => {
	const documentValue = fakeDocument();
	const diagnostics = diagnosticsWith(fallbackRenderer());
	await awaitMinimalMeadowReadiness(
		diagnostics,
		loadingPresenter(),
		documentValue,
		fakeEnvironment()
	);
	assert.equal(documentValue.documentElement.dataset.awtsmoosReadiness, 'playable');
	await diagnostics.fullReadinessPromise;
	const dataset = documentValue.documentElement.dataset;
	assert.equal(dataset.awtsmoosRenderer, 'canvas-2d-fallback');
	assert.equal(dataset.awtsmoosRendererStage, 'fallback-ready');
	assert.equal(dataset.awtsmoosRendererHydration, 'fallback-2d');
	assert.equal(dataset.awtsmoosRendererFallback, 'webgl-unavailable');
	assert.equal(dataset.awtsmoosReadiness, 'ready');
	assert.equal(diagnostics.readinessReceipt.paintedFrames, 2);
});

test('B"H rich settlement keeps WebGL backend and records rich stage', async () => {
	const documentValue = fakeDocument();
	const renderer = webGlRenderer(() => Promise.resolve({ ready: true }));
	const diagnostics = diagnosticsWith(renderer);
	await awaitMinimalMeadowReadiness(
		diagnostics,
		loadingPresenter(),
		documentValue,
		fakeEnvironment()
	);
	await diagnostics.fullReadinessPromise;
	const dataset = documentValue.documentElement.dataset;
	assert.equal(dataset.awtsmoosRenderer, 'webgl');
	assert.equal(dataset.awtsmoosRendererStage, 'rich-ready');
	assert.equal(dataset.awtsmoosRendererHydration, 'ready');
	assert.equal(dataset.awtsmoosRendererFallback, '');
	assert.equal(dataset.awtsmoosRendererContextAttempts, 'webgl');
	assert.equal(dataset.awtsmoosReadiness, 'ready');
});

test('B"H hydration failure degrades only after background settlement', async () => {
	const documentValue = fakeDocument();
	const renderer = webGlRenderer(() => {
		return Promise.reject(new Error('shader hydration failed'));
	});
	const diagnostics = diagnosticsWith(renderer);
	const environment = fakeEnvironment();
	await awaitMinimalMeadowReadiness(
		diagnostics,
		loadingPresenter(),
		documentValue,
		environment
	);
	assert.equal(documentValue.documentElement.dataset.awtsmoosReadiness, 'playable');
	await diagnostics.fullReadinessPromise;
	const dataset = documentValue.documentElement.dataset;
	assert.equal(dataset.awtsmoosRenderer, 'webgl');
	assert.equal(dataset.awtsmoosRendererStage, 'bootstrap-degraded');
	assert.equal(dataset.awtsmoosRendererHydration, 'degraded');
	assert.equal(dataset.awtsmoosReadiness, 'degraded-ready');
	assert.equal(diagnostics.runtime.rendererHydrationError, 'shader hydration failed');
	assert.equal(environment.warnings.length, 1);
});
