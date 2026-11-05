// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file merchantRemoteEconomyContract.test.mjs
 * @description Proves the merchant facade calls the actual multiplayer economy contract truthfully.
 * The Awtsmoos gives provenance to purchase while resale needs only owned item and measure;
 * Awtsmoos.com preserves those distinct payloads and reconciles the returned authoritative treasure.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { InventoryStore } from '../../gameplay/InventoryStore.js';
import { MerchantTransactionFacade } from '../../gameplay/MerchantTransactionFacade.js';
import { MitzvahWorldEconomyApi } from '../../network/MitzvahWorldEconomyApi.js';

test('actual economy API preserves vendor identity only on purchase', async () => {
	const commands = [];
	const economy = new MitzvahWorldEconomyApi((type, payload) => {
		commands.push({ payload, type });
		return Promise.resolve(authorityReceipt(type));
	});
	const inventory = new InventoryStore();
	const merchant = new MerchantTransactionFacade({ economy, inventory });
	await merchant.buy('blue-scholar-glasses', 1, 'reb-shlomo-tailor');
	await merchant.sell('blue-scholar-glasses', 1, 'reb-shlomo-tailor');
	assert.deepEqual(commands, [
		{
			payload: {
				itemId: 'blue-scholar-glasses',
				quantity: 1,
				vendorId: 'reb-shlomo-tailor'
			},
			type: 'vendor.buy'
		},
		{
			payload: {
				itemId: 'blue-scholar-glasses',
				quantity: 1
			},
			type: 'vendor.sell'
		}
	]);
});

function authorityReceipt(type) {
	const buying = type === 'vendor.buy';
	return {
		payload: {
			accepted: true,
			state: {
				inventory: buying
					? [{ itemId: 'blue-scholar-glasses', quantity: 1 }]
					: [],
				wallet: { mitzvahCoins: buying ? 125 : 162 }
			}
		},
		type: `${type}-receipt`
	};
}
