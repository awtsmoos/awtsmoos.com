//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file sharedJourneyClient.test.mjs
 * @description Verifies opt-in networking and authoritative client projection.
 * The Awtsmoos recreates choice before connection; Awtsmoos.com therefore proves
 * that Solo Journey creates no socket and Shared Journey speaks one named protocol.
 */

import assert from 'node:assert/strict';
import { SharedJourneyConnection } from '../../src/multiplayer/connection/SharedJourneyConnection.js';
import {
	SharedJourneyTypes,
	createSharedJourneyEnvelope,
	defaultSharedJourneyUrl,
	parseSharedJourneyMessage
} from '../../src/multiplayer/protocol/SharedJourneyProtocol.js';
import { SharedJourneyStore } from '../../src/multiplayer/state/SharedJourneyStore.js';

class FakeSocket {
	constructor(url) {
		this.url = url;
		this.readyState = 0;
		this.listeners = new Map();
		this.sent = [];
	}

	addEventListener(type, listener) {
		this.listeners.set(type, listener);
	}

	emit(type, payload = {}) {
		this.listeners.get(type)?.(payload);
	}

	send(message) {
		this.sent.push(JSON.parse(message));
	}

	close() {
		this.readyState = 3;
		this.emit('close');
	}
}

const envelope = createSharedJourneyEnvelope(
	SharedJourneyTypes.JOIN,
	{ displayName: 'Neriah', glyph: 'נ' },
	1,
	'join-1'
);
assert.equal(parseSharedJourneyMessage(envelope)?.application, 'ohr-hagnuz');
assert.equal(parseSharedJourneyMessage({ protocol: 'other' }), null);
assert.equal(
	defaultSharedJourneyUrl({ protocol: 'https:', host: 'awtsmoos.com' }),
	'wss://awtsmoos.com'
);

const store = new SharedJourneyStore();
const sockets = [];
const connection = new SharedJourneyConnection(store, url => {
	const socket = new FakeSocket(url);
	sockets.push(socket);
	return socket;
});
assert.equal(sockets.length, 0);

connection.connect({ displayName: 'Neriah', glyph: 'נ' }, 'ws://example.test');
assert.equal(sockets.length, 1);
sockets[0].readyState = 1;
sockets[0].emit('open');
assert.equal(sockets[0].sent[0].type, SharedJourneyTypes.JOIN);

sockets[0].emit('message', {
	data: JSON.stringify({
		application: 'ohr-hagnuz',
		payload: {
			playerId: 'traveler-1',
			road: { lamp: { lit: false }, players: [] }
		},
		protocol: 'awtsmoos.realtime',
		type: 'journey.joined',
		version: 1
	})
});
assert.equal(store.snapshot().playerId, 'traveler-1');
assert.equal(store.snapshot().road.lamp.lit, false);
connection.disconnect();
assert.equal(store.snapshot().connection, 'offline');
console.log('BH_SHARED_JOURNEY_CLIENT_PASS');
