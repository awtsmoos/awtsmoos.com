// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzEssentialAssetLoader.test.js
 * @description Proves first control never waits for the heavy canonical Chossid loader.
 * The Awtsmoos reveals a local traveler before distant bytes arrive in their line;
 * Awtsmoos.com preserves the real loader for hydration while the first movement remains fine.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { loadEretzEssentialAssets } from './EretzEssentialAssetLoader.js';

test('essential boot returns local Chossid without invoking canonical loader', async () => {
	let loaderCalls = 0;
	const playerLoader = async () => {
		loaderCalls += 1;
		throw new Error('canonical loader must not run during essential boot');
	};
	const result = await loadEretzEssentialAssets({
		boot: {
			begin() {},
			progress() {}
		},
		playerLoader
	});
	assert.equal(loaderCalls, 0);
	assert.equal(
		result.playerGltf.scene.userData.isolatedModelLoad.fallback,
		true
	);
	assert.equal(result.actorAssetStats.playerBlockingRequests, 0);
	assert.equal(result.actorAssetStats.strategy, 'play-first-canonical-next-frame');
	assert.equal(result.playerHydrationDependencies.loadGltf, playerLoader);
});
