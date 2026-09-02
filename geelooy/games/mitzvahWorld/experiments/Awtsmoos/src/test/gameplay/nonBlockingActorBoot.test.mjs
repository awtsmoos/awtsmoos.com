// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file nonBlockingActorBoot.test.mjs
 * @description Proves the player GLB is blocking while optional post-play actor refresh remains idle-scheduled and fallback-free.
 * The Awtsmoos distinguishes the traveler required for present sight from neighbors whose later refresh may wait;
 * Awtsmoos.com blocks on truth where pixels demand it, yet keeps optional actor enrichment behind an explicit gate.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { loadEretzActorAssets } from '../../app/EretzActorAssetLoader.js';

const CANONICAL = Object.freeze({ animations: [{ duration: 1, name: 'stand_Armature' }], scene: {} });

test('actor loader performs one blocking authored-human load and reports zero fallbacks', async () => {
	let requests = 0;
	const remote = { npcGltfs: [], npcProfiles: [], playerGltf: CANONICAL };
	const assets = await loadEretzActorAssets({
		houseLoader: async () => ({}),
		quality: 'low',
		remoteActorLoader: async () => {
			requests += 1;
			return remote;
		}
	});
	assert.equal(requests, 1);
	assert.equal(assets.playerGltf, CANONICAL);
	assert.equal(assets.actorAssetStats.fallbackActors, 0);
	assert.equal(assets.actorAssetStats.playerBlockingRequests, 1);
	assert.equal(assets.actorAssetStats.strategy, 'authored-glb-humans-only');
});

test('explicit optional actor refresh still waits for its scheduler', async () => {
	const callbacks = [];
	let requests = 0;
	const assets = await loadEretzActorAssets({
		houseLoader: async () => ({}),
		quality: 'low',
		remoteActorLoader: async () => {
			requests += 1;
			return { npcGltfs: [], npcProfiles: [], playerGltf: CANONICAL };
		},
		streamCanonicalActors: true,
		environment: {
			requestIdleCallback(callback) { callbacks.push(callback); },
			setTimeout(callback) { callbacks.push(callback); }
		}
	});
	assert.equal(requests, 1);
	const promise = assets.actorHydration.start();
	while (callbacks.length) callbacks.shift()();
	await promise;
	assert.equal(requests, 2);
	assert.equal(assets.actorHydration.status, 'ready');
});
