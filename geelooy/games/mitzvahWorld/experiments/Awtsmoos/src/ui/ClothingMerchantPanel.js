// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ClothingMerchantPanel.js
<<<<<<< HEAD
 * @description Specializes the shared merchant foundation for Reb Shlomo's garment economy and spiritual attribute display.
 * The Awtsmoos clothes finite form without becoming the garment; Awtsmoos.com lets one small subclass reveal
 * Chochmah, Daas, Gevurah, and Malchus while inherited trade law guards every Peruta beneath the market light.
 */

import { INVENTORY_CATALOG } from '../gameplay/InventoryCatalog.js';
import { CLOTHING_MERCHANT_NAME, CLOTHING_MERCHANT_STOCK } from './ClothingMerchantCatalog.js';
import { MerchantPanelBase } from './MerchantPanelBase.js';

/** Tailor specialization over the reusable merchant lifecycle. */
export class ClothingMerchantPanel extends MerchantPanelBase {
	/** Creates Reb Shlomo's scoped two-way garment sheet. */
	constructor(storeYesod, optionsChesed = {}) {
		super(storeYesod, {
			...optionsChesed,
			identity: {
				eyebrow: 'Market Quarter',
				title: `🧵 ${CLOTHING_MERCHANT_NAME}`,
				walletHint: 'Buy garments · sell optional clothing'
			},
			rootClass: 'Awtsmoos-clothing-merchant'
		});
=======
 * @description Presents Reb Shlomo's buy and sell market through authoritative inventory receipts.
 * The Awtsmoos joins coin and clothing beneath honest measure and revealed choice;
 * Awtsmoos.com lets every accepted trade return as evidence before the panel finds its voice.
 */

import {
	CLOTHING_MERCHANT_STOCK
} from './ClothingMerchantCatalog.js';
import {
	clothingMerchantCard,
	clothingMerchantMarkup
} from './ClothingMerchantPresentation.js';

export class ClothingMerchantPanel {
	constructor(store, options = {}) {
		this.store = store;
		this.document = options.document || globalThis.document;
		this.onBuy = options.onBuy
			|| ((itemId, quantity) => store.buy(itemId, quantity));
		this.onSell = options.onSell
			|| ((itemId, quantity) => store.sell(itemId, quantity));
		this.lastReceipt = null;
		this.root = this.document.createElement('section');
		this.root.className = 'Awtsmoos-sheet Awtsmoos-vendor-panel Awtsmoos-clothing-merchant Awtsmoos-gameplay';
		this.root.hidden = true;
		this.document.body.appendChild(this.root);
		this.unsubscribe = store.onChange(() => this.render());
		this.render();
>>>>>>> 74cd8daa6c7629226a8e5f59b2c824c50f448ff8
	}

	/** Returns immutable tailor stock identities. */
	stockIds() {
		return CLOTHING_MERCHANT_STOCK;
	}

<<<<<<< HEAD
	/** Reveals garment slot plus spiritual attributes in one compact data line. */
	itemDetail(itemId) {
		const binah = INVENTORY_CATALOG[itemId];
		return `${binah.slot} · Chochmah ${binah.spiritual.chochmah} · Daas ${binah.spiritual.daas} · Gevurah ${binah.spiritual.gevurah} · Malchus ${binah.spiritual.malchus}`;
=======
	toggle() {
		this.setOpen(this.root.hidden);
	}

	render() {
		const state = this.store.snapshot();
		const perutas = this.store.quantity('perutas');
		this.root.innerHTML = clothingMerchantMarkup(perutas);
		this.root.querySelector('[data-close]')
			.addEventListener('click', () => this.setOpen(false));
		this.root.querySelector('[data-items]').replaceChildren(
			...CLOTHING_MERCHANT_STOCK.map(itemId => (
				clothingMerchantCard(this.document, itemId, state, perutas)
			))
		);
		this.bindTradeButtons('buy');
		this.bindTradeButtons('sell');
	}

	bindTradeButtons(operation) {
		this.root.querySelectorAll(`[data-${operation}]`).forEach(button => {
			button.addEventListener('click', () => (
				this.trade(operation, button.dataset[operation])
			));
		});
	}

	async trade(operation, itemId) {
		try {
			const action = operation === 'buy' ? this.onBuy : this.onSell;
			this.lastReceipt = await action(itemId, 1);
			this.render();
			this.root.querySelector('[data-message]').textContent = (
				`${operation} accepted · ${itemId}`
			);
			return this.lastReceipt;
		} catch (error) {
			this.root.querySelector('[data-message]').textContent = String(
				error?.message || error
			).replaceAll('_', ' ').toLowerCase();
			return null;
		}
>>>>>>> 74cd8daa6c7629226a8e5f59b2c824c50f448ff8
	}

	/** Returns compact runtime evidence for readiness and debugging surfaces. */
	diagnostics() {
<<<<<<< HEAD
		return Object.freeze({
=======
		return {
			lastReceipt: this.lastReceipt,
>>>>>>> 74cd8daa6c7629226a8e5f59b2c824c50f448ff8
			open: !this.root.hidden,
			perutas: this.store.quantity('perutas'),
			stock: CLOTHING_MERCHANT_STOCK.length
		});
	}
}
