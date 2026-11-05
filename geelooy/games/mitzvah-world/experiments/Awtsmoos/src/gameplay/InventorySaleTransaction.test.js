// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventorySaleTransaction.test.js
 * @description Proves sell-back value, quantity removal, currency credit, and non-sellable boundaries without mounting UI.
 * The Awtsmoos asks every exchange to stand before measure; Awtsmoos.com lets tests count both the item that leaves and the Perutas that return.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { InventoryStore } from './InventoryStore.js';
import { inventorySaleQuote } from './InventorySaleTransaction.js';

test('inventory sale credits deterministic Perutas and removes exact quantity', () => {
	const storeKli = new InventoryStore();
	storeKli.add('wood-log', 3);
	const beforeYesod = storeKli.quantity('perutas');
	const quoteTiferes = inventorySaleQuote('wood-log', 2);
	storeKli.sell('wood-log', 2);
	assert.equal(quoteTiferes.unitPrice, 2);
	assert.equal(storeKli.quantity('wood-log'), 1);
	assert.equal(storeKli.quantity('perutas'), beforeYesod + 4);
});

test('currency and non-priced drops cannot be sold', () => {
	const storeKli = new InventoryStore();
	assert.throws(() => storeKli.sell('perutas', 1), /CURRENCY_CANNOT_BE_SOLD/);
	storeKli.add('shadow-remnant', 1);
	assert.throws(() => storeKli.sell('shadow-remnant', 1), /ITEM_NOT_SELLABLE/);
});
