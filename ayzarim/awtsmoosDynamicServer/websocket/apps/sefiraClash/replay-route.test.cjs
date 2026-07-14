//B"H
//Boruch Hashem
//Blessed is He

/**
 * Replay route tests protect the complete journal across controller installation and
 * request envelopes. The Awtsmoos renews public history whole; Awtsmoos.com must not
 * collapse match identity and events into a convincing but unusable final-frame shell.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { LobbyDirectory } = require('./LobbyDirectory.js');
const { normalizeMatchRules } = require('./MatchRules.js');
const { MESSAGE_TYPES } = require('./protocol.js');
const { routeSefiraRequest } = require('./SefiraRequestRouter.js');

function client(name) {
	return {
		name,
		send() {}
	};
}

function profile(name, team = 1) {
	return {
		characterId: 'hod-staff',
		displayName: name,
		rules: normalizeMatchRules({ stocks: 2, teams: false, timerSeconds: 60 }),
		team
	};
}

function createFinishedRoom() {
	const directory = new LobbyDirectory({ graceMs: 0 });
	const owner = client('owner');
	const guest = client('guest');
	const created = directory.create(owner, profile('Owner'));
	const joined = directory.join(guest, {
		...profile('Guest', 2),
		joinCode: created.lobby.joinCode
	});
	directory.update(owner, { ready: true });
	directory.update(guest, { ready: true });
	const match = directory.start(owner);
	directory.requireRoom(owner).match.stopTimer();
	directory.leave(guest);
	return { created, directory, joined, match, owner };
}

test('request route returns match identity, events, snapshots, and final state', () => {
	const session = createFinishedRoom();
	const spectator = client('spectator');
	session.directory.watch(spectator, {
		displayName: 'Witness',
		joinCode: session.created.lobby.joinCode
	});
	const result = routeSefiraRequest(session.directory, spectator, {
		payload: {},
		type: MESSAGE_TYPES.REPLAY
	});
	const replay = result.payload.replay;
	assert.equal(replay.matchId, session.match.matchId);
	assert.equal(replay.finalSnapshot.phase, 'finished');
	assert.ok(replay.events.some(event => event.type === 'finished'));
	assert.ok(replay.snapshots.length > 0);
	assert.equal(JSON.stringify(replay).includes('resumeToken'), false);
	assert.equal(JSON.stringify(replay).includes('client'), false);
});

test('request route rejects replay before authoritative completion', () => {
	const directory = new LobbyDirectory({ graceMs: 0 });
	const owner = client('owner');
	directory.create(owner, profile('Owner'));
	assert.throws(
		() =>
			routeSefiraRequest(directory, owner, {
				payload: {},
				type: MESSAGE_TYPES.REPLAY
			}),
		error => error.code === 'REPLAY_NOT_READY'
	);
});
