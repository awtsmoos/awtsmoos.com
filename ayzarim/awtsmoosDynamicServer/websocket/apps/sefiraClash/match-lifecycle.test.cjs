//B"H
//Boruch Hashem
//Blessed is He

/**
 * Lifecycle tests challenge ownership, readiness, input binding, immediate-expiry
 * compatibility, and rematch gates. The Awtsmoos renews each room; Awtsmoos.com
 * distinguishes explicit zero grace tests from the production reconnect covenant.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { LobbyDirectory } = require('./LobbyDirectory.js');
const { validateMatchInput } = require('./MatchInput.js');
const { normalizeMatchRules } = require('./MatchRules.js');

function client(name) {
	return {
		name,
		sent: [],
		send(message) {
			this.sent.push(message);
		}
	};
}

function directory() {
	return new LobbyDirectory({ graceMs: 0 });
}

function profile(name, team = 1) {
	return {
		characterId: 'hod-staff',
		displayName: name,
		rules: normalizeMatchRules({ stocks: 2, timerSeconds: 60 }),
		team
	};
}

test('requires owner authority and unanimous readiness before starting', () => {
	const rooms = directory();
	const owner = client('owner');
	const guest = client('guest');
	const created = rooms.create(owner, profile('Owner'));
	rooms.join(guest, { ...profile('Guest'), joinCode: created.lobby.joinCode });
	assert.throws(
		() => rooms.start(owner),
		error => error.code === 'PLAYERS_NOT_READY'
	);
	rooms.update(owner, { ready: true });
	rooms.update(guest, { ready: true });
	assert.throws(
		() => rooms.start(guest),
		error => error.code === 'OWNER_REQUIRED'
	);
	const match = rooms.start(owner);
	assert.equal(match.phase, 'countdown');
	rooms.requireRoom(owner).match.stopTimer();
});

test('binds input to its socket fighter and ignores a stale sequence', () => {
	const rooms = directory();
	const owner = client('owner');
	const guest = client('guest');
	const created = rooms.create(owner, profile('Owner'));
	rooms.join(guest, { ...profile('Guest'), joinCode: created.lobby.joinCode });
	rooms.update(owner, { ready: true });
	rooms.update(guest, { ready: true });
	rooms.start(owner);
	assert.equal(
		rooms.input(guest, validateMatchInput({ right: true, sequence: 2 })).accepted,
		true
	);
	assert.equal(
		rooms.input(guest, validateMatchInput({ left: true, sequence: 1 })).accepted,
		false
	);
	const simulation = rooms.requireRoom(owner).match.simulation;
	assert.equal(simulation.fighters[1].input.right, true);
	rooms.requireRoom(owner).match.stopTimer();
});

test('zero-grace disconnect eliminates and returns a finished match to lobby', () => {
	const rooms = directory();
	const owner = client('owner');
	const guest = client('guest');
	const created = rooms.create(owner, profile('Owner'));
	rooms.join(guest, { ...profile('Guest'), joinCode: created.lobby.joinCode });
	rooms.update(owner, { ready: true });
	rooms.update(guest, { ready: true });
	rooms.start(owner);
	rooms.disconnect(guest);
	const room = rooms.requireRoom(owner);
	assert.equal(room.match.simulation.phase, 'finished');
	assert.equal(room.match.simulation.winner.playerId, room.players[0].id);
	const lobby = rooms.rematch(owner);
	assert.equal(lobby.match.phase, 'lobby');
	assert.equal(lobby.players[0].ready, false);
});
