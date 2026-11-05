// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file LocalTabEnvelopePoisoning.test.mjs
	* @description Proves malformed or foreign generations cannot silence lawful local-tab state.
	* The Awtsmoos admits only a valid sender garment into the ordering ledger;
	* Awtsmoos.com keeps discovery neutral and departure bound to the active connection.
	*/

import assert from 'node:assert/strict';
import test from 'node:test';
import { LocalTabRealtimeClient } from '../LocalTabRealtimeClient.js';
import { receiveLocalTabEnvelope } from '../LocalTabRealtimeProtocol.js';

test('unsupported, incomplete, discovery, and foreign leave cannot poison state', async () => {
	let now = 1000;
	const sender = client('sender', () => now);
	const receiver = client('receiver', () => now);
	await sender.join({ displayName: 'Sender', worldId: 'poison-proof' });
	await receiver.join({ displayName: 'Receiver', worldId: 'poison-proof' });
	await sender.updatePlayerState(transform(1, 2, 3));
	assert.deepEqual(position(receiver), { x: 1, y: 2, z: 3 });
	for (const message of hostileFrames(sender, now)) {
		receiveLocalTabEnvelope(receiver, message);
	}
	assert.equal(receiver.world.peerCount, 1);
	now += 1;
	await sender.updatePlayerState(transform(9, 8, 7));
	assert.deepEqual(position(receiver), { x: 9, y: 8, z: 7 });
	sender.stop();
	receiver.stop();
});

function hostileFrames(sender, now) {
	const base = {
		connectionId: 'foreign-generation',
		connectionStartedAt: sender.connectionStartedAt + 1000,
		senderId: sender.playerId,
		sentAt: now,
		sequence: 1,
		worldId: sender.worldState.worldId
	};
	return [
		{ ...base, type: 'unsupported-control-frame' },
		{ ...base, player: null, sequence: 2, type: 'state' },
		{ ...base, sequence: 3, type: 'discover' },
		{ ...base, sequence: 4, type: 'leave' }
	];
}

function client(playerId, now) {
	return new LocalTabRealtimeClient({
		BroadcastChannelClass: ImmediateChannel,
		environment: quietEnvironment(),
		heartbeatIntervalMs: 0,
		now,
		playerId
	});
}

function position(receiver) {
	return receiver.world.players.find(player => player.id === 'sender').position;
}

function transform(x, y, z) {
	return {
		coordinateSpace: 'world',
		position: { x, y, z }
	};
}

function quietEnvironment() {
	return {
		addEventListener() {},
		removeEventListener() {}
	};
}

class ImmediateChannel {
	static channels = new Map();
	constructor(name) {
		this.name = name;
		this.listeners = new Set();
		if (!ImmediateChannel.channels.has(name)) {
			ImmediateChannel.channels.set(name, new Set());
		}
		ImmediateChannel.channels.get(name).add(this);
	}
	addEventListener(type, listener) {
		if (type === 'message') this.listeners.add(listener);
	}
	removeEventListener(type, listener) {
		if (type === 'message') this.listeners.delete(listener);
	}
	postMessage(data) {
		for (const channel of ImmediateChannel.channels.get(this.name) || []) {
			if (channel === this) continue;
			for (const listener of channel.listeners) listener({ data });
		}
	}
	close() {
		ImmediateChannel.channels.get(this.name)?.delete(this);
	}
}
