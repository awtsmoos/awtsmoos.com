// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file economyCrafting.test.cjs
 * @description Proves private wallet, vendor, recipe, crafting, and replay behavior.
 * The Awtsmoos renews material and value through measured law; Awtsmoos.com
 * verifies every purchase, sale, and craft through the public versioned router.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { createMmorpgHarness } = require('./mmorpgTestSupport.cjs');

test('vendor and crafting mutations remain authoritative and private', async () => {
	const harness = createMmorpgHarness();
	const player = harness.flow('economy-player');
	const joined = await player.join('Economy Shliach');
	const publicPlayer = joined.payload.world.players.find(item => item.id === joined.payload.playerId);
	assert.equal('wallet' in publicPlayer, false);
	assert.equal('mailbox' in publicPlayer, false);
	assert.equal('inventory' in publicPlayer, false);

	const balance = await player.send('economy.balance');
	assert.equal(balance.payload.wallet.mitzvahCoins, 100);
	await player.send('vendor.buy', { itemId: 'wooden-token', quantity: 2 });
	const materials = await player.send('vendor.buy', {
		itemId: 'wool-thread',
		quantity: 1
	});
	assert.equal(materials.payload.state.wallet.mitzvahCoins, 82);

	const recipes = await player.send('craft.recipes');
	assert.equal(recipes.payload.recipes[0].id, 'community-badge');
	const crafted = await player.send('craft.execute', {
		count: 1,
		recipeId: 'community-badge'
	});
	assert.equal(quantity(crafted.payload.state, 'community-badge'), 1);
	assert.equal(quantity(crafted.payload.state, 'wooden-token'), 0);
	assert.equal(quantity(crafted.payload.state, 'wool-thread'), 0);

	const sold = await player.send('vendor.sell', {
		itemId: 'community-badge',
		quantity: 1
	});
	assert.equal(sold.payload.state.wallet.mitzvahCoins, 107);
	assert.equal(quantity(sold.payload.state, 'community-badge'), 0);

	const beforeFailure = await player.send('economy.balance');
	const failed = await player.send('vendor.buy', {
		itemId: 'travel-pack',
		quantity: 99
	});
	assert.equal(failed.type, 'error');
	assert.equal(failed.payload.code, 'INSUFFICIENT_FUNDS');
	const afterFailure = await player.send('economy.balance');
	assert.deepEqual(afterFailure.payload, beforeFailure.payload);
});

function quantity(state, itemId) {
	return state.inventory.find(item => item.itemId === itemId)?.quantity || 0;
}
