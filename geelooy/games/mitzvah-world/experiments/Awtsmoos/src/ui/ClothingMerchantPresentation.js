// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ClothingMerchantPresentation.js
 * @description Projects garment ownership, price, resale, and spiritual traits into tailor cards.
 * The Awtsmoos clothes each finite choice with honest measure and visible light;
 * Awtsmoos.com lets buying and selling appear together without hiding the Bag's true might.
 */

import { INVENTORY_CATALOG } from '../gameplay/InventoryCatalog.js';
import { inventoryResaleQuote } from '../gameplay/InventorySaleRules.js';
import {
	CLOTHING_MERCHANT_NAME
} from './ClothingMerchantCatalog.js';

export function clothingMerchantMarkup(perutas) {
	return [
		'<header class="Awtsmoos-sheet-header">',
		'<div><small>Market Quarter</small>',
		`<h2>🧵 ${CLOTHING_MERCHANT_NAME}</h2></div>`,
		'<button data-close aria-label="Close tailor">×</button>',
		'</header>',
		`<p class="Awtsmoos-wallet">🪙 ${perutas} Perutas · `,
		'earned through real play and demon loot</p>',
		'<div class="Awtsmoos-vendor-grid" data-items></div>',
		'<p class="Awtsmoos-panel-message" data-message></p>'
	].join('');
}

export function clothingMerchantCard(documentValue, itemId, state, perutas) {
	const view = clothingMerchantTradeView(itemId, state, perutas);
	const card = documentValue.createElement('article');
	card.className = 'Awtsmoos-vendor-card';
	card.innerHTML = [
		`<span>${view.item.icon}</span>`,
		`<div><b>${view.item.name}</b>`,
		`<small>${view.item.slot} · Chochmah ${view.item.spiritual.chochmah} · `,
		`Daas ${view.item.spiritual.daas} · `,
		`Gevurah ${view.item.spiritual.gevurah} · `,
		`Malchus ${view.item.spiritual.malchus}</small></div>`,
		'<div class="Awtsmoos-vendor-actions">',
		buyButtonMarkup(itemId, view),
		sellButtonMarkup(itemId, view),
		'</div>'
	].join('');
	return card;
}

export function clothingMerchantTradeView(itemId, state, perutas) {
	const item = INVENTORY_CATALOG[itemId];
	const quantity = state.items
		.filter(stack => stack.itemId === itemId)
		.reduce((total, stack) => total + stack.quantity, 0);
	const sellable = !item.required && Number.isFinite(item.price);
	const resalePrice = sellable
		? inventoryResaleQuote(itemId).unitPrice
		: 0;
	return {
		canBuy: quantity === 0 && perutas >= item.price,
		canSell: quantity > 0 && sellable,
		item,
		owned: quantity > 0,
		quantity,
		resalePrice
	};
}

function buyButtonMarkup(itemId, view) {
	const disabled = view.canBuy ? '' : 'disabled';
	const label = view.owned ? 'Owned' : `${view.item.price} 🪙`;
	return `<button data-buy="${itemId}" ${disabled}>${label}</button>`;
}

function sellButtonMarkup(itemId, view) {
	const disabled = view.canSell ? '' : 'disabled';
	return [
		`<button data-sell="${itemId}" ${disabled}>`,
		`Sell ${view.resalePrice} 🪙`,
		'</button>'
	].join('');
}
