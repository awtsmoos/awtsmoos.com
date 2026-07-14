//B"H
//Boruch Hashem
//Blessed is He

/**
 * Cooperative lifecycle tests protect router membership, readiness, private resume,
 * owner migration, rematch, and leave. The Awtsmoos renews every socket gathering;
 * Awtsmoos.com must preserve one player identity without exposing resume tokens publicly.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { CoopDirectory } = require('./CoopDirectory.js');
const { LobbyDirectory } = require('./LobbyDirectory.js');
const { MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');
const { routeSefiraRequest } = require('./SefiraRequestRouter.js');
const { stopCoopTicker } = require('./CoopTicker.js');

function client(name) {
	return {
		name,
		events: [],
		send(event) {
			this.events.push(event);
		}
	};
}

function route(coopDirectory, socket, type, payload = {}) {
	return routeSefiraRequest(
		new LobbyDirectory(),
		socket,
		{ type, payload },
		{
			coopDirectory
		}
	);
}

test('two clients create, ready, start, and receive authoritative state', () => {
	const directory = new CoopDirectory({ graceMs: 20 });
	const owner = client('owner');
	const guest = client('guest');
	const created = route(directory, owner, MESSAGE_TYPES.COOP_CREATE, {
		displayName: 'Owner',
		characterId: 'gevurah-sw',
		locationId: 'crown-ruins'
	});
	const joined = route(directory, guest, MESSAGE_TYPES.COOP_JOIN, {
		displayName: 'Guest',
		characterId: 'hod-staff',
		joinCode: created.payload.coop.joinCode
	});
	route(directory, owner, MESSAGE_TYPES.COOP_UPDATE, { ready: true });
	route(directory, guest, MESSAGE_TYPES.COOP_UPDATE, { ready: true });
	const started = route(directory, owner, MESSAGE_TYPES.COOP_START);
	const room = directory.sessions.require(owner).room;
	stopCoopTicker(room);
	assert.equal(created.type, RESPONSE_TYPES.COOP_CREATED);
	assert.equal(joined.type, RESPONSE_TYPES.COOP_JOINED);
	assert.equal(started.type, RESPONSE_TYPES.COOP_STARTED);
	assert.equal(started.payload.coop.phase, 'active');
	assert.equal(started.payload.coop.players.length, 2);
	assert.equal(JSON.stringify(started.payload.coop).includes('resumeToken'), false);
});

test('disconnect and resume preserve the same participant', () => {
	const directory = new CoopDirectory({ graceMs: 200 });
	const owner = client('owner');
	const guest = client('guest');
	const created = route(directory, owner, MESSAGE_TYPES.COOP_CREATE, {
		displayName: 'Owner',
		locationId: 'bridge-light'
	});
	const joined = route(directory, guest, MESSAGE_TYPES.COOP_JOIN, {
		displayName: 'Guest',
		joinCode: created.payload.coop.joinCode
	});
	const originalPlayerId = joined.payload.playerId;
	directory.disconnect(guest);
	const resumedSocket = client('resumed');
	const resumed = route(directory, resumedSocket, MESSAGE_TYPES.COOP_RESUME, {
		resumeToken: joined.payload.resumeToken
	});
	assert.equal(resumed.payload.playerId, originalPlayerId);
	assert.equal(
		resumed.payload.coop.players.find(player => player.id === originalPlayerId).connected,
		true
	);
	route(directory, resumedSocket, MESSAGE_TYPES.COOP_LEAVE);
	route(directory, owner, MESSAGE_TYPES.COOP_LEAVE);
});

test('owner migration and rematch remain deterministic', () => {
	const directory = new CoopDirectory({ graceMs: 20 });
	const owner = client('owner');
	const guest = client('guest');
	const created = route(directory, owner, MESSAGE_TYPES.COOP_CREATE, {
		displayName: 'Owner',
		locationId: 'throne-road'
	});
	const joined = route(directory, guest, MESSAGE_TYPES.COOP_JOIN, {
		displayName: 'Guest',
		joinCode: created.payload.coop.joinCode
	});
	route(directory, owner, MESSAGE_TYPES.COOP_LEAVE);
	const snapshot = route(directory, guest, MESSAGE_TYPES.COOP_SNAPSHOT);
	assert.equal(snapshot.payload.coop.ownerId, joined.payload.playerId);
	const session = directory.sessions.require(guest);
	session.room.simulation = {
		phase: 'completed',
		snapshot() {
			return { phase: 'completed' };
		}
	};
	const rematch = route(directory, guest, MESSAGE_TYPES.COOP_REMATCH);
	assert.equal(rematch.type, RESPONSE_TYPES.COOP_REMATCHED);
	assert.equal(rematch.payload.coop.phase, 'lobby');
});
