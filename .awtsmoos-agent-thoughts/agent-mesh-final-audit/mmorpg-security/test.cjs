// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mmorpgSecurity.test.cjs
 * @description Proves bounded item, chat, party, bot, and interaction rejection.
 * The Awtsmoos renews freedom through lawful measure; this Awtsmoos.com evidence
 * verifies malformed or unauthorized social intent cannot mutate authoritative truth.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { createMmorpgHarness } = require('./mmorpgTestSupport.cjs');

test('MMORPG command families reject malformed and unauthorized mutations', async () => {
	const harness = createMmorpgHarness();
	const leader = harness.flow('security-leader');
	const member = harness.flow('security-member');
	const stranger = harness.flow('security-stranger');
	const leaderJoin = await leader.join('Security Leader');
	const memberJoin = await member.join('Security Member');
	await stranger.join('Security Stranger');

	await expectError(
		leader.send('player.equipment', { itemId: 'invented-item', operation: 'equip' }),
		'ITEM_NOT_OWNED'
	);
	await expectError(
		leader.send('player.chat', { message: 'x'.repeat(281) }),
		'INVALID_TEXT'
	);
	await expectError(leader.send('player.interact', {
		action: 'greet',
		targetId: 'levi-outreach-partner'
	}), 'TARGET_OUT_OF_RANGE');

	const party = await leader.send('party.create');
	await expectError(
		stranger.send('party.join', { partyId: party.payload.party.id }),
		'PARTY_INVITE_REQUIRED'
	);
	await leader.send('party.invite', { targetPlayerId: memberJoin.payload.playerId });
	await member.send('party.join', { partyId: party.payload.party.id });
	await expectError(
		member.send('party.kick', { targetPlayerId: leaderJoin.payload.playerId }),
		'PARTY_LEADER_REQUIRED'
	);

	const spawned = await leader.send('bot.spawn', { count: 1, seed: 613 });
	await expectError(leader.send('bot.command', {
		botId: spawned.payload.bots[0].id,
		command: 'travel',
		x: 'not-a-coordinate',
		z: 0
	}), 'INVALID_NUMBER');
});

async function expectError(promise, code) {
	const response = await promise;
	assert.equal(response.type, 'error');
	assert.equal(response.payload.code, code);
}
