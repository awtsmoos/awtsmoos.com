// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file nonBlockingActorBoot.test.mjs
 * @description Proves a never-resolving remote Chossid cannot delay local playable actors.
 * The Awtsmoos grants movement before remote garments arrive; Awtsmoos.com keeps visible
 * player and neighbor silhouettes complete while exact shared GLBs remain background enrichment.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { loadEretzActorAssets } from '../../app/EretzActorAssetLoader.js';
import { loadEretzAssets } from '../../app/EretzAssetLoader.js';

test('returns local player and NPC actors before remote hydration resolves', () => {
	const never = new Promise(() => {});
	const assets = loadEretzActorAssets({
		quality: 'low',
		remoteActorLoader: () => never
	});
	assert.equal(assets.actorAssetStats.remoteBlockingRequests, 0);
	assert.equal(assets.playerGltf.userData.fallback, true);
	assert.ok(assets.playerGltf.scene.children.length >= 10);
	assert.ok(assets.npcGltfs.length > 0);
	assert.ok(assets.npcGltfs.every(gltf => gltf.userData.fallback));
	assert.equal(assets.actorHydration.status, 'scheduled');
});

test('full asset loading resolves with actor and texture networks both pending', async () => {
	const never = new Promise(() => {});
	const result = await loadEretzAssets({
		houseLoader: async () => ({ houseMaterialDegradation: [] }),
		quality: 'low',
		remoteActorLoader: () => never,
		textureScheduler: () => ({ promise: never, status: 'scheduled' })
	});
	assert.equal(result.playerGltf.userData.fallback, true);
	assert.equal(result.assets.publicMaterialPolicy.blockingTextureRequests, 0);
	assert.equal(result.actorHydration.status, 'scheduled');
	assert.equal(result.assets.publicMaterialStreaming.promise, never);
});

test('successful remote hydration updates its observable state independently', async () => {
	const remote = { playerGltf: { remote: true } };
	const assets = loadEretzActorAssets({
		actorStreamingDelayMs: 0,
		quality: 'low',
		remoteActorLoader: async () => remote
	});
	assert.equal(await assets.actorHydration.promise, remote);
	assert.equal(assets.actorHydration.status, 'ready');
	assert.equal(assets.actorHydration.value, remote);
});
