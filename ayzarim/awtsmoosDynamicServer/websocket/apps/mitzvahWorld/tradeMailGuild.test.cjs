// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tradeMailGuild.test.cjs
 * @description Proves atomic private trade, persistent mail, and invitation-led guilds.
 * The Awtsmoos renews exchange, words, and community through mutual consent;
 * Awtsmoos.com verifies participant-only events and leader-authorized membership.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { createMmorpgHarness } = require('./mmorpgTestSupport.cjs');

test('two-player trade settles atomically and remains participant-private', async () => {
	const harness = createMmorpgHarness();
	const first = harness.flow('trade-first');
	const second = harness.flow('trade-second');
	const observer = harness.flow('trade-observer');
	const firstJoin = await first.join('Trade First');
	const secondJoin = await second.join('Trade Second');
	await observer.join('Trade Observer');
	await first.send('vendor.buy', { itemId: 'wooden-token', quantity: 1 });

	const created = await first.send('trade.create', {
		targetPlayerId: secondJoin.payload.playerId
	});
	const tradeId = created.payload.trade.id;
	await first.send('trade.offer', {
		itemId: 'wooden-token',
		quantity: 1,
		tradeId
	});
	await second.send('trade.offer', { coins: 7, tradeId });
	await first.send('trade.accept', { tradeId });
	const settled = await second.send('trade.accept', { tradeId });
	assert.equal(settled.payload.settlement.settled, true);
	assert.equal(settled.payload.settlement.state.wallet.mitzvahCoins, 93);
	const firstState = await first.send('economy.balance');
	assert.equal(firstState.payload.wallet.mitzvahCoins, 102);
	assert.equal(quantity(firstState.payload, 'wooden-token'), 0);
	const secondState = await second.send('economy.balance');
	assert.equal(quantity(secondState.payload, 'wooden-token'), 1);
	assert.equal(observer.latest('trade.changed'), null);
	assert.notEqual(firstJoin.payload.playerId, secondJoin.payload.playerId);
});

test('mail and guild data reach only intended players and obey authority', async () => {
	const harness = createMmorpgHarness({ clock: () => 613_613 });
	const leader = harness.flow('guild-leader');
	const member = harness.flow('guild-member');
	const outsider = harness.flow('guild-outsider');
	const leaderJoin = await leader.join('Guild Leader');
	const memberJoin = await member.join('Guild Member');
	await outsider.join('Guild Outsider');

	const sent = await leader.send('mail.send', {
		body: 'Please join our learning circle.',
		subject: 'Invitation',
		targetPlayerId: memberJoin.payload.playerId
	});
	assert.equal(sent.payload.mail.sentAt, 613_613);
	assert.equal(member.latest('mail.received').payload.mail.subject, 'Invitation');
	assert.equal(outsider.latest('mail.received'), null);
	const mailbox = await member.send('mail.snapshot');
	assert.equal(mailbox.payload.mailbox.length, 1);
	await member.send('mail.delete', { mailId: mailbox.payload.mailbox[0].id });
	assert.equal((await member.send('mail.snapshot')).payload.mailbox.length, 0);

	const created = await leader.send('guild.create', { name: 'Village Shluchim' });
	const guildId = created.payload.guild.id;
	await leader.send('guild.invite', {
		targetPlayerId: memberJoin.payload.playerId
	});
	await member.send('guild.join', { guildId });
	const snapshot = await member.send('guild.snapshot');
	assert.deepEqual(
		snapshot.payload.guild.memberIds.sort(),
		[leaderJoin.payload.playerId, memberJoin.payload.playerId].sort()
	);
	const denied = await member.send('guild.kick', {
		targetPlayerId: leaderJoin.payload.playerId
	});
	assert.equal(denied.payload.code, 'GUILD_LEADER_REQUIRED');
});

function quantity(state, itemId) {
	return state.inventory.find(item => item.itemId === itemId)?.quantity || 0;
}
