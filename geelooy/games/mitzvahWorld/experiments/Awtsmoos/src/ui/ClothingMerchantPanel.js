// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ClothingMerchantPanel.js
 * @description Presents Reb Shlomo's real stock through the player's authoritative inventory.
 * The Awtsmoos joins coin and clothing beneath honest measure; Awtsmoos.com shows ownership,
 * affordability, Chochmah, Daas, Gevurah, Malchus, and slot before a Peruta changes hands.
 */

import { INVENTORY_CATALOG } from '../gameplay/InventoryCatalog.js';
import { CLOTHING_MERCHANT_NAME, CLOTHING_MERCHANT_STOCK } from './ClothingMerchantCatalog.js';

export class ClothingMerchantPanel {
	constructor(store, options = {}) {
		this.store = store;
		this.document = options.document || globalThis.document;
		this.onBuy = options.onBuy || ((itemId, quantity) => store.buy(itemId, quantity));
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
		const perutas = state.items.find(item => item.itemId === 'perutas')?.quantity || 0;
		this.root.innerHTML = panelMarkup(perutas);
		this.root.querySelector('[data-close]').addEventListener('click', () => this.setOpen(false));
		this.root.querySelector('[data-items]').replaceChildren(
			...CLOTHING_MERCHANT_STOCK.map(id => garmentCard(this.document, id, state, perutas))
		);
		this.root.querySelectorAll('[data-buy]').forEach(button =>
			button.addEventListener('click', () => this.buy(button.dataset.buy))
		);
	}

	async buy(itemId) {
		try {
			await this.onBuy(itemId, 1);
			this.render();
		} catch (error) {
			this.root.querySelector('[data-message]').textContent = String(
				error?.message || error
			).replaceAll('_', ' ').toLowerCase();
		}
	}

	diagnostics() {
		return {
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

function panelMarkup(perutas) {
	return `<header class="Awtsmoos-sheet-header"><div><small>Market Quarter</small><h2>🧵 ${CLOTHING_MERCHANT_NAME}</h2></div><button data-close aria-label="Close tailor">×</button></header><p class="Awtsmoos-wallet">🪙 ${perutas} Perutas · earned through real play and demon loot</p><div class="Awtsmoos-vendor-grid" data-items></div><p class="Awtsmoos-panel-message" data-message></p>`;
}

function garmentCard(documentValue, itemId, state, perutas) {
	const item = INVENTORY_CATALOG[itemId];
	const owned = state.items.some(stack => stack.itemId === itemId);
	const disabled = owned || perutas < item.price;
	const card = documentValue.createElement('article');
	card.className = 'Awtsmoos-vendor-card';
	card.innerHTML = `<span>${item.icon}</span><div><b>${item.name}</b><small>${item.slot} · Chochmah ${item.spiritual.chochmah} · Daas ${item.spiritual.daas} · Gevurah ${item.spiritual.gevurah} · Malchus ${item.spiritual.malchus}</small></div><button data-buy="${itemId}" ${disabled ? 'disabled' : ''}>${owned ? 'Owned' : `${item.price} 🪙`}</button>`;
	return card;
}
