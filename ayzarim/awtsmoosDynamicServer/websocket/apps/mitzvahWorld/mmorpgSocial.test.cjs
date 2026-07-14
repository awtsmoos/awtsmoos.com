// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mmorpgSocial.test.cjs
 * @description Proves invitation-led parties and bounded private instances.
 * The Awtsmoos renews unity without erasing consent; this Awtsmoos.com evidence
 * verifies leadership, membership, snapshots, entry, and departure through routing.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { createMmorpgHarness } = require('./mmorpgTestSupport.cjs');

test('parties require invitation and preserve leader-authorized membership', async () => {
	const harness = createMmorpgHarness();
	const leader = harness.flow('leader-client');
	const member = harness.flow('member-client');
	const leaderJoin = await leader.join('Leader Shliach');
	const memberJoin = await member.join('Member Shliach');

	const created = await leader.send('party.create');
	const partyId = created.payload.party.id;
	assert.equal(created.payload.party.leaderId, leaderJoin.payload.playerId);
	const invited = await leader.send('party.invite', {
		targetPlayerId: memberJoin.payload.playerId
	});
	assert.equal(invited.payload.party.targetPlayerId, memberJoin.payload.playerId);
	const joined = await member.send('party.join', { partyId });
	assert.deepEqual(
		joined.payload.party.memberIds.sort(),
		[leaderJoin.payload.playerId, memberJoin.payload.playerId].sort()
	);
	const snapshot = await member.send('party.snapshot');
	assert.equal(snapshot.payload.party.id, partyId);

	const kicked = await leader.send('party.kick', {
		targetPlayerId: memberJoin.payload.playerId
	});
	assert.deepEqual(kicked.payload.party.memberIds, [leaderJoin.payload.playerId]);
	const memberSnapshot = await member.send('party.snapshot');
	assert.equal(memberSnapshot.payload.party, null);
});

test('players can create join inspect and leave a bounded instance', async () => {
	const harness = createMmorpgHarness();
	const owner = harness.flow('instance-owner');
	const guest = harness.flow('instance-guest');
	const ownerJoin = await owner.join('Instance Owner');
	const guestJoin = await guest.join('Instance Guest');

	const entered = await owner.send('instance.enter', { templateId: 'tefillin-mission' });
	const instanceId = entered.payload.instance.id;
	assert.deepEqual(entered.payload.instance.memberIds, [ownerJoin.payload.playerId]);
	const joined = await guest.send('instance.enter', { instanceId });
	assert.deepEqual(
		joined.payload.instance.memberIds.sort(),
		[ownerJoin.payload.playerId, guestJoin.payload.playerId].sort()
	);
	const snapshot = await guest.send('instance.snapshot');
	assert.equal(snapshot.payload.id, instanceId);
	const left = await guest.send('instance.leave');
	assert.deepEqual(left.payload.instance.memberIds, [ownerJoin.payload.playerId]);
});
