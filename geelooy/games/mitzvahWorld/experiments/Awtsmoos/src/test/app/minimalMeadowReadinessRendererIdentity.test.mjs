// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowReadinessRendererIdentity.test.mjs
 * @description Proves playable readiness is impossible without WebGL and publishes only verified WebGL identity when every essential vessel is ready.
 * The Awtsmoos refuses a false doorway before the playable word can shine;
 * Awtsmoos.com leaves optional hydration detached while the required renderer guards the line.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { awaitMinimalMeadowReadiness } from '../../launcher/MinimalMeadowReadiness.js';
import {
	diagnosticsWith,
	fakeDocument,
	loadingPresenter,
	webGlRenderer
} from './RendererReadinessTestHarness.mjs';

test('B"H non-WebGL renderer fails closed before gameplay publication', async () => {
	const documentValue = fakeDocument();
	const diagnostics = diagnosticsWith({
		backend: 'other',
		contextName: 'none',
		render() {}
	});
	await assert.rejects(
		awaitMinimalMeadowReadiness(
			diagnostics,
			loadingPresenter(),
			documentValue
		),
		/MINIMAL_MEADOW_NOT_PLAYABLE:webgl-renderer/
	);
	assert.notEqual(documentValue.documentElement.dataset.awtsmoosGameplay, 'true');
	assert.notEqual(documentValue.documentElement.dataset.awtsmoosRuntimeState, 'playable');
});

test('B"H WebGL readiness publishes playable identity without invoking optional hydration', async () => {
	let hydrations = 0;
	const documentValue = fakeDocument();
	const diagnostics = diagnosticsWith(webGlRenderer(async () => {
		hydrations += 1;
		return { ready: true };
	}));
	const receipt = await awaitMinimalMeadowReadiness(
		diagnostics,
		loadingPresenter(),
		documentValue
	);
	const dataset = documentValue.documentElement.dataset;
	assert.equal(receipt.ready, true);
	assert.equal(dataset.awtsmoosRuntimeState, 'playable');
	assert.equal(dataset.awtsmoosGameplay, 'true');
	assert.equal(dataset.awtsmoosRenderer, 'webgl');
	assert.equal(dataset.awtsmoosRendererHydration, 'idle');
	assert.equal(dataset.awtsmoosRendererContextAttempts, 'webgl');
	assert.equal(hydrations, 0);
});

test('B"H malformed feature receipts still fail closed', async () => {
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
