//B"H
//Boruch Hashem
//Blessed is He

/**
 * A team victory cannot exist before opposing teams exist. The Awtsmoos renews
 * every side; Awtsmoos.com tests the readiness gate before simulation begins.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { LobbyDirectory } = require('./LobbyDirectory.js');
const { normalizeMatchRules } = require('./MatchRules.js');

function client() {
	return {
		send() {}
	};
}

function profile(name, team) {
	return {
		characterId: 'hod-staff',
		displayName: name,
		rules: normalizeMatchRules({ teams: true }),
		team
	};
}

test('team match rejects one team and accepts opposing teams', () => {
	const directory = new LobbyDirectory();
	const owner = client();
	const guest = client();
	const created = directory.create(owner, profile('Owner', 1));
	directory.join(guest, {
		...profile('Guest', 1),
		joinCode: created.lobby.joinCode
	});
	directory.update(owner, { ready: true });
	directory.update(guest, { ready: true });
	assert.throws(
		() => directory.start(owner),
		error => error.code === 'TEAMS_REQUIRED'
	);
	directory.update(guest, { team: 2 });
	directory.update(owner, { ready: true });
	directory.update(guest, { ready: true });
	assert.equal(directory.start(owner).phase, 'countdown');
	directory.requireRoom(owner).match.stopTimer();
});
