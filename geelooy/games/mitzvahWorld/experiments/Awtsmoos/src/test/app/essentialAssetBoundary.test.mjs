// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file essentialAssetBoundary.test.mjs
 * @description Proves boot loads one real local player while rich catalogs remain deferred.
 * The Awtsmoos grants the traveler a true garment before ornament; Awtsmoos.com keeps later worlds lazy.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { loadEretzEssentialAssets } from '../../app/EretzEssentialAssetLoader.js';

const APP_URL = new URL('../../app/', import.meta.url);
const source = file => readFile(new URL(file, APP_URL), 'utf8');

test('essential loader requests one verified Chossid and preserves null-safe contracts', async () => {
	const progress = [];
	const scene = new Group();
	scene.userData.isolatedModelLoad = { resolvedUrl: '/games/mitzvahWorld/assets/models/player/test/chossid.glb' };
	const loaded = await loadEretzEssentialAssets({
		boot: {
			begin: phase => progress.push(['begin', phase]),
			progress: (...detail) => progress.push(['progress', ...detail])
		},
		playerLoader: async () => ({ animations: [], scene, userData: { fallback: false } })
	});
	assert.equal(loaded.playerGltf.scene, scene);
	assert.equal(loaded.actorAssetStats.playerBlockingRequests, 1);
	assert.equal(loaded.importedModelMaterials.player.fallback, false);
	assert.equal(loaded.assets.terrainMixImage, null);
	assert.equal(loaded.assets.publicMaterialStreaming.status, 'waiting-for-gameplay');
	assert.ok(progress.some(item => item.includes('essential-local-player')));
});

test('essential first-wave source contains no rich catalog imports', async () => {
	const [loader, record, foundation] = await Promise.all([
		source('EretzEssentialAssetLoader.js'),
		source('EretzEssentialAssetRecord.js'),
		source('EretzWorldFoundation.js')
	]);
	const firstWave = [loader, record].join(String.fromCharCode(10));
	assert.doesNotMatch(firstWave, /HouseAssets|FriendlyNpcProfiles|AdventureCatalog|TextureCatalog|RuntimeMaterialManifest/);
	assert.match(foundation, /EretzEssentialAssetLoader\.js/);
	assert.doesNotMatch(foundation, /EretzAssetLoader\.js/);
});

test('rich catalogs remain behind explicit hydration start methods', async () => {
	const hydration = await source('EretzEssentialHydrationState.js');
	assert.match(hydration, /start\(\)/);
	assert.match(hydration, /import\(\s*'\.\/EretzAssetLoader\.js/);
	assert.match(hydration, /import\(\s*'\.\/EretzActorAssetLoader\.js/);
});
