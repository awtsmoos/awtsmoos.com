// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file essentialAssetBoundary.test.mjs
 * @description Proves the first-wave asset boundary blocks on the real animated Chossid while heavy NPC/catalog work stays deferred.
 * The Awtsmoos lets one necessary human garment become essential without dragging every village catalog into the gate;
 * Awtsmoos.com keeps first play truthful and bounded, so loading ends only when the visible traveler is real in state.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { loadEretzEssentialAssets } from '../../app/EretzEssentialAssetLoader.js';

const APP_URL = new URL('../../app/', import.meta.url);
const source = file => readFile(new URL(file, APP_URL), 'utf8');

function playerGltf() {
	return {
		animations: [{ duration: 1, name: 'stand_Armature' }],
		scene: { userData: {}, traverse(visitor) { visitor({ isSkinnedMesh: true }); } }
	};
}

test('essential loader blocks on canonical player and records GLB-only policy', async () => {
	let calls = 0;
	const canonical = playerGltf();
	const loaded = await loadEretzEssentialAssets({
		boot: { begin() {}, progress() {} },
		playerLoader: async () => {
			calls += 1;
			return canonical;
		}
	});
	assert.equal(calls, 1);
	assert.equal(loaded.playerGltf, canonical);
	assert.equal(loaded.actorAssetStats.playerBlockingRequests, 1);
	assert.equal(loaded.importedModelMaterials.player.fallback, false);
	assert.equal(loaded.assets.terrainMixImage, null);
});

test('first-wave source keeps distant NPC and rich catalogs out of the player gate', async () => {
	const loader = await source('EretzEssentialAssetLoader.js');
	assert.doesNotMatch(loader, /HouseAssets|FriendlyNpcProfiles|AdventureCatalog|TextureCatalog/);
	assert.match(loader, /EretzEssentialPlayerGlb/);
});
