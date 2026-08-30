// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file essentialAssetBoundary.test.mjs
 * @description Proves first control receives a local Chossid with zero blocking model requests while canonical actors and rich materials remain explicitly post-play.
 * The Awtsmoos gives the traveler form before ornament and motion before the distant garment arrives;
 * Awtsmoos.com preserves the later loader behind a computed door, so first play stays light while richer identity remains alive.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { loadEretzEssentialAssets } from '../../app/EretzEssentialAssetLoader.js';

const APP_URL = new URL('../../app/', import.meta.url);
const source = file => readFile(new URL(file, APP_URL), 'utf8');

test('essential loader opens control with a local Chossid and preserves canonical hydration dependency', async () => {
	const progress = [];
	const canonicalScene = new Group();
	const playerLoader = async () => ({
		animations: [],
		scene: canonicalScene,
		userData: { fallback: false }
	});
	const loaded = await loadEretzEssentialAssets({
		boot: {
			begin: phase => progress.push(['begin', phase]),
			progress: (...detail) => progress.push(['progress', ...detail])
		},
		playerLoader
	});
	assert.notEqual(loaded.playerGltf.scene, canonicalScene);
	assert.equal(loaded.actorAssetStats.playerBlockingRequests, 0);
	assert.equal(loaded.importedModelMaterials.player.fallback, true);
	assert.equal(loaded.assets.terrainMixImage, null);
	assert.equal(loaded.assets.publicMaterialStreaming.status, 'waiting-for-gameplay');
	assert.equal(loaded.playerHydrationDependencies.loadGltf, playerLoader);
	assert.ok(progress.some(item => item.includes('essential-local-player')));
});

test('essential first-wave source contains no rich catalog imports', async () => {
	const [loader, record, foundation] = await Promise.all([
		source('EretzEssentialAssetLoader.js'),
		source('EretzEssentialAssetRecord.js'),
		source('EretzWorldFoundation.js')
	]);
	const firstWave = [loader, record].join('\n');
	assert.doesNotMatch(firstWave, /HouseAssets|FriendlyNpcProfiles|AdventureCatalog|TextureCatalog|RuntimeMaterialManifest/);
	assert.match(foundation, /EretzEssentialAssetLoader\.js/);
	assert.doesNotMatch(foundation, /EretzAssetLoader\.js/);
});

test('rich catalogs remain behind explicit computed hydration start methods', async () => {
	const [hydration, urls] = await Promise.all([
		source('EretzEssentialHydrationState.js'),
		source('EretzEssentialHydrationUrls.js')
	]);
	assert.match(hydration, /createDeferredHydrationState/);
	assert.match(hydration, /import\(moduleUrl\)/);
	assert.doesNotMatch(hydration, /import\(['"]\.\/EretzAssetLoader\.js/);
	assert.doesNotMatch(hydration, /import\(['"]\.\/EretzActorAssetLoader\.js/);
	assert.match(urls, /EretzAssetLoader\.js/);
	assert.match(urls, /EretzActorAssetLoader\.js/);
	assert.match(urls, /FriendlyNpcProfiles\.js/);
	assert.match(urls, /resolveDeferredAppModuleUrl/);
});
