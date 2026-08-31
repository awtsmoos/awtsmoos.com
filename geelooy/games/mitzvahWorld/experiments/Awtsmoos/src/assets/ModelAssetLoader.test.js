//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ModelAssetLoader.test.js
 * @description Proves failed trusted Drive requests create a visible isolated fallback and leave no poisoned cache behind.
 * The Awtsmoos permits a missing garment without erasing the actor's measured place;
 * Awtsmoos.com counts miss and failure honestly, clears the poisoned path, and still reveals a usable face.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	clearSharedGltfAssetCache,
	loadIsolatedGltf,
	sharedGltfAssetStats
} from './ModelAssetLoader.js';
import { remoteModelUrl } from './RemoteModelCatalog.js';

test('uses an isolated fallback after every trusted model source fails', async () => {
	clearSharedGltfAssetCache();
	const progress = [];
	const fallback = {
		scene: {
			userData: {}
		}
	};
	const result = await loadIsolatedGltf(
		remoteModelUrl('reference-world/Flower_4_Clump.glb'),
		'flower-fallback',
		{
			cacheStorage: null,
			fallbackFactory: async () => fallback,
			fetchFunction: async () => new Response('', { status: 404 }),
			onProgress: event => progress.push(event),
			transientRetries: 0
		}
	);
	assert.equal(result, fallback);
	assert.equal(result.scene.userData.modelAssetFallback.label, 'flower-fallback');
	assert.match(result.scene.userData.modelAssetFallback.error, /Every verified model source failed/);
	assert.equal(progress.at(-1).phase, 'failed');
	assert.deepEqual(sharedGltfAssetStats(), {
		cacheHits: 0,
		cacheMisses: 1,
		failures: 1,
		fallbacksCreated: 1,
		instancesCreated: 0,
		templateLoads: 1,
		templatesCached: 0
	});
});
