// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowFeatureBundleStaging.test.mjs
 * @description Proves the tiny bundle returns before presentation, world, or optional quality settles.
 * The Awtsmoos lets every complete garment begin without standing in the doorway;
 * Awtsmoos.com verifies parallel starts, immediate receipt, promise identity, and eventual completeness.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	installMinimalMeadowFeatures
} from '../../app/MinimalMeadowFeatureBundle.js';

test('B"H bundle returns immediately while all full-quality branches continue', async () => {
	const gates = gateSet();
	const runtime = runtimeFixture();
	const receipt = installMinimalMeadowFeatures(runtime, {}, {
		hydrateOptional: async () => gates.optional.promise,
		hydratePresentation: async () => gates.presentation.promise,
		installWorldSystems: async () => gates.world.promise
	});
	assert.equal(receipt.ready, true);
	assert.equal(receipt.essential.ready, true);
	assert.equal(runtime.richPresentationPromise, receipt.presentationPromise);
	assert.equal(runtime.optionalFeaturePromise, receipt.optionalPromise);
	let settled = false;
	receipt.handoffPromise.then(() => { settled = true; });
	await Promise.resolve();
	assert.equal(settled, false);
	gates.presentation.resolve({ ready: true });
	gates.world.resolve({ ready: true });
	gates.optional.resolve({ ready: true });
	assert.deepEqual(await receipt.presentationPromise, { ready: true });
	assert.deepEqual(await receipt.handoffPromise, { ready: true });
	assert.deepEqual(await receipt.optionalPromise, { ready: true });
});

function runtimeFixture() {
	return {
		combat: {},
		equipment: {},
		expansion: { streaming: {} },
		inventoryStore: {},
		questStore: {},
		recovery: {},
		scene: {},
		state: {},
		ui: {}
	};
}

function gateSet() {
	return {
		optional: deferred(),
		presentation: deferred(),
		world: deferred()
	};
}

function deferred() {
	let resolve;
	const promise = new Promise(value => { resolve = value; });
	return { promise, resolve };
}
