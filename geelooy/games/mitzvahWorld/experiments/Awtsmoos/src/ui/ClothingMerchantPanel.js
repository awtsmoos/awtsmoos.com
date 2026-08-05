// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ClothingMerchantPanel.js
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
	}

	setOpen(open) {
		this.root.hidden = !Boolean(open);
		if (!this.root.hidden) this.render();
	}

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
	}

	diagnostics() {
		return {
			lastReceipt: this.lastReceipt,
			open: !this.root.hidden,
			perutas: this.store.quantity('perutas'),
			stock: CLOTHING_MERCHANT_STOCK.length
		};
	}

	destroy() {
		this.unsubscribe();
		this.root.remove();
	}
}
