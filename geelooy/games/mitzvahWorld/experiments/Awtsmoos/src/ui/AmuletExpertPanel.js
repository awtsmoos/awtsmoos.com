// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AmuletExpertPanel.js
 * @description Presents certified fictional healing amulets through the player's real Bag economy.
 * The Awtsmoos joins coin, provenance, need, and choice beneath honest measure; Awtsmoos.com
 * shows healing, stock limit, ownership, and disclaimer before one Peruta changes hands.
 */

import { INVENTORY_CATALOG } from '../gameplay/InventoryCatalog.js';
import {
	AMULET_EXPERT_ID,
	AMULET_EXPERT_NAME,
	AMULET_EXPERT_STOCK
} from './AmuletExpertCatalog.js';

export class AmuletExpertPanel {
	constructor(store, options = {}) {
		this.store = store;
		this.document = options.document || globalThis.document;
		this.onBuy = options.onBuy || ((itemId, quantity) => store.buy(itemId, quantity));
		this.root = this.document.createElement('section');
		this.root.className = 'Awtsmoos-sheet Awtsmoos-vendor-panel Awtsmoos-amulet-expert Awtsmoos-gameplay';
		this.root.dataset.vendorId = AMULET_EXPERT_ID;
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
		const perutas = quantity(state, 'perutas');
		this.root.innerHTML = markup(perutas);
		this.root.querySelector('[data-close]').addEventListener('click', () => this.setOpen(false));
		this.root.querySelector('[data-items]').replaceChildren(
			...AMULET_EXPERT_STOCK.map(id => amuletCard(this.document, id, state, perutas))
		);
		this.root.querySelectorAll('[data-buy]').forEach(button => {
			button.addEventListener('click', () => this.buy(button.dataset.buy));
		});
	}

	async buy(itemId) {
		try {
			await this.onBuy(itemId, 1, AMULET_EXPERT_ID);
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
			stock: AMULET_EXPERT_STOCK.length,
			vendorId: AMULET_EXPERT_ID
		};
	}

	destroy() {
		this.unsubscribe();
		this.root.remove();
	}
}

function markup(perutas) {
	return `<header class="Awtsmoos-sheet-header"><div><small>Expert Scribe</small><h2>🧿 ${AMULET_EXPERT_NAME}</h2></div><button data-close aria-label="Close amulet expert">×</button></header><p class="Awtsmoos-wallet">🪙 ${perutas} Perutas</p><p>Fictional game healing inspired by historical amulet forms—not medical advice.</p><div class="Awtsmoos-vendor-grid" data-items></div><p class="Awtsmoos-panel-message" data-message></p>`;
}

function amuletCard(documentValue, itemId, state, perutas) {
	const item = INVENTORY_CATALOG[itemId];
	const owned = quantity(state, itemId);
	const disabled = owned >= item.stackLimit || perutas < item.price;
	const card = documentValue.createElement('article');
	card.className = 'Awtsmoos-vendor-card';
	card.innerHTML = `<span>${item.icon}</span><div><b>${item.name}</b><small>Heals ${item.effect.healing} · Bag ${owned}/${item.stackLimit}</small><p>${item.description}</p></div><button data-buy="${itemId}" ${disabled ? 'disabled' : ''}>${disabled && owned >= item.stackLimit ? 'Full' : `${item.price} 🪙`}</button>`;
	return card;
}

function quantity(state, itemId) {
	return state.items.find(item => item.itemId === itemId)?.quantity || 0;
}
