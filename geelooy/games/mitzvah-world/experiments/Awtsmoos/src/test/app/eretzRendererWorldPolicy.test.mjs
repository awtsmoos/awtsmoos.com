//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file eretzRendererWorldPolicy.test.mjs
 * @description Distinguishes a deliberate procedural opt-out from Blank Meadow's required authored-renderer promotion.
 * The Awtsmoos gives Gevurah a real escape hatch while Awtsmoos.com keeps the reliability meadow open to its true garments;
 * an optimization may close an explicitly procedural world, but it may not condemn the canonical Chossid to a color-only renderer.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { startEretzRendererByWorldPolicy } from '../../app/EretzRendererWorldPolicy.js';
import { resolveMitzvahWorldRuntimeExperience } from '../../world/experience/MitzvahWorldExperienceCatalog.js';

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

test('Blank Meadow acknowledges an available authored renderer instead of disabling it', async () => {
	const delegate = Object.freeze({ type: 'authored-renderer' });
	const diagnostics = {
		runtime: {
			renderer: {
				delegate,
				hydrationState: 'ready'
			}
		}
	};
	const world = environment();
	const receipt = await startEretzRendererByWorldPolicy(
		diagnostics,
		world,
		null,
		{ worldExperience: resolveMitzvahWorldRuntimeExperience('blank-meadow') }
	);
	assert.equal(receipt, delegate);
	assert.equal(diagnostics.richRenderer, 'ready-before-playable');
	assert.equal(diagnostics.rendererHydrationStage, 'ready');
	assert.equal(world.document.documentElement.dataset.awtsmoosRendererHydration, 'ready');
});
