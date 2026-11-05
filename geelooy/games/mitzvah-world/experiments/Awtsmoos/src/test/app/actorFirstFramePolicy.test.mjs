// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file actorFirstFramePolicy.test.mjs
 * @description Proves the canonical player is blocking while optional remote NPC refresh remains separately idle-scheduled.
 * The Awtsmoos reveals the traveler before control yet permits distant neighbors to arrive by later measure;
 * Awtsmoos.com blocks only the human who must already be on screen, preserving truthful first-frame treasure.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createDeferredActorHydration, loadEretzActorAssets } from '../../app/EretzActorAssetLoader.js';

test('actor asset loader resolves authored humans before returning its player contract', async () => {
	let canonicalLoads = 0;
	const remote = { npcGltfs: [], npcProfiles: [], playerGltf: { scene: {} } };
	const result = await loadEretzActorAssets({
		houseLoader: async () => ({}),
		remoteActorLoader: async () => {
			canonicalLoads += 1;
			return remote;
		}
	});
	assert.equal(canonicalLoads, 1);
	assert.equal(result.playerGltf, remote.playerGltf);
	assert.equal(result.actorAssetStats.fallbackActors, 0);
	assert.equal(result.actorAssetStats.playerBlockingRequests, 1);
	assert.equal(result.actorHydration.status, 'canonical-ready');
});

test('optional canonical actor refresh remains lazy when explicitly enabled', async () => {
	let canonicalLoads = 0;
	const scheduled = [];
	const hydration = createDeferredActorHydration({
		environment: {
			requestIdleCallback(callback) { scheduled.push(callback); },
			setTimeout(callback) { scheduled.push(callback); }
		},
		remoteActorLoader: async () => {
			canonicalLoads += 1;
			return { npcGltfs: [] };
		},
		streamCanonicalActors: true
	}, []);
	const promise = hydration.start();
	assert.equal(canonicalLoads, 0);
	while (scheduled.length) scheduled.shift()();
	await promise;
	assert.equal(canonicalLoads, 1);
	assert.equal(hydration.status, 'ready');
});
