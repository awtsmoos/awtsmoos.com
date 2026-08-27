// B"H
// Boruch Hashem
// Blessed is He

/**
 * Browser-independent integration proof using Node's real BroadcastChannel implementation.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { LocalTabRealtimeClient } from '../network/LocalTabRealtimeClient.js';

test('two independent tab contexts discover and replicate exact state over BroadcastChannel', {
	timeout: 4000
}, async () => {
	assert.equal(typeof BroadcastChannel, 'function');
	const sharedClonedValue = 'tab-cloned-session-value';
	const first = tabClient(storageWith(sharedClonedValue), {});
	const second = tabClient(storageWith(sharedClonedValue), {});
	const worldId = `node-two-tab-${process.pid}-${Date.now()}`;
	try {
		assert.notEqual(first.playerId, second.playerId);
		await first.join({
			displayName: 'First tab',
			playerState: state(1.25, 6.5, 72.75, 0.25, false),
			worldId
		});
		await second.join({
			displayName: 'Second tab',
			playerState: state(-12.5, 9.75, 33.125, -1.5, true),
			worldId
		});
		await waitFor(() => first.world?.players?.length === 2 && second.world?.players?.length === 2);
		await second.updatePlayerState(state(28.875, 11.125, -4.5, 2.75, false));
		await waitFor(() => {
			const remote = first.world?.players?.find(player => player.id === second.playerId);
			return remote?.position?.x === 28.875 && remote?.facing === 2.75;
		});
		const remote = first.world.players.find(player => player.id === second.playerId);
		assert.deepEqual(remote.position, { x: 28.875, y: 11.125, z: -4.5 });
		assert.equal(remote.moving, false);
		assert.equal(first.world.peerCount, 1);
		second.stop();
		await waitFor(() => first.world?.peerCount === 0);
	} finally {
		first.stop();
		second.stop();
	}
});

function tabClient(storage, identityScope) {
	return new LocalTabRealtimeClient({
		heartbeatIntervalMs: 100,
		identityScope,
		storage
	});
}

function storageWith(initialValue) {
	const values = new Map([
		['awtsmoos.mitzvahWorld.localTabPlayerId', initialValue]
	]);
	return {
		getItem(key) { return values.get(key) || null; },
		setItem(key, value) { values.set(key, value); }
	};
}

function state(x, y, z, facing, moving) {
	return {
		coordinateSpace: 'world',
		facing,
		moving,
		position: { x, y, z }
	};
}

async function waitFor(predicate) {
	const deadline = Date.now() + 2500;
	while (!predicate()) {
		if (Date.now() >= deadline) throw new Error('Timed out waiting for tab convergence.');
		await new Promise(resolve => setTimeout(resolve, 10));
	}
}
