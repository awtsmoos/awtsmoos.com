// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file economyCommunitySecurity.test.cjs
 * @description Proves economic and community commands reject unauthorized mutation.
 * The Awtsmoos renews value and community through measured law; Awtsmoos.com
 * verifies failed validation leaves wallets, inventories, mail, and guilds unchanged.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { createMmorpgHarness } = require('./mmorpgTestSupport.cjs');

test('economy and community failures preserve authoritative state', async () => {
	const harness = createMmorpgHarness();
	const first = harness.flow('secure-economy-first');
	const second = harness.flow('secure-economy-second');
	const outsider = harness.flow('secure-economy-outsider');
	const firstJoin = await first.join('Secure First');
	const secondJoin = await second.join('Secure Second');
	await outsider.join('Secure Outsider');

	const initial = await first.send('economy.balance');
	await expectError(first.send('vendor.buy', {
		itemId: 'travel-pack',
		quantity: 99
	}), 'INSUFFICIENT_FUNDS');
	await expectError(first.send('craft.execute', {
		count: 1,
		recipeId: 'community-badge'
	}), 'CRAFTING_INGREDIENTS_MISSING');
	assert.deepEqual((await first.send('economy.balance')).payload, initial.payload);

	const trade = await first.send('trade.create', {
		targetPlayerId: secondJoin.payload.playerId
	});
	const tradeId = trade.payload.trade.id;
	await first.send('trade.offer', {
		itemId: 'siddur',
		quantity: 1,
		tradeId
	});
	await second.send('trade.offer', { coins: 1000, tradeId });
	await first.send('trade.accept', { tradeId });
	await expectError(second.send('trade.accept', { tradeId }), 'TRADE_FUNDS_UNAVAILABLE');
	assert.equal((await first.send('economy.balance')).payload.wallet.mitzvahCoins, 100);
	assert.equal((await second.send('economy.balance')).payload.wallet.mitzvahCoins, 100);

	await expectError(first.send('mail.send', {
		body: 'x'.repeat(1001),
		subject: 'Too long',
		targetPlayerId: secondJoin.payload.playerId
	}), 'INVALID_TEXT');
	assert.equal((await second.send('mail.snapshot')).payload.mailbox.length, 0);

	const guild = await first.send('guild.create', { name: 'Secure Guild' });
	await expectError(outsider.send('guild.join', {
		guildId: guild.payload.guild.id
	}), 'GUILD_INVITE_REQUIRED');
	assert.equal((await outsider.send('guild.snapshot')).payload.guild, null);
	assert.equal(firstJoin.payload.playerId !== secondJoin.payload.playerId, true);
});

async function expectError(promise, code) {
	const response = await promise;
	assert.equal(response.type, 'error');
	assert.equal(response.payload.code, code);
}
