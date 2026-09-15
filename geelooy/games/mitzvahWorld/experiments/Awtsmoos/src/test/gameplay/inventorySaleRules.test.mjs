// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file inventorySaleRules.test.mjs
 * @description Proves current atomic sell-back value, equipment reconciliation, and canonical unsellable boundaries.
 * The Awtsmoos weighs garment and Peruta without phantom wealth; Awtsmoos.com measures the live transaction owner instead of an obsolete pricing facade.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { InventoryStore } from '../../gameplay/InventoryStore.js';
import { inventorySaleQuote } from '../../gameplay/InventorySaleTransaction.js';

test('owned merchant garment sells atomically and unequips', () => {
	const store = new InventoryStore({
		equipment: { coat: 'brown-kapote' },
		items: [
			{ itemId: 'brown-kapote', quantity: 1 },
			{ itemId: 'perutas', quantity: 10 }
		]
	});
	const before = store.quantity('perutas');
	const quote = inventorySaleQuote('brown-kapote', 1);
	assert.ok(quote.unitPrice > 0);
	store.sell('brown-kapote', 1);
	assert.equal(store.quantity('brown-kapote'), 0);
	assert.equal(store.quantity('perutas'), before + quote.total);
	assert.equal(store.snapshot().equipment.coat, undefined);
});

test('required garments, currency, and valueless quest items cannot sell', () => {
	const store = new InventoryStore();
	assert.throws(
		() => store.sell('walking-boots', 1),
		/REQUIRED_GARMENT_CANNOT_SELL/
	);
	assert.throws(
		() => store.sell('perutas', 1),
		/CURRENCY_CANNOT_BE_SOLD/
	);
	assert.throws(
		() => store.sell('quest-scroll', 1),
		/ITEM_NOT_SELLABLE/
	);
});

test('unowned merchandise cannot create resale value', () => {
	const store = new InventoryStore();
	const before = store.quantity('perutas');
	assert.throws(
		() => store.sell('blue-scholar-glasses', 1),
		/INSUFFICIENT_ITEM_QUANTITY/
	);
	assert.equal(store.quantity('perutas'), before);
});
