// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file nonBlockingActorBoot.test.mjs
 * @description Proves movement never waits for canonical player or NPC GLB parsing.
 * The Awtsmoos reveals a playable local Chossid before the heavier garment arrives;
 * Awtsmoos.com opens canonical actor hydration only through an explicit idle gate.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { loadEretzActorAssets } from '../../app/EretzActorAssetLoader.js';
import { loadEretzAssets } from '../../app/EretzAssetLoader.js';

const CANONICAL_PLAYER = Object.freeze({
	animations: Object.freeze([{ duration: 1, name: 'stand_Armature' }]),
	scene: createScene(),
	userData: Object.freeze({ fallback: false })
});

test('first-frame actors make zero canonical network requests', async () => {
	let remoteRequests = 0;
	const assets = await loadEretzActorAssets({
		quality: 'low',
		remoteActorLoader: async () => {
			remoteRequests += 1;
			return null;
		},
		streamCanonicalActors: true
	});

	assert.equal(assets.actorAssetStats.playerBlockingRequests, 0);
	assert.equal(assets.actorAssetStats.strategy, 'procedural-first-explicit-idle-canonical-hydration');
	assert.equal(assets.playerGltf.userData.fallback, true);
	assert.ok(assets.npcGltfs.every(gltf => gltf.userData.fallback));
	assert.equal(assets.actorHydration.status, 'waiting-for-idle-start');
	assert.equal(remoteRequests, 0);
});

test('full assets resolve while textures and canonical actors remain dormant', async () => {
	const never = new Promise(() => {});
	const result = await loadEretzAssets({
		houseLoader: async () => ({ houseMaterialDegradation: [] }),
		quality: 'low',
		streamCanonicalActors: true,
		textureScheduler: () => ({ promise: never, status: 'waiting-for-gameplay' })
	});

	assert.equal(result.playerGltf.userData.fallback, true);
	assert.equal(result.assets.publicMaterialPolicy.blockingTextureRequests, 0);
	assert.equal(result.actorHydration.status, 'waiting-for-idle-start');
	assert.equal(result.assets.publicMaterialStreaming.promise, never);
});

test('explicit hydration starts after delay and idle gates', async () => {
	const callbacks = [];
	const remote = {
		npcGltfs: [],
		npcProfiles: [],
		playerGltf: CANONICAL_PLAYER
	};
	const assets = await loadEretzActorAssets({
		actorStreamingDelayMs: 0,
		environment: {
			requestIdleCallback(callback) {
				callbacks.push(callback);
			},
			setTimeout(callback) {
				callback();
			}
		},
		quality: 'low',
		remoteActorLoader: async () => remote,
		streamCanonicalActors: true
	});

	const promise = assets.actorHydration.start();
	assert.equal(assets.actorHydration.status, 'scheduled');
	assert.equal(callbacks.length, 1);
	callbacks.shift()();
	assert.equal(await promise, remote);
	assert.equal(assets.actorHydration.status, 'ready');
	assert.equal(assets.actorHydration.value.playerGltf, CANONICAL_PLAYER);
});

function createScene() {
	const scene = new Group();
	scene.name = 'canonical-player-test-scene';
	return scene;
}
