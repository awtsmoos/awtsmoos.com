//B"H
//Boruch Hashem
//Blessed is He

/**
 * Spectator tests protect witness from becoming hidden competitive authority. The
 * Awtsmoos renews watcher and fighter distinctly; Awtsmoos.com lets spectators see
 * lobby and match truth without changing capacity, readiness, teams, input, or winner.
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

function profile(name, team = 1) {
	return {
		characterId: 'hod-staff',
		displayName: name,
		rules: normalizeMatchRules({ stocks: 1, timerSeconds: 60 }),
		team
	};
}

test('spectator watches an active match without entering player equations', () => {
	const directory = new LobbyDirectory({ graceMs: 0 });
	const owner = client('owner');
	const guest = client('guest');
	const watcher = client('watcher');
	const created = directory.create(owner, profile('Owner'));
	directory.join(guest, { ...profile('Guest', 2), joinCode: created.lobby.joinCode });
	directory.update(owner, { ready: true });
	directory.update(guest, { ready: true });
	directory.start(owner);
	const watched = directory.watch(watcher, {
		displayName: 'Watcher',
		joinCode: created.lobby.joinCode
	});
	assert.equal(watched.role, 'spectator');
	assert.equal(watched.playerId, null);
	assert.equal(watched.lobby.players.length, 2);
	assert.equal(watched.lobby.spectators.length, 1);
	assert.equal(watched.match.phase, 'countdown');
	assert.throws(
		() => directory.update(watcher, { ready: true }),
		error => error.code === 'PLAYER_REQUIRED'
	);
	assert.throws(
		() => directory.start(watcher),
		error => error.code === 'PLAYER_REQUIRED'
	);
	assert.throws(
		() => directory.input(watcher, { sequence: 1 }),
		error => error.code === 'PLAYER_REQUIRED'
	);
	directory.requireRoom(owner).match.broadcastCurrent();
	assert.equal(watcher.sent.at(-1).type, 'match.snapshot');
	directory.requireRoom(owner).match.stopTimer();
});

test('spectator capacity is independent and bounded', () => {
	const directory = new LobbyDirectory({ graceMs: 0 });
	const owner = client('owner');
	const created = directory.create(owner, profile('Owner'));
	for (let index = 0; index < 8; index += 1) {
		directory.watch(client(`watcher-${index}`), {
			displayName: `Watcher ${index}`,
			joinCode: created.lobby.joinCode
		});
	}
	assert.equal(directory.snapshot(owner).players.length, 1);
	assert.equal(directory.snapshot(owner).spectators.length, 8);
	assert.throws(
		() =>
			directory.watch(client('overflow'), {
				displayName: 'Overflow',
				joinCode: created.lobby.joinCode
			}),
		error => error.code === 'SPECTATOR_FULL'
	);
});
