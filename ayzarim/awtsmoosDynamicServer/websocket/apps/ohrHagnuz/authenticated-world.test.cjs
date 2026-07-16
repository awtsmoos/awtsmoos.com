//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file authenticated-world.test.cjs
 * @description Proves ticket replay defense, cooperative rewards, and reconnect.
 * The Awtsmoos renews every traveler without making memory or credential the soul;
 * Awtsmoos.com requires measured evidence that continuity cannot become duplication.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { AuthenticatedWorldTestHarness } = require('./AuthenticatedWorldTestHarness.cjs');

function response(client, type) {
	return [...client.messages].reverse()
		.find(message => message.type === type);
}

function assertError(message, code) {
	assert.equal(message.type, 'error');
	assert.equal(message.payload.code, code);
}

test('one-use ticket rejects replay and active duplicate character', async () => {
	const world = new AuthenticatedWorldTestHarness();
	const first = world.client('account-a');
	const duplicate = world.client('account-a');
	const issued = world.ticket('account-a', 'neriah');
	const joined = await world.join(first, 'Neriah', 'neriah', issued.token);
	assert.equal(joined.type, 'journey.joined');

	const replay = await world.join(duplicate, 'Neriah', 'neriah', issued.token);
	assertError(replay, 'INVALID_GAME_TICKET');

	const secondTicket = world.ticket('account-a', 'neriah');
	const active = await world.join(
		duplicate,
		'Neriah',
		'neriah',
		secondTicket.token
	);
	assertError(active, 'CHARACTER_ALREADY_ACTIVE');
});

test('two durable characters defeat the wisp and reconnect with rewards', async () => {
	const world = new AuthenticatedWorldTestHarness();
	const first = world.client('account-a');
	const second = world.client('account-a');
	const firstJoin = await world.join(
		first,
		'Neriah',
		'neriah',
		world.ticket('account-a', 'neriah').token
	);
	const secondJoin = await world.join(
		second,
		'Taliah',
		'taliah',
		world.ticket('account-a', 'taliah').token
	);
	assert.notEqual(firstJoin.payload.playerId, secondJoin.payload.playerId);
	await world.moveEast(first, 1, 7);
	await world.moveEast(second, 1, 7);

	await world.attack(first, 1);
	await world.attack(second, 1);
	await world.attack(first, 2);
	const defeated = await world.attack(second, 2);
	assert.equal(defeated.payload.combat.defeated, true);
	assert.equal(defeated.payload.combat.rewardedPlayerIds.length, 2);

	const firstRecord = await world.repository.load('account-a', 'neriah');
	const secondRecord = await world.repository.load('account-a', 'taliah');
	assert.equal(firstRecord.x, 9);
	assert.equal(firstRecord.passageShards, 1);
	assert.equal(firstRecord.sharedLight, 2);
	assert.equal(secondRecord.passageShards, 1);
	assert.equal(secondRecord.sharedLight, 2);

	const afterDefeat = await world.attack(first, 3);
	assertError(afterDefeat, 'TARGET_DEFEATED');
	await world.platform.disconnect(first);

	const resumedClient = world.client('account-a');
	const resumed = await world.send(resumedClient, 'journey.resume', {
		reconnectToken: firstJoin.payload.reconnectToken,
		slot: 'neriah'
	});
	assert.equal(resumed.type, 'journey.resumed');
	assert.equal(resumed.payload.playerId, firstJoin.payload.playerId);
	assert.notEqual(
		resumed.payload.reconnectToken,
		firstJoin.payload.reconnectToken
	);
	const resumedPlayer = resumed.payload.road.players
		.find(player => player.id === resumed.payload.playerId);
	assert.equal(resumedPlayer.x, 9);
	assert.equal(resumedPlayer.passageShards, 1);
	assert.equal(resumedPlayer.sharedLight, 2);
	assert.equal(
		response(second, 'journey.road-changed').payload.road.players.length,
		2
	);
});
