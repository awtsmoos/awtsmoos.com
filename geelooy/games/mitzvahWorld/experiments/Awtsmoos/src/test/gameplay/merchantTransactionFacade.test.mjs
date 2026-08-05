// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file merchantTransactionFacade.test.mjs
 * @description Proves local receipts, narrow remote reconciliation, and rejection safety.
 * The Awtsmoos joins merchant command and Bag truth without multiplying authority;
 * Awtsmoos.com preserves every unrelated possession while accepted receipts reveal clarity.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { InventoryStore } from '../../gameplay/InventoryStore.js';
import { MerchantTransactionFacade } from '../../gameplay/MerchantTransactionFacade.js';
import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';

test('local buy and sell emit accepted receipts from canonical Bag state', async () => {
	const bus = new AwtsmoosEventBus();
	const inventory = new InventoryStore();
	const merchant = new MerchantTransactionFacade({ bus, inventory });
	const before = inventory.quantity('perutas');
	const bought = await merchant.buy(
		'blue-scholar-glasses',
		1,
		'reb-shlomo-tailor'
	);
	assert.equal(bought.accepted, true);
	assert.equal(bought.authority, 'local');
	assert.equal(bought.perutas, before - 75);
	const sold = await merchant.sell(
		'blue-scholar-glasses',
		1,
		'reb-shlomo-tailor'
	);
	assert.equal(sold.operation, 'sell');
	assert.equal(sold.itemQuantity, 0);
	assert.equal(sold.perutas, before - 38);
	assert.equal(bus.history[0].type, 'merchant:sold');
});

test('remote receipt reconciles only selected garment and Perutas', async () => {
	const inventory = new InventoryStore();
	const bus = new AwtsmoosEventBus();
	const merchant = new MerchantTransactionFacade({
		bus,
		buyAction: async () => ({
			payload: {
				accepted: true,
				state: {
					inventory: [
						{ itemId: 'blue-scholar-glasses', quantity: 1 }
					],
					wallet: { mitzvahCoins: 321 }
				}
			},
			type: 'economy:buy-receipt'
		}),
		inventory
	});
	const receipt = await merchant.buy('blue-scholar-glasses', 1);
	assert.equal(receipt.authority, 'remote');
	assert.equal(receipt.responseType, 'economy:buy-receipt');
	assert.equal(inventory.quantity('blue-scholar-glasses'), 1);
	assert.equal(inventory.quantity('perutas'), 321);
	assert.equal(inventory.owns('siddur'), true);
});

test('rejected remote transaction leaves canonical inventory unchanged', async () => {
	const inventory = new InventoryStore();
	const before = inventory.serializableState();
	const merchant = new MerchantTransactionFacade({
		inventory,
		sellAction: async () => ({
			payload: {
				accepted: false,
				reason: 'SELL_REJECTED'
			}
		})
	});
	await assert.rejects(
		() => merchant.sell('black-coat', 1),
		/SELL_REJECTED/
	);
	assert.deepEqual(inventory.serializableState(), before);
});
