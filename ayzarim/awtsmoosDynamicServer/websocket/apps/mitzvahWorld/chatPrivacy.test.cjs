// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chatPrivacy.test.cjs
 * @description Proves private, party, and guild communication cannot cross boundaries.
 * The Awtsmoos renews each relationship within its rightful vessel; Awtsmoos.com
 * verifies global addresses, sender-target privacy, membership, and history isolation.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { createMmorpgHarness } = require('./mmorpgTestSupport.cjs');

test('private messages reach only sender and globally addressed target', async () => {
	const harness = createMmorpgHarness({ clock: () => 800_000 });
	const sender = harness.flow('private-sender');
	const target = harness.flow('private-target');
	const unrelated = harness.flow('private-unrelated');
	const senderJoin = await sender.join('Sender');
	const targetJoin = await target.join('Target', 'quiet-village');
	const unrelatedJoin = await unrelated.join('Unrelated');
	clearEvents(sender, target, unrelated);

	const sent = await sender.send('chat.send', {
		message: 'A private cross-world message.',
		scope: 'private',
		targetPlayerId: targetJoin.payload.playerAddress
	});
	assert.equal(sent.type, 'chat.sent');
	assert.equal(sender.latest('chat.private').payload.id, sent.payload.id);
	assert.equal(target.latest('chat.private').payload.id, sent.payload.id);
	assert.equal(unrelated.latest('chat.private'), null);
	assert.equal(sent.payload.to, targetJoin.payload.playerAddress);

	const senderHistory = await sender.send('chat.history', {
		scope: 'private',
		targetPlayerId: targetJoin.payload.playerAddress
	});
	const targetHistory = await target.send('chat.history', {
		scope: 'private',
		targetPlayerId: senderJoin.payload.playerAddress
	});
	assert.deepEqual(senderHistory.payload.messages, targetHistory.payload.messages);
	assert.equal(senderHistory.payload.messages.length, 1);

	const invalid = await unrelated.send('chat.history', {
		scope: 'private',
		targetPlayerId: unrelatedJoin.payload.playerAddress
	});
	assert.equal(invalid.type, 'error');
	assert.equal(invalid.payload.code, 'CHAT_PRIVATE_TARGET_INVALID');
});

test('party and guild chat require membership and reach attached members only', async () => {
	const harness = createMmorpgHarness({ clock: () => 900_000 });
	const leader = harness.flow('community-leader');
	const member = harness.flow('community-member');
	const outsider = harness.flow('community-outsider');
	const memberJoin = await member.join('Member');
	await leader.join('Leader');
	await outsider.join('Outsider', 'quiet-village');

	const party = await leader.send('party.create');
	await leader.send('party.invite', { targetPlayerId: memberJoin.payload.playerId });
	await member.send('party.join', { partyId: party.payload.party.id });
	clearEvents(leader, member, outsider);
	const partyChat = await leader.send('chat.send', { message: 'Party only', scope: 'party' });
	assert.equal(member.latest('chat.message').payload.id, partyChat.payload.id);
	assert.equal(outsider.latest('chat.message'), null);

	const guild = await leader.send('guild.create', { name: 'Light Bearers' });
	await leader.send('guild.invite', { targetPlayerId: memberJoin.payload.playerId });
	await member.send('guild.join', { guildId: guild.payload.guild.id });
	clearEvents(leader, member, outsider);
	const guildChat = await member.send('chat.send', { message: 'Guild only', scope: 'guild' });
	assert.equal(leader.latest('chat.message').payload.id, guildChat.payload.id);
	assert.equal(outsider.latest('chat.message'), null);

	const denied = await outsider.send('chat.send', { message: 'No party', scope: 'party' });
	assert.equal(denied.type, 'error');
	assert.equal(denied.payload.code, 'PARTY_REQUIRED');
});

function clearEvents(...flows) {
	for (const flow of flows) flow.client.messages.length = 0;
}
