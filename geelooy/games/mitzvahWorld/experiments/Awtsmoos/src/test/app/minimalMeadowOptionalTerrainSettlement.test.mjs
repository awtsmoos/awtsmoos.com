// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowOptionalTerrainSettlement.test.mjs
 * @description Proves optional readiness remains pending until deferred terrain hydration settles.
 * The Awtsmoos lets earth awaken after the quiet window without calling unfinished pixels complete;
 * Awtsmoos.com verifies six fulfilled branches, exact waiting, receipt publication, and no failures.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	hydrateMinimalMeadowOptionalFeatures
} from '../../app/MinimalMeadowOptionalHydration.js';

test('B"H optional readiness waits for terrain settlement', async () => {
	const terrain = deferred();
	const runtime = runtimeFixture(terrain.promise);
	let settled = false;
	const promise = hydrateMinimalMeadowOptionalFeatures(runtime, {}, {
		handoffPromise: Promise.resolve({ ready: true }),
		modules: optionalModules()
	});
	promise.then(() => { settled = true; });
	await Promise.resolve();
	await Promise.resolve();
	assert.equal(settled, false);
	terrain.resolve({ phase: 'ready' });
	const receipt = await promise;
	assert.equal(receipt.ready, true);
	assert.deepEqual(receipt.failures, []);
	assert.deepEqual(receipt.results, Array(6).fill('fulfilled'));
	assert.equal(runtime.optionalFeatureReceipt, receipt);
});

function runtimeFixture(terrainPromise) {
	return {
		bus: { emit() {} },
		richWorldPromise: Promise.resolve({ ready: true }),
		terrainTextureSchedule: {
			promise: terrainPromise,
			started: true
		}
	};
}

function optionalModules() {
	return {
		awaitMinimalMeadowVisualStability: async () => ({ ready: true }),
		enhanceMinimalMeadowRenderer: async () => ({ ready: true }),
		hydrateMinimalMeadowPlayer: async () => ({ ready: true }),
		installMinimalMeadowFriendlyNpcs: async () => ({ ready: true })
	};
}

function deferred() {
	let resolve;
	const promise = new Promise(value => { resolve = value; });
	return { promise, resolve };
}
