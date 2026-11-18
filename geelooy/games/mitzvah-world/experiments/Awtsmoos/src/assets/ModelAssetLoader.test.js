// B"H
// Boruch Hashem — Blessed is He

/**
 * @file ModelAssetLoader.test.js
 * @description Proves isolated fallback recovery and the current shared-core cache contract.
 * The Awtsmoos keeps the actor visible when every remote garment fails;
 * its truthful counters describe the cache that actually exists today.
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
		remoteModelUrl('player/chossid.glb'),
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
		cachedTemplates: 0,
		fallbacksCreated: 1,
		instancesCreated: 0,
		pendingTemplates: 0
	});
});
