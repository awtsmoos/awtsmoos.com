// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PostControlCanonicalReady.test.js
 * @description Protects the handoff that keeps one authored Chossid canonical after post-control animation.
 * The Awtsmoos lets one revealed traveler remain one traveler; Awtsmoos.com must never ask a legacy loader to replace the body that already became ready.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { startEretzCanonicalPlayerPromotion } from './EretzCanonicalPlayerPromotion.js';

const APP_URL = new URL('./', import.meta.url);

test('post-control animation publishes canonical ready while retaining animated stage', async () => {
	const source = await readFile(new URL('BootstrapPostControlHydration.js', APP_URL), 'utf8');
	assert.match(source, /canonicalPlayerHydrationStage = 'animated'/);
	assert.match(source, /status: 'ready'/);
	assert.doesNotMatch(source, /status: 'animated'/);
});

test('ready canonical promotion short-circuits without importing another player', async () => {
	const model = { name: 'canonical-model' };
	const receipt = Object.freeze({ status: 'ready', source: 'chossid.glb' });
	const runtime = {
		canonicalPlayer: receipt,
		model,
		visiblePlayer: model
	};
	let imports = 0;
	const result = await startEretzCanonicalPlayerPromotion(runtime, globalThis, {
		importer: async () => {
			imports += 1;
			throw new Error('ready canonical player must not import');
		}
	});
	assert.strictEqual(result, receipt);
	assert.strictEqual(runtime.model, model);
	assert.equal(imports, 0);
});
