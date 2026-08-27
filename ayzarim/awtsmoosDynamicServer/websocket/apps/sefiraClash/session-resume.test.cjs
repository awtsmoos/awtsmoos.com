//B"H
//Boruch Hashem
//Blessed is He

/**
 * Resume tests prove that identity survives a socket while authority remains on the
 * server. The Awtsmoos renews the participant beyond transport; Awtsmoos.com
 * neutralizes immediately, restores safely, and eliminates only after measured grace.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { LobbyDirectory } = require('./LobbyDirectory.js');
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

function profile(name) {
	return {
		characterId: 'hod-staff',
		displayName: name,
		rules: normalizeMatchRules({ stocks: 2, timerSeconds: 60 }),
		team: 1
	};
}

function controlledDirectory() {
	const timers = [];
	const directory = new LobbyDirectory({
		clearTimer(timer) {
			timer.cleared = true;
		},
		graceMs: 5000,
		scheduleTimer(callback, milliseconds) {
			const timer = { callback, cleared: false, milliseconds, unref() {} };
			timers.push(timer);
			return timer;
		}
	});
	return { directory, timers };
}

function startPair(directory) {
	const owner = client('owner');
	const guest = client('guest');
	const created = directory.create(owner, profile('Owner'));
	const joined = directory.join(guest, { ...profile('Guest'), joinCode: created.lobby.joinCode });
	directory.update(owner, { ready: true });
	directory.update(guest, { ready: true });
	directory.start(owner);
	directory.requireRoom(owner).match.stopTimer();
	return { created, guest, joined, owner };
}

test('disconnect neutralizes then resume restores the same fighter and identity', () => {
	const { directory, timers } = controlledDirectory();
	const session = startPair(directory);
	directory.input(session.guest, {
		attack: true,
		guard: false,
		jump: false,
		left: false,
		right: true,
		sequence: 9
	});
	directory.disconnect(session.guest);
	const room = directory.requireRoom(session.owner);
	const fighter = room.match.simulation.findFighter(session.joined.playerId);
	assert.equal(fighter.connected, false);
	assert.equal(fighter.eliminated, false);
	assert.equal(fighter.input.right, false);
	assert.equal(timers.length, 1);
	const replacement = client('replacement');
	const resumed = directory.resume(replacement, session.joined.resumeToken);
	assert.equal(resumed.playerId, session.joined.playerId);
	assert.equal(resumed.resumeToken, session.joined.resumeToken);
	assert.equal(fighter.connected, true);
	assert.equal(fighter.stocks, 2);
	assert.equal(timers[0].cleared, true);
});

test('grace expiry eliminates a disconnected fighter and migrates ownership', () => {
	const { directory, timers } = controlledDirectory();
	const session = startPair(directory);
	directory.disconnect(session.owner);
	assert.equal(directory.snapshot(session.guest).players[0].isOwner, true);
	assert.equal(directory.snapshot(session.guest).players.length, 2);
	timers[0].callback();
	const lobby = directory.snapshot(session.guest);
	assert.equal(lobby.players.length, 1);
	assert.equal(lobby.players[0].isOwner, true);
	assert.equal(lobby.match.phase, 'finished');
});

test('intentional leave removes immediately without scheduling grace', () => {
	const { directory, timers } = controlledDirectory();
	const owner = client('owner');
	const created = directory.create(owner, profile('Owner'));
	assert.equal(directory.leave(owner), null);
	assert.equal(timers.length, 0);
	assert.throws(
		() =>
			directory.join(client('late'), {
				...profile('Late'),
				joinCode: created.lobby.joinCode
			}),
		error => error.code === 'LOBBY_NOT_FOUND'
	);
});
