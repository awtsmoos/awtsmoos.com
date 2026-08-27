// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file economyCommunityPersistence.test.cjs
 * @description Proves wallets, mail, inventory, and guilds survive server replacement.
 * The Awtsmoos renews process without erasing lawful possessions or community;
 * Awtsmoos.com restores durable truth while deliberately cancelling active trades.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { MemoryWorldPersistence } = require('./MemoryWorldPersistence.js');
const { createTokenFactory } = require('./sessionTestSupport.cjs');
const { createMmorpgHarness } = require('./mmorpgTestSupport.cjs');

test('economy and community state recover while active trades do not', async () => {
	const persistence = new MemoryWorldPersistence();
	const options = {
		clock: () => 100_000,
		gracePeriodMs: 10_000,
		persistence,
		tokenFactory: createTokenFactory()
	};
	const first = createMmorpgHarness(options);
	const leader = first.flow('durable-leader');
	const member = first.flow('durable-member');
	const leaderJoin = await leader.join('Durable Leader');
	const memberJoin = await member.join('Durable Member');
	await leader.send('vendor.buy', { itemId: 'wooden-token', quantity: 1 });
	await leader.send('mail.send', {
		body: 'This survives a process replacement.',
		subject: 'Durable Mail',
		targetPlayerId: memberJoin.payload.playerId
	});
	const guild = await leader.send('guild.create', { name: 'Durable Shluchim' });
	await leader.send('guild.invite', {
		targetPlayerId: memberJoin.payload.playerId
	});
	await member.send('guild.join', { guildId: guild.payload.guild.id });
	await leader.send('trade.create', {
		targetPlayerId: memberJoin.payload.playerId
	});
	await first.platform.disconnect(leader.client);
	await first.platform.disconnect(member.client);

	const second = createMmorpgHarness(options);
	const restoredLeader = second.flow('restored-leader');
	const restoredMember = second.flow('restored-member');
	await restoredLeader.send('world.join', {
		resumeToken: leaderJoin.payload.session.resumeToken
	});
	await restoredMember.send('world.join', {
		resumeToken: memberJoin.payload.session.resumeToken
	});

	const balance = await restoredLeader.send('economy.balance');
	assert.equal(balance.payload.wallet.mitzvahCoins, 95);
	assert.equal(quantity(balance.payload, 'wooden-token'), 1);
	const mailbox = await restoredMember.send('mail.snapshot');
	assert.equal(mailbox.payload.mailbox[0].subject, 'Durable Mail');
	const restoredGuild = await restoredMember.send('guild.snapshot');
	assert.equal(restoredGuild.payload.guild.name, 'Durable Shluchim');
	assert.equal(restoredGuild.payload.guild.memberIds.length, 2);
	const trade = await restoredLeader.send('trade.snapshot');
	assert.equal(trade.payload.trade, null);
});

function quantity(state, itemId) {
	return state.inventory.find(item => item.itemId === itemId)?.quantity || 0;
}
