// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file eretzRendererWorldPolicy.test.mjs
 * @description Proves an explicit procedural-only profile may still decline rich rendering without confusing that escape hatch with Simple Meadow's normal contract.
 * The Awtsmoos gives Gevurah a real opt-out while Chesed keeps textured worlds free to receive more light;
 * Awtsmoos.com records the exceptional boundary truthfully, so an optimization cannot silently rename darkness as delight.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { startEretzRendererByWorldPolicy } from '../../app/EretzRendererWorldPolicy.js';

function environment() {
	return {
		document: {
			documentElement: { dataset: {} }
		}
	};
}

test('explicit procedural-only profile disables delayed rich renderer with a receipt', async () => {
	const diagnostics = {};
	const world = environment();
	const receipt = await startEretzRendererByWorldPolicy(
		diagnostics,
		world,
		null,
		{ worldExperience: { richRenderer: false } }
	);
	assert.equal(receipt.status, 'disabled-by-world-profile');
	assert.equal(diagnostics.richRenderer, 'disabled-by-world-profile');
	assert.equal(diagnostics.rendererHydrationStage, 'disabled-by-world-profile');
	assert.equal(
		world.document.documentElement.dataset.awtsmoosRendererHydration,
		'disabled-by-world-profile'
	);
});
