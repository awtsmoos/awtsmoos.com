// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createDeferredActorHydration,
	loadEretzActorAssets
} from '../../app/EretzActorAssetLoader.js';

test('first-frame actor assets never invoke the canonical GLB loader', async () => {
	let canonicalLoads = 0;
	const result = await loadEretzActorAssets({
		houseLoader: async () => ({}),
		remoteActorLoader: async () => {
			canonicalLoads += 1;
			return null;
		}
	});
	assert.equal(canonicalLoads, 0);
	assert.equal(result.playerGltf.scene.userData.isolatedModelLoad.fallback, true);
	assert.equal(result.actorAssetStats.playerBlockingRequests, 0);
	assert.equal(result.actorHydration.status, 'fallback-stable');
});

test('canonical actor hydration remains lazy even when explicitly enabled', async () => {
	let canonicalLoads = 0;
	const scheduled = [];
	const environment = {
		requestIdleCallback(callback) { scheduled.push(callback); },
		setTimeout(callback) { scheduled.push(callback); }
	};
	const hydration = createDeferredActorHydration({
		environment,
		remoteActorLoader: async () => {
			canonicalLoads += 1;
			return { playerGltf: null };
		},
		streamCanonicalActors: true
	}, []);
	assert.equal(canonicalLoads, 0);
	const promise = hydration.start();
	assert.equal(canonicalLoads, 0);
	assert.equal(scheduled.length, 1);
	scheduled.shift()();
	assert.equal(scheduled.length, 1);
	scheduled.shift()();
	await promise;
	assert.equal(canonicalLoads, 1);
	assert.equal(hydration.status, 'ready');
});
