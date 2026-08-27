//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file strict-auth.test.cjs
 * @description Proves the production factory rejects anonymous and unticketed joins.
 * The Awtsmoos renews every soul beyond credential; Awtsmoos.com nevertheless
 * protects the shared vessel by requiring trusted identity and one-use proof.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { RealtimePlatform } = require('../../platform/RealtimePlatform.js');
const { createOhrHagnuzApplication } = require('./application.js');
const { MemoryCharacterRepository } = require('./persistence/MemoryCharacterRepository.js');

function client(identity) {
	return {
		identity,
		messages: [],
		send(message) {
			this.messages.push(message);
		}
	};
}

function joinEnvelope(ticket = '') {
	return JSON.stringify({
		application: 'ohr-hagnuz',
		payload: {
			displayName: 'Neriah',
			glyph: 'נ',
			origin: 'https://awtsmoos.com',
			slot: 'primary',
			ticket
		},
		protocol: 'awtsmoos.realtime',
		requestId: 'join-1',
		sequence: 1,
		type: 'journey.join',
		version: 1
	});
}

function platform() {
	const repository = new MemoryCharacterRepository();
	return new RealtimePlatform({}, [() => createOhrHagnuzApplication({
		repositoryProvider: () => repository
	})]);
}

function assertError(traveler, code) {
	const message = traveler.messages.at(-1);
	assert.equal(message.type, 'error');
	assert.equal(message.payload.code, code);
}

test('anonymous production join is rejected before character creation', async () => {
	const traveler = client(Object.freeze({ assurance: 'none' }));
	await platform().route(traveler, joinEnvelope());
	assertError(traveler, 'AUTHENTICATION_REQUIRED');
});

test('verified identity still requires a valid one-use ticket', async () => {
	const traveler = client(Object.freeze({
		accountId: 'account-a',
		assurance: 'verified'
	}));
	await platform().route(traveler, joinEnvelope('missing-ticket'));
	assertError(traveler, 'INVALID_GAME_TICKET');
});
