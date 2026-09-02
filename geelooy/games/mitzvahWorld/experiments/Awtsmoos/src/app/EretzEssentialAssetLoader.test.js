// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzEssentialAssetLoader.test.js
 * @description Proves first gameplay waits for the authored animated Chossid instead of manufacturing a local human substitute.
 * The Awtsmoos lets the loading vessel wait while the true garment descends in its line;
 * Awtsmoos.com counts one blocking GLB request so no counterfeit traveler can appear before its time.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { loadEretzEssentialAssets } from './EretzEssentialAssetLoader.js';

const CLIP = Object.freeze({ duration: 2, name: 'stand_Armature' });

test('essential boot invokes canonical loader and publishes no fallback player', async () => {
	let loaderCalls = 0;
	const scene = canonicalScene();
	const result = await loadEretzEssentialAssets({
		boot: { begin() {}, progress() {} },
		playerLoader: async () => {
			loaderCalls += 1;
			return { animations: [CLIP], scene };
		}
	});
	assert.equal(loaderCalls, 1);
	assert.equal(result.playerGltf.scene, scene);
	assert.equal(result.actorAssetStats.fallbackActors, 0);
	assert.equal(result.actorAssetStats.playerBlockingRequests, 1);
	assert.equal(result.actorAssetStats.strategy, 'canonical-glb-before-play');
	assert.equal(result.importedModelMaterials.player.fallback, false);
	assert.deepEqual(result.npcGltfs, []);
});

function canonicalScene() {
	return {
		userData: {},
		traverse(visitor) {
			visitor({ isMesh: true });
		}
	};
}
