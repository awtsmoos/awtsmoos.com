// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEconomyCommunity.test.mjs
 * @description Proves nested browser economy and community facades through routing.
 * The Awtsmoos renews value, words, and community beneath one client vessel;
 * Awtsmoos.com verifies readable browser methods reach authoritative private state.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MitzvahWorldRealtimeClient } from '../network/MitzvahWorldRealtimeClient.js';
import { createBridgeHarness } from './MitzvahWorldClientBridge.mjs';

test('browser economy and community facades execute private persistent commands', async () => {
	const harness = createBridgeHarness({ clock: () => 888_000 });
	const first = new MitzvahWorldRealtimeClient(harness.createSocket('economy-browser-first'));
	const second = new MitzvahWorldRealtimeClient(harness.createSocket('economy-browser-second'));
	const firstJoin = await first.join('Browser Merchant');
	const secondJoin = await second.join('Browser Friend');

	await first.mmorpg.economy.buy('wooden-token', 2);
	await first.mmorpg.economy.buy('wool-thread', 1);
	const crafted = await first.mmorpg.economy.craft('community-badge');
	assert.equal(quantity(crafted.payload.state, 'community-badge'), 1);

	const trade = await first.mmorpg.economy.createTrade(secondJoin.payload.playerId);
	await first.mmorpg.economy.offerTrade(trade.payload.trade.id, {
		itemId: 'community-badge',
		quantity: 1
	});
	await second.mmorpg.economy.offerTrade(trade.payload.trade.id, { coins: 9 });
	await first.mmorpg.economy.acceptTrade(trade.payload.trade.id);
	const settled = await second.mmorpg.economy.acceptTrade(trade.payload.trade.id);
	assert.equal(settled.payload.settlement.settled, true);
	assert.equal(quantity((await second.mmorpg.economy.balance()).payload, 'community-badge'), 1);

	await first.mmorpg.community.sendMail(
		secondJoin.payload.playerId,
		'Browser Mail',
		'This traveled through the community facade.'
	);
	assert.equal((await second.mmorpg.community.mailSnapshot()).payload.mailbox.length, 1);
	const guild = await first.mmorpg.community.createGuild('Browser Shluchim');
	await first.mmorpg.community.inviteToGuild(secondJoin.payload.playerId);
	await second.mmorpg.community.joinGuild(guild.payload.guild.id);
	assert.equal((await second.mmorpg.community.guildSnapshot()).payload.guild.memberIds.length, 2);
	assert.equal(firstJoin.payload.playerId !== secondJoin.payload.playerId, true);
});

function quantity(state, itemId) {
	return state.inventory.find(item => item.itemId === itemId)?.quantity || 0;
}
