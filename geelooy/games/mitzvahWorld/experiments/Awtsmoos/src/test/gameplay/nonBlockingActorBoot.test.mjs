// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file nonBlockingActorBoot.test.mjs
 * @description Proves the canonical player loads first while optional enrichment remains deferred.
 * The Awtsmoos reveals the living Chossid before distant garments; Awtsmoos.com blocks only on
 * one exact player model and never lets NPC copies, extra animation, or texture networks delay it.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { loadEretzActorAssets } from '../../app/EretzActorAssetLoader.js';
import { loadEretzAssets } from '../../app/EretzAssetLoader.js';

const PLAYER_GLTF = Object.freeze({
	animations: Object.freeze([{ name: 'neutral_Armature' }]),
	scene: createScene(),
	userData: Object.freeze({ fallback: false })
});

test('awaits one canonical player and defers every NPC network request', async () => {
	const never = new Promise(() => {});
	const assets = await loadEretzActorAssets({
		playerActorLoader: async () => PLAYER_GLTF,
		quality: 'low',
		remoteActorLoader: () => never
	});
	assert.equal(assets.actorAssetStats.playerBlockingRequests, 1);
	assert.equal(assets.actorAssetStats.strategy, 'canonical-player-first-deferred-npc-enrichment');
	assert.equal(assets.playerGltf, PLAYER_GLTF);
	assert.equal(assets.playerGltf.userData.fallback, false);
	assert.ok(assets.npcGltfs.length > 0);
	assert.ok(assets.npcGltfs.every(gltf => gltf.userData.fallback));
	assert.equal(assets.actorHydration.status, 'scheduled');
});

test('full assets resolve after player readiness while textures and NPCs remain pending', async () => {
	const never = new Promise(() => {});
	const result = await loadEretzAssets({
		houseLoader: async () => ({ houseMaterialDegradation: [] }),
		playerActorLoader: async () => PLAYER_GLTF,
		quality: 'low',
		remoteActorLoader: () => never,
		textureScheduler: () => ({ promise: never, status: 'scheduled' })
	});
	assert.equal(result.playerGltf, PLAYER_GLTF);
	assert.equal(result.assets.publicMaterialPolicy.blockingTextureRequests, 0);
	assert.equal(result.actorHydration.status, 'scheduled');
	assert.equal(result.assets.publicMaterialStreaming.promise, never);
});

test('successful deferred hydration contains NPC enrichment without another player', async () => {
	const remote = { npcGltfs: [], npcProfiles: [] };
	const assets = await loadEretzActorAssets({
		actorStreamingDelayMs: 0,
		playerActorLoader: async () => PLAYER_GLTF,
		quality: 'low',
		remoteActorLoader: async () => remote
	});
	assert.equal(await assets.actorHydration.promise, remote);
	assert.equal(assets.actorHydration.status, 'ready');
	assert.equal(assets.actorHydration.value, remote);
	assert.equal('playerGltf' in remote, false);
});

function createScene() {
	const scene = new Group();
	scene.name = 'canonical-player-test-scene';
	return scene;
}
