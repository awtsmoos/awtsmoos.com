// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mmorpgPersistence.test.cjs
 * @description Proves equipment, party, and instance recovery after server replacement.
 * The Awtsmoos renews process and world without erasing lawful bonds; Awtsmoos.com
 * therefore restores possessions and cooperative membership beside reconnect identity.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { MemoryWorldPersistence } = require('./MemoryWorldPersistence.js');
const { createTokenFactory } = require('./sessionTestSupport.cjs');
const { createMmorpgHarness } = require('./mmorpgTestSupport.cjs');

test('persistent social state survives directory replacement and reconnect', async () => {
	const persistence = new MemoryWorldPersistence();
	const options = {
		clock: () => 20_000,
		gracePeriodMs: 10_000,
		persistence,
		tokenFactory: createTokenFactory()
	};
	const first = createMmorpgHarness(options);
	const leader = first.flow('persistent-leader');
	const member = first.flow('persistent-member');
	const leaderJoin = await leader.join('Persistent Leader');
	const memberJoin = await member.join('Persistent Member');

	await leader.send('player.equipment', {
		itemId: 'siddur',
		operation: 'equip'
	});
	const created = await leader.send('party.create');
	await leader.send('party.invite', {
		targetPlayerId: memberJoin.payload.playerId
	});
	await member.send('party.join', { partyId: created.payload.party.id });
	const entered = await leader.send('instance.enter', { templateId: 'private-mission' });
	await member.send('instance.enter', { instanceId: entered.payload.instance.id });
	await first.platform.disconnect(leader.client);
	await first.platform.disconnect(member.client);

	const second = createMmorpgHarness(options);
	const resumedLeader = second.flow('resumed-leader');
	const resumedMember = second.flow('resumed-member');
	const leaderResume = await resumedLeader.send('world.join', {
		resumeToken: leaderJoin.payload.session.resumeToken
	});
	await resumedMember.send('world.join', {
		resumeToken: memberJoin.payload.session.resumeToken
	});
	assert.equal(leaderResume.payload.playerId, leaderJoin.payload.playerId);

	const equipment = await resumedLeader.send('player.equipment', {
		operation: 'snapshot'
	});
	assert.equal(equipment.payload.equipment.hand, 'siddur');
	const party = await resumedMember.send('party.snapshot');
	assert.deepEqual(
		party.payload.party.memberIds.sort(),
		[leaderJoin.payload.playerId, memberJoin.payload.playerId].sort()
	);
	const instance = await resumedMember.send('instance.snapshot');
	assert.deepEqual(
		instance.payload.memberIds.sort(),
		[leaderJoin.payload.playerId, memberJoin.payload.playerId].sort()
	);
});
