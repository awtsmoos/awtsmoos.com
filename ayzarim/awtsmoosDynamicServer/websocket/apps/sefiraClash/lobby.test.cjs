//B"H
//Boruch Hashem
//Blessed is He

/**
 * Shared-room behavior is proven through independent socket vessels. The Awtsmoos
 * renews every membership; Awtsmoos.com verifies privacy, capacity, readiness,
 * immediate-expiry compatibility, owner migration, broadcasts, and room cleanup.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { LobbyDirectory } = require('./LobbyDirectory.js');

function client(name) {
	return {
		messages: [],
		name,
		send(message) {
			this.messages.push(message);
		}
	};
}

function directory() {
	return new LobbyDirectory({ graceMs: 0 });
}

function ownerProfile(name = 'Owner') {
	return {
		characterId: 'hod-staff',
		displayName: name,
		rules: { items: true, stocks: 3, teams: false },
		team: 1
	};
}

function joiningProfile(joinCode, name) {
	return {
		characterId: 'chesed-fist',
		displayName: name,
		joinCode,
		team: 2
	};
}

test('creates and joins a private four-player room with safe snapshots', () => {
	const rooms = directory();
	const owner = client('owner');
	const guest = client('guest');
	const created = rooms.create(owner, ownerProfile());
	const joined = rooms.join(guest, joiningProfile(created.lobby.joinCode, 'Guest'));
	assert.notEqual(created.playerId, joined.playerId);
	assert.equal(joined.lobby.players.length, 2);
	assert.equal(joined.lobby.players[0].isOwner, true);
	assert.equal('client' in joined.lobby.players[0], false);
	assert.equal('resumeToken' in joined.lobby.players[0], false);
	assert.equal(owner.messages.at(-1).type, 'lobby.changed');
	assert.equal(guest.messages.at(-1).payload.lobby.revision, 2);
});

test('invalidates readiness after character or team changes', () => {
	const rooms = directory();
	const owner = client('owner');
	rooms.create(owner, ownerProfile());
	rooms.update(owner, { ready: true });
	assert.equal(rooms.snapshot(owner).players[0].ready, true);
	rooms.update(owner, { characterId: 'yesod-lance' });
	assert.equal(rooms.snapshot(owner).players[0].ready, false);
});

test('migrates ownership and deletes a room after immediate expiry', () => {
	const rooms = directory();
	const owner = client('owner');
	const guest = client('guest');
	const created = rooms.create(owner, ownerProfile());
	rooms.join(guest, joiningProfile(created.lobby.joinCode, 'Guest'));
	rooms.disconnect(owner);
	assert.equal(rooms.snapshot(guest).players[0].isOwner, true);
	rooms.disconnect(guest);
	assert.throws(
		() => rooms.join(client('late'), joiningProfile(created.lobby.joinCode, 'Late')),
		error => error.code === 'LOBBY_NOT_FOUND'
	);
});

test('rejects a fifth player without corrupting room membership', () => {
	const rooms = directory();
	const owner = client('owner');
	const created = rooms.create(owner, ownerProfile());
	for (let index = 1; index < 4; index += 1) {
		rooms.join(
			client(`guest-${index}`),
			joiningProfile(created.lobby.joinCode, `Guest ${index}`)
		);
	}
	assert.throws(
		() => rooms.join(client('fifth'), joiningProfile(created.lobby.joinCode, 'Fifth')),
		error => error.code === 'LOBBY_FULL'
	);
	assert.equal(rooms.snapshot(owner).players.length, 4);
});
