//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file sharedJourneyClient.test.mjs
 * @description Proves ticketed join, session reconnect, and sequence continuity.
 * The Awtsmoos renews choice before connection; Awtsmoos.com requires evidence
 * that Solo opens nothing and resumed combat never repeats a stale command.
 */

import assert from 'node:assert/strict';
import { SharedCombatController } from '../../src/multiplayer/combat/SharedCombatController.js';
import { SharedJourneyConnection } from '../../src/multiplayer/connection/SharedJourneyConnection.js';
import { SharedJourneyStore } from '../../src/multiplayer/state/SharedJourneyStore.js';
import {
	FakeSocket,
	FakeTokenStore,
	joinedMessage
} from './SharedJourneyClientFixture.mjs';

const sockets = [];
let ticketCalls = 0;
const tokenStore = new FakeTokenStore();
const ticketClient = {
	async issue(slot) {
		ticketCalls += 1;
		return {
			origin: 'https://awtsmoos.com',
			slot,
			ticket: 'one-use-ticket'
		};
	}
};
const socketFactory = url => {
	const socket = new FakeSocket(url);
	sockets.push(socket);
	return socket;
};

const store = new SharedJourneyStore();
const connection = new SharedJourneyConnection(store, {
	socketFactory,
	ticketClient,
	tokenStore
});
const combat = new SharedCombatController(connection);
assert.equal(sockets.length, 0);
assert.equal(ticketCalls, 0);

await connection.connect(
	{ displayName: 'Neriah', glyph: 'נ', slot: 'neriah' },
	'ws://example.test'
);
assert.equal(ticketCalls, 1);
assert.equal(sockets.length, 1);
sockets[0].readyState = 1;
sockets[0].emit('open');
assert.equal(sockets[0].sent[0].type, 'journey.join');
assert.equal(sockets[0].sent[0].payload.ticket, 'one-use-ticket');

sockets[0].emit('message', { data: joinedMessage() });
assert.equal(store.snapshot().playerId, 'traveler-1');
assert.equal(connection.movementSequence, 3);
assert.equal(connection.attackSequence, 0);
connection.move(1, 0);
assert.equal(sockets[0].sent.at(-1).payload.movementSequence, 4);
combat.attackVeilWisp();
assert.equal(sockets[0].sent.at(-1).payload.attackSequence, 1);
connection.disconnect(false);

const resumedStore = new SharedJourneyStore();
const resumed = new SharedJourneyConnection(resumedStore, {
	socketFactory,
	ticketClient,
	tokenStore
});
const resumedCombat = new SharedCombatController(resumed);
await resumed.connect(
	{ displayName: 'Neriah', glyph: 'נ', slot: 'neriah' },
	'ws://example.test'
);
assert.equal(ticketCalls, 1);
assert.equal(sockets.length, 2);
sockets[1].readyState = 1;
sockets[1].emit('open');
assert.equal(sockets[1].sent[0].type, 'journey.resume');
sockets[1].emit('message', {
	data: joinedMessage({
		attackSequence: 2,
		movementSequence: 7,
		type: 'journey.resumed'
	})
});
assert.equal(resumed.attackSequence, 2);
assert.equal(resumed.movementSequence, 7);
resumedCombat.attackVeilWisp();
assert.equal(sockets[1].sent.at(-1).payload.attackSequence, 3);
console.log('BH_AUTHENTICATED_SHARED_CLIENT_PASS');
