// B"H
import assert from 'node:assert/strict';
import test from 'node:test';
import { LocalTabRealtimeClient } from '../network/LocalTabRealtimeClient.js';
import { shouldUseLocalTabs } from '../network/MultiplayerConnectionFactory.js';

test('two localhost tabs discover, move, and remove one another in the same world', async () => {
	const first = client('alice');
	const second = client('bob');
	await first.join({ displayName: 'Alice', worldId: 'village-proof' });
	await second.join({ displayName: 'Bob', worldId: 'village-proof' });
	assert.equal(first.world.players.length, 2);
	assert.equal(second.world.players.length, 2);
	await second.input(1, 0.25, 1.2);
	const visibleBob = first.world.players.find(player => player.id === 'bob');
	assert.ok(Math.hypot(visibleBob.velocity.x, visibleBob.velocity.z) > 0);
	assert.equal(visibleBob.facing, 1.2);
	second.stop();
	assert.deepEqual(first.world.players.map(player => player.id), ['alice']);
	first.stop();
});

test('localhost chooses local-tab authority unless server transport is explicit', () => {
	assert.equal(shouldUseLocalTabs({ hostname: '127.0.0.1', search: '' }), true);
	assert.equal(shouldUseLocalTabs({ hostname: 'localhost', search: '?transport=server' }), false);
	assert.equal(shouldUseLocalTabs({ hostname: 'example.com', search: '' }), false);
});

function client(playerId) {
	return new LocalTabRealtimeClient({
		BroadcastChannelClass: FakeBroadcastChannel,
		now: () => 613,
		playerId
	});
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
