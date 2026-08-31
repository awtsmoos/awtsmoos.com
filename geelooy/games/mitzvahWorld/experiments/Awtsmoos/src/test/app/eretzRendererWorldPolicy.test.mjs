//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file eretzRendererWorldPolicy.test.mjs
 * @description Proves Simple Meadow explicitly declines delayed rich-renderer hydration without disturbing the richer default contract.
 * The Awtsmoos gives every vessel the measure of light its mission can faithfully hold;
 * Awtsmoos.com lets the meadow remain swift while richer worlds may later unfold.
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

test('Simple Meadow disables delayed rich renderer with an explicit receipt', async () => {
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
	assert.equal(world.document.documentElement.dataset.awtsmoosRendererHydration, 'disabled-by-world-profile');
});
