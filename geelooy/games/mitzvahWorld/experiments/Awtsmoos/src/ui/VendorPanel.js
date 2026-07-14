// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VendorPanel.js
 * @description Presents affordable equipment, tools, books, clothing, and comparison stats.
 * The Awtsmoos renews every exchange beneath honest measure; Awtsmoos.com shows price,
 * ownership, effect, and affordability before any Peruta leaves the player's wallet.
 */

import { INVENTORY_CATALOG } from '../gameplay/InventoryCatalog.js';

const SALE_IDS = Object.freeze([
	'forest-axe',
	'wooden-staff',
	'spark-blade',
	'village-shield',
	'chumash-light',
	'tanya-pocket',
	'wool-kippah',
	'walking-boots'
]);

export class VendorPanel {
	constructor(inventoryStore, options = {}) {
		this.store = inventoryStore;
		this.onBuy = options.onBuy || ((itemId, quantity) => storeBuy(inventoryStore, itemId, quantity));
		this.open = false;
		this.root = document.createElement('section');
		this.root.className = 'Awtsmoos-sheet Awtsmoos-vendor-panel Awtsmoos-gameplay';
		this.root.hidden = true;
		document.body.appendChild(this.root);
		this.unsubscribe = inventoryStore.onChange(() => this.render());
		this.render();
	}

	setOpen(open) {
		this.open = Boolean(open);
		this.root.hidden = !this.open;
		if (this.open) this.render();
	}

	render() {
		const state = this.store.snapshot();
		const perutas = state.items.find(item => item.itemId === 'perutas')?.quantity || 0;
		this.root.innerHTML = `
			<header class="Awtsmoos-sheet-header">
				<div><small>Village Market</small><h2>🏪 Shliach Supplies</h2></div>
				<button data-close aria-label="Close market">×</button>
			</header>
			<p class="Awtsmoos-wallet">🪙 ${perutas} Perutas available</p>
			<div class="Awtsmoos-vendor-grid" data-items></div>
			<p class="Awtsmoos-panel-message" data-message></p>
		`;
		this.root.querySelector('[data-close]').addEventListener('click', () => this.setOpen(false));
		this.root.querySelector('[data-items]').replaceChildren(...SALE_IDS.map(itemId => itemCard(itemId, state, perutas)));
		this.root.querySelectorAll('[data-buy]').forEach(button => {
			button.addEventListener('click', () => this.buy(button.dataset.buy));
		});
	}

	async buy(itemId) {
		try {
			await this.onBuy(itemId, 1);
			this.render();
		} catch (error) {
			this.root.querySelector('[data-message]').textContent = humanError(error);
		}
	}

	destroy() {
		this.unsubscribe();
		this.root.remove();
	}
}

function itemCard(itemId, state, perutas) {
	const definition = INVENTORY_CATALOG[itemId];
	const owned = state.items.some(item => item.itemId === itemId);
	const disabled = owned || perutas < definition.price;
	const card = document.createElement('article');
	card.className = 'Awtsmoos-vendor-card';
	card.innerHTML = `
		<span>${definition.icon}</span>
		<div><b>${definition.name}</b><small>${definition.category} · ⚔ ${definition.stats.damage} · 🛡 ${definition.stats.defense} · ✨ ${definition.stats.focus}</small></div>
		<button data-buy="${itemId}" ${disabled ? 'disabled' : ''}>${owned ? 'Owned' : `${definition.price} 🪙`}</button>
	`;
	return card;
}

function storeBuy(store, itemId, quantity) {
	return store.buy(itemId, quantity);
}

function humanError(error) {
	return String(error?.message || error).replaceAll('_', ' ').toLowerCase();
}
