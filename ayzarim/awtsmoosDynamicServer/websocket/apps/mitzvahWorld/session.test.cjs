// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file session.test.cjs
 * @description Proves reconnect identity, scoped recovery, secrecy, and replay behavior.
 * The Awtsmoos renews a player beyond a broken wire; this Awtsmoos.com evidence
 * follows the session through the same versioned router used by real clients.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { QUEST_ID } = require('./TefillinMission.js');
const {
	createClient,
	createHarness,
	createTokenFactory,
	latestMessage,
	sendRequest
} = require('./sessionTestSupport.cjs');

test('session resumes, resyncs, replays safely, and expires after grace', async () => {
	let now = 1_000;
	const { directory, platform } = createHarness({
		clock: () => now,
		gracePeriodMs: 1_000,
		tokenFactory: createTokenFactory()
	});
	const first = createClient('first-transport');
	const joined = await sendRequest(
		platform,
		first,
		'world.join',
		{ displayName: 'Shliach', worldId: 'main-village' },
		'join-original',
		1
	);
	const session = joined.payload.session;
	const playerId = joined.payload.playerId;
	assert.equal(
		joined.payload.world.players.find(player => player.id === playerId).connected,
		true
	);
	assert.match(session.resumeToken, /^[A-Za-z0-9_-]{24,128}$/);
	assert.equal(JSON.stringify(joined.payload.world).includes(session.resumeToken), false);

	await sendRequest(platform, first, 'quest.start', {
		action: 'start',
		questId: QUEST_ID
	}, 'quest-start', 2);
	const interaction = {
		action: 'speak',
		npcId: 'rabbi-dov-ber',
		questId: QUEST_ID
	};
	await sendRequest(platform, first, 'quest.interact', interaction, 'objective-one', 3);
	await platform.disconnect(first);
	assert.equal(
		directory.rooms.get('main-village').snapshot().players
			.find(player => player.id === playerId).connected,
		false
	);

	const mismatch = createClient('wrong-world');
	await sendRequest(platform, mismatch, 'world.join', {
		resumeToken: session.resumeToken,
		worldId: 'another-world'
	}, 'join-mismatch', 1);
	assert.equal(latestMessage(mismatch, 'error').payload.code, 'SESSION_WORLD_MISMATCH');

	const resumedClient = createClient('resumed-transport');
	const resumed = await sendRequest(platform, resumedClient, 'world.join', {
		lastAcknowledgedRevision: 0,
		resumeToken: session.resumeToken
	}, 'join-resumed', 1);
	assert.equal(resumed.payload.playerId, playerId);
	assert.equal(resumed.payload.resumed, true);
	assert.equal(resumed.payload.session.id, session.id);
	assert.equal(
		resumed.payload.world.players.find(player => player.id === playerId).connected,
		true
	);

	const duplicate = await sendRequest(
		platform,
		resumedClient,
		'quest.interact',
		interaction,
		'objective-one',
		2
	);
	assert.equal(duplicate.payload.mission.progress.objectiveIndex, 1);
	const room = directory.rooms.get('main-village');
	const player = room.snapshot().players.find(candidate => candidate.id === playerId);
	assert.equal(player.quests[QUEST_ID].objectiveIndex, 1);

	const resynced = await sendRequest(platform, resumedClient, 'world.resync', {
		lastAcknowledgedRevision: 0
	}, 'resync', 3);
	assert.deepEqual(resynced.payload.events, []);
	assert.equal(resynced.payload.fullSnapshotRequired, true);
	assert.equal(resynced.payload.reason, 'interest-scoped-snapshot');
	assert.equal(JSON.stringify(resynced.payload.world).includes(session.resumeToken), false);
	const heartbeat = await sendRequest(platform, resumedClient, 'world.heartbeat', {
		lastAcknowledgedRevision: resynced.payload.toRevision
	}, 'heartbeat', 4);
	assert.equal(heartbeat.payload.sessionId, session.id);

	await platform.disconnect(resumedClient);
	now += 1_001;
	directory.cleanupExpired();
	assert.equal(directory.rooms.size, 0);
	const expired = createClient('expired-transport');
	await sendRequest(platform, expired, 'world.join', {
		resumeToken: session.resumeToken
	}, 'join-expired', 1);
	assert.equal(latestMessage(expired, 'error').payload.code, 'SESSION_EXPIRED');
});
