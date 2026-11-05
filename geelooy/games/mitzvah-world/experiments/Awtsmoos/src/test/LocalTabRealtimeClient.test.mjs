// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { LocalTabRealtimeClient } from '../network/LocalTabRealtimeClient.js';
import { shouldUseLocalTabs } from '../network/MultiplayerConnectionFactory.js';

test('two localhost tabs exchange exact world transforms and explicit leave', async () => {
	let now = 613;
	const first = client('alice', () => now);
	const second = client('bob', () => now);
	await first.join({
		displayName: 'Alice',
		playerState: transform(4.5, 11.25, 72, 0.4, false),
		worldId: 'village-proof'
	});
	await second.join({
		displayName: 'Bob',
		playerState: transform(-8.75, 9.5, 31.125, 1.2, true),
		worldId: 'village-proof'
	});
	assert.equal(first.world.players.length, 2);
	assert.equal(second.world.players.length, 2);
	assert.deepEqual(
		first.world.players.find(player => player.id === 'bob').position,
		{ x: -8.75, y: 9.5, z: 31.125 }
	);
	now += 80;
	await second.updatePlayerState(transform(18.25, 13.75, -2.5, -2.2, false));
	const visibleBob = first.world.players.find(player => player.id === 'bob');
	assert.deepEqual(visibleBob.position, { x: 18.25, y: 13.75, z: -2.5 });
	assert.equal(visibleBob.facing, -2.2);
	assert.equal(visibleBob.moving, false);
	assert.equal(visibleBob.coordinateSpace, 'world');
	second.stop();
	assert.deepEqual(first.world.players.map(player => player.id), ['alice']);
	first.stop();
});

test('heartbeat refreshes presence and stale tabs are pruned without a leave event', async () => {
	let now = 100;
	const first = client('keeper', () => now, 500);
	const crashed = client('crashed', () => now, 500);
	await first.join({ displayName: 'Keeper', worldId: 'stale-proof' });
	await crashed.join({ displayName: 'Crashed', worldId: 'stale-proof' });
	assert.equal(first.world.peerCount, 1);
	crashed.channel.close();
	crashed.channel = null;
	now += 501;
	await first.heartbeat();
	assert.equal(first.world.peerCount, 0);
	assert.deepEqual(first.world.players.map(player => player.id), ['keeper']);
	first.stop();
	crashed.stop();
});

test('a stopped tab can rejoin from the same client with a fresh ordered connection', async () => {
	let now = 900;
	const first = client('resident', () => now);
	const returning = client('returning', () => now);
	await first.join({ displayName: 'Resident', worldId: 'rejoin-proof' });
	await returning.join({ displayName: 'Returning', worldId: 'rejoin-proof' });
	assert.equal(first.world.peerCount, 1);
	const originalConnectionId = returning.connectionId;
	returning.stop();
	assert.equal(first.world.peerCount, 0);
	now += 1;
	await returning.join({
		displayName: 'Returning',
		playerState: transform(7.5, 3.25, -11, 0.75, true),
		worldId: 'rejoin-proof'
	});
	assert.notEqual(returning.connectionId, originalConnectionId);
	assert.equal(first.world.peerCount, 1);
	assert.deepEqual(
		first.world.players.find(player => player.id === 'returning').position,
		{ x: 7.5, y: 3.25, z: -11 }
	);
	first.stop();
	returning.stop();
});

test('localhost chooses local-tab authority unless server transport is explicit', () => {
	assert.equal(shouldUseLocalTabs({ hostname: '127.0.0.1', search: '' }), true);
	assert.equal(shouldUseLocalTabs({ hostname: 'localhost', search: '?transport=server' }), false);
	assert.equal(shouldUseLocalTabs({ hostname: 'example.com', search: '?transport=local' }), true);
	assert.equal(shouldUseLocalTabs({ hostname: 'example.com', search: '' }), false);
});

function client(playerId, now, staleAfterMs = 6500) {
	return new LocalTabRealtimeClient({
		BroadcastChannelClass: FakeBroadcastChannel,
		heartbeatIntervalMs: 0,
		now,
		playerId,
		staleAfterMs
	});
}

function transform(x, y, z, facing, moving) {
	return {
		coordinateSpace: 'world',
		facing,
		moving,
		position: { x, y, z }
	};
}

class FakeBroadcastChannel {
	static channels = new Map();

	constructor(name) {
		this.name = name;
		this.listeners = new Set();
		if (!FakeBroadcastChannel.channels.has(name)) {
			FakeBroadcastChannel.channels.set(name, new Set());
		}
		FakeBroadcastChannel.channels.get(name).add(this);
	}

	addEventListener(type, listener) {
		if (type === 'message') this.listeners.add(listener);
	}

	removeEventListener(type, listener) {
		if (type === 'message') this.listeners.delete(listener);
	}

	postMessage(data) {
		for (const channel of FakeBroadcastChannel.channels.get(this.name) || []) {
			if (channel === this) continue;
			for (const listener of channel.listeners) listener({ data });
		}
	}

	close() {
		FakeBroadcastChannel.channels.get(this.name)?.delete(this);
	}
}
