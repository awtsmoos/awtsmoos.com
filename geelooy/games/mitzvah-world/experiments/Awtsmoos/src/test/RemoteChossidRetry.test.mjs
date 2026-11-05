// B"H
// Boruch Hashem
// Blessed is He

/** @file RemoteChossidRetry.test.mjs @description Keeps transient actor failures recoverable. */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Scene } from '../../../light-three-gltf/tiny-runtime.js';
import { RemoteChossidPopulation } from '../network/RemoteChossidPopulation.js';

test('remote actor failures use bounded backoff and reset when the peer leaves', async () => {
	let calls = 0;
	let now = 100;
	const population = new RemoteChossidPopulation({
		ground: {},
		loadGltf: async () => {
			calls += 1;
			throw new Error('temporary actor fetch failure');
		},
		localPlayerId: 'local',
		now: () => now,
		retryBaseDelayMs: 50,
		scene: new Scene()
	});
	const peer = { connected: true, displayName: 'Peer', id: 'peer' };
	const previousWarn = console.warn;
	console.warn = () => {};
	try {
		population.sync([peer]);
		await settleSpawn();
		assert.equal(calls, 1);
		assert.equal(population.failures.get('peer').attempts, 1);
		population.sync([peer]);
		await settleSpawn();
		assert.equal(calls, 1, 'backoff prevents a request on every world snapshot');
		now += 50;
		population.sync([peer]);
		await settleSpawn();
		assert.equal(calls, 2);
		assert.equal(population.failures.get('peer').attempts, 2);
		population.sync([]);
		assert.equal(population.failures.has('peer'), false);
		population.sync([peer]);
		await settleSpawn();
		assert.equal(calls, 3, 'a disconnect and rejoin retries immediately');
	} finally {
		console.warn = previousWarn;
		population.dispose();
	}
});

function settleSpawn() {
	return new Promise(resolve => setTimeout(resolve, 0));
}
