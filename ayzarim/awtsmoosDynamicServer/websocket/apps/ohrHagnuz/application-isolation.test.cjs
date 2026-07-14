//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file application-isolation.test.cjs
 * @description Proves versioned registration, cleanup, and legacy isolation.
 * The Awtsmoos recreates many worlds without mixture; Awtsmoos.com verifies that
 * Ohr HaGnuz enters one named gate while older socket garments remain untouched.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { RealtimePlatform } = require('../../platform/RealtimePlatform.js');
const { createOhrHagnuzApplication } = require('./application.js');
const { SharedRoadDirectory } = require('./SharedRoadDirectory.js');

function client() {
	return {
		messages: [],
		send(message) {
			this.messages.push(message);
		}
	};
}

function envelope(type, requestId, sequence, payload) {
	return JSON.stringify({
		application: 'ohr-hagnuz',
		payload,
		protocol: 'awtsmoos.realtime',
		requestId,
		sequence,
		type,
		version: 1
	});
}

async function join(platform, traveler, name, sequence = 1) {
	await platform.route(traveler, envelope('journey.join', `join-${name}`, sequence, {
		displayName: name,
		glyph: 'נ'
	}));
}

test('registered application joins and moves through the shared router', async () => {
	const platform = new RealtimePlatform({}, [createOhrHagnuzApplication]);
	const traveler = client();
	await join(platform, traveler, 'Neriah');
	await platform.route(traveler, envelope('journey.move', 'move-1', 2, {
		dx: 1,
		dy: 0,
		movementSequence: 1
	}));

	const joined = traveler.messages.find(message => message.type === 'journey.joined');
	const moved = traveler.messages.find(message => message.type === 'journey.moved');
	assert.equal(joined.application, 'ohr-hagnuz');
	assert.equal(moved.payload.player.x, 3);
	assert.equal(createOhrHagnuzApplication().legacyTypes.length, 0);
});

test('disconnect removes membership and broadcasts the smaller snapshot', async () => {
	const directory = new SharedRoadDirectory();
	const application = createOhrHagnuzApplication(directory);
	const platform = new RealtimePlatform({}, [application]);
	const first = client();
	const second = client();
	await join(platform, first, 'Neriah');
	await join(platform, second, 'Taliah');

	await platform.disconnect(first);
	const roadEvent = [...second.messages]
		.reverse()
		.find(message => message.type === 'journey.road-changed');
	assert.equal(roadEvent.payload.road.players.length, 1);
	assert.equal(roadEvent.payload.road.players[0].displayName, 'Taliah');
	assert.equal(directory.roomByClient.has(first), false);
});

test('unknown legacy traffic is not claimed by the game application', async () => {
	const platform = new RealtimePlatform({}, [createOhrHagnuzApplication]);
	const traveler = client();
	await platform.route(traveler, JSON.stringify({ tunnelRequest: { name: 'protected' } }));
	assert.equal(traveler.messages.length, 1);
	assert.notEqual(traveler.messages[0]?.application, 'ohr-hagnuz');
});
