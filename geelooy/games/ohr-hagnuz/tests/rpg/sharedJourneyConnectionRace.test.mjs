//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file sharedJourneyConnectionRace.test.mjs
 * @description Proves cancellation, socket replacement, and stale-token recovery.
 * The Awtsmoos renews every connection attempt without binding the traveler to
 * an obsolete vessel; Awtsmoos.com never resurrects a cancelled or replaced path.
 */

import assert from 'node:assert/strict';
import { SharedJourneyConnection } from '../../src/multiplayer/connection/SharedJourneyConnection.js';
import { SharedJourneyStore } from '../../src/multiplayer/state/SharedJourneyStore.js';
import {
	RaceTokenStore,
	createDeferred,
	createSocketFactory,
	flushPromises,
	raceProfile
} from './SharedJourneyRaceFixture.mjs';

async function proveCancelledTicketCreatesNoSocket() {
	const deferred = createDeferred();
	const sockets = [];
	const connection = new SharedJourneyConnection(new SharedJourneyStore(), {
		socketFactory: createSocketFactory(sockets),
		ticketClient: { issue: () => deferred.promise },
		tokenStore: new RaceTokenStore()
	});
	const pending = connection.connect(raceProfile(), 'ws://example.test');
	connection.disconnect(false);
	deferred.resolve({
		origin: 'https://awtsmoos.com',
		ticket: 'ticket'
	});
	await pending;
	assert.equal(sockets.length, 0);
}

async function proveReplacedSocketCannotReconnect() {
	const sockets = [];
	const timers = [];
	const connection = new SharedJourneyConnection(new SharedJourneyStore(), {
		setTimeout: callback => timers.push(callback),
		socketFactory: createSocketFactory(sockets),
		tokenStore: new RaceTokenStore(
			'reconnect-token-abcdefghijklmnopqrstuvwxyz'
		)
	});
	await connection.connect(raceProfile(), 'ws://example.test');
	sockets[0].readyState = 1;
	sockets[0].emit('open');
	await connection.connect(raceProfile(), 'ws://example.test');
	assert.equal(sockets.length, 2);
	assert.equal(timers.length, 0);
}

async function proveStaleTokenFallsBackToFreshTicket() {
	const sockets = [];
	let ticketCalls = 0;
	const connection = new SharedJourneyConnection(new SharedJourneyStore(), {
		socketFactory: createSocketFactory(sockets),
		ticketClient: {
			async issue() {
				ticketCalls += 1;
				return {
					origin: 'https://awtsmoos.com',
					ticket: 'fresh-ticket'
				};
			}
		},
		tokenStore: new RaceTokenStore(
			'stale-reconnect-token-abcdefghijklmnopqrstuvwxyz'
		)
	});
	await connection.connect(raceProfile(), 'ws://example.test');
	sockets[0].readyState = 1;
	sockets[0].emit('open');
	sockets[0].emit('message', {
		data: JSON.stringify({
			application: 'ohr-hagnuz',
			payload: { code: 'INVALID_RECONNECT_TOKEN' },
			protocol: 'awtsmoos.realtime',
			type: 'error',
			version: 1
		})
	});
	await flushPromises();
	assert.equal(ticketCalls, 1);
	assert.equal(sockets.length, 2);
	sockets[1].readyState = 1;
	sockets[1].emit('open');
	assert.equal(sockets[1].sent[0].type, 'journey.join');
}

await proveCancelledTicketCreatesNoSocket();
await proveReplacedSocketCannotReconnect();
await proveStaleTokenFallsBackToFreshTicket();
console.log('BH_SHARED_CONNECTION_RACE_PASS');
