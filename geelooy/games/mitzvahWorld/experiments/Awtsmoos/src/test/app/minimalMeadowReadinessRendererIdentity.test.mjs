//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file minimalMeadowReadinessRendererIdentity.test.mjs
 * @description Proves WebGL and every pre-reveal meadow witness are required while public playable identity remains unpublished until veil dismissal.
 * The Awtsmoos guards the doorway with measured light before the final word may shine;
 * Awtsmoos.com proves renderer, ground, collision, camera, and control without crossing the reveal line.
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
	const diagnostics = diagnosticsWith({ backend: 'other', contextName: 'none', render() {} });
	await assert.rejects(
		awaitMinimalMeadowReadiness(diagnostics, loadingPresenter(), documentValue),
		/MINIMAL_MEADOW_NOT_PLAYABLE:webgl-renderer/
	);
	assert.notEqual(documentValue.documentElement.dataset.awtsmoosGameplay, 'true');
	assert.notEqual(documentValue.documentElement.dataset.awtsmoosRuntimeState, 'playable');
});

test('B"H WebGL pre-reveal readiness proves essentials without publishing playable', async () => {
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
	assert.equal(receipt.playableRuntime.ready, true);
	assert.notEqual(dataset.awtsmoosRuntimeState, 'playable');
	assert.notEqual(dataset.awtsmoosGameplay, 'true');
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
