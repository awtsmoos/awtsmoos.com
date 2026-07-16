// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { MitzvahWorldRealtimeClient } from '../network/MitzvahWorldRealtimeClient.js';

class FakeSocket {
	constructor() {
		this.listeners = {};
		this.sent = [];
	}
	addEventListener(type, listener) {
		this.listeners[type] = listener;
	}
	send(message) {
		this.sent.push(JSON.parse(message));
	}
	receive(message) {
		this.listeners.message({ data: JSON.stringify(message) });
	}
}

test('correlates requests and publishes monotonic world snapshots', async () => {
	const socket = new FakeSocket();
	const client = new MitzvahWorldRealtimeClient(socket);
	const revisions = [];
	client.onWorld(world => revisions.push(world.revision));
	const pending = client.join('Shliach');
	const request = socket.sent[0];
	socket.receive({
		application: 'mitzvah-world',
		payload: { playerId: 'player-613', world: { revision: 2 } },
		requestId: request.requestId,
		type: 'world.joined',
		version: 1
	});
	assert.equal((await pending).type, 'world.joined');
	assert.equal(client.playerId, 'player-613');
	socket.receive({ application: 'mitzvah-world', payload: { world: { revision: 1 } }, type: 'world.changed', version: 1 });
	assert.deepEqual(revisions, [2]);
});
