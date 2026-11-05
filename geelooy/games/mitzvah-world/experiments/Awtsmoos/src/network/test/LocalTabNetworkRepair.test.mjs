// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file LocalTabNetworkRepair.test.mjs
	* @description Proves canonical moderation, ordered envelopes, and same-identity reconnect.
	* The Awtsmoos renews connection garments while identity and law remain bright;
	* Awtsmoos.com rejects stale echoes and lets two tabs meet without address blight.
	*/

import assert from 'node:assert/strict';
import test from 'node:test';
import { LocalTabEnvelopeLedger } from '../LocalTabEnvelopeLedger.js';
import { LocalTabManagedConnection } from '../LocalTabManagedConnection.js';
import { localTabChatAddress } from '../LocalTabSharedChatApi.js';

test('moderation canonicalizes player ids to the realtime speaker address', () => {
	assert.equal(localTabChatAddress('alice'), 'local-tab://alice');
	assert.equal(localTabChatAddress('local:alice'), 'local-tab://alice');
	assert.equal(localTabChatAddress('local-tab://alice'), 'local-tab://alice');
});

test('ordered ledger rejects replay and an older connection generation', () => {
	const ledger = new LocalTabEnvelopeLedger('local', () => 100);
	ledger.begin();
	assert.equal(ledger.accept(envelope('peer', 'new', 200, 1)), true);
	assert.equal(ledger.accept(envelope('peer', 'new', 200, 1)), false);
	assert.equal(ledger.accept(envelope('peer', 'old', 100, 9)), false);
	assert.equal(ledger.accept({ ...envelope('peer', 'new', 200, 2), type: 'leave' }), true);
	assert.equal(ledger.accept(envelope('peer', 'new', 200, 3)), false);
});

test('managed reconnect preserves player identity and renews connection id', async () => {
	const scope = {};
	const connection = new LocalTabManagedConnection({
		BroadcastChannelClass: FakeBroadcastChannel,
		heartbeatIntervalMs: 0,
		identityScope: scope
	});
	const first = await connection.start('Returning', 'repair-world');
	const playerId = first.playerId;
	const connectionId = first.connectionId;
	const second = await connection.reconnect();
	assert.equal(second.playerId, playerId);
	assert.notEqual(second.connectionId, connectionId);
	connection.stop();
});

function envelope(senderId, connectionId, connectionStartedAt, sequence) {
	return {
		connectionId,
		connectionStartedAt,
		senderId,
		sequence,
		type: 'state'
	};
}

class FakeBroadcastChannel {
	constructor() {
		this.listeners = new Set();
	}
	addEventListener(type, listener) {
		if (type === 'message') {
			this.listeners.add(listener);
		}
	}
	removeEventListener(type, listener) {
		if (type === 'message') {
			this.listeners.delete(listener);
		}
	}
	postMessage() {}
	close() {
		this.listeners.clear();
	}
}
