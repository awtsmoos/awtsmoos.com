// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file clothingMerchantPresentation.test.mjs
 * @description Proves tailor buy and sell affordances reflect canonical ownership law.
 * The Awtsmoos reveals honest price and resale without confusing possession with display;
 * Awtsmoos.com keeps required garments protected while merchant stock remains clear each day.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	clothingMerchantMarkup,
	clothingMerchantTradeView
} from '../../ui/ClothingMerchantPresentation.js';

const STATE = Object.freeze({
	items: Object.freeze([
		Object.freeze({ itemId: 'blue-scholar-glasses', quantity: 1 }),
		Object.freeze({ itemId: 'walking-boots', quantity: 1 })
	])
});

test('owned merchant garment exposes lawful resale', () => {
	const view = clothingMerchantTradeView(
		'blue-scholar-glasses',
		STATE,
		200
	);
	assert.equal(view.owned, true);
	assert.equal(view.canBuy, false);
	assert.equal(view.canSell, true);
	assert.equal(view.resalePrice, 37);
});

test('required garment never exposes a sale action', () => {
	const view = clothingMerchantTradeView('walking-boots', STATE, 200);
	assert.equal(view.owned, true);
	assert.equal(view.canSell, false);
	assert.equal(view.resalePrice, 0);
});

test('unowned affordable stock remains buyable and panel shows wallet', () => {
	const view = clothingMerchantTradeView('velvet-top-hat', STATE, 200);
	assert.equal(view.owned, false);
	assert.equal(view.canBuy, true);
	assert.equal(view.canSell, false);
	const markup = clothingMerchantMarkup(200);
	assert.match(markup, /200 Perutas/);
	assert.match(markup, /Reb Shlomo/);
});
