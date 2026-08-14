//B"H
// Boruch Hashem
// Blessed is He

import { createCommanderSigilSurface } from './CommanderSigilSurface.js';

/**
 * B"H
 *
 * Renders one optional Commander Sigil beside Merkava's start controls and nowhere
 * inside battlefield simulation. The Awtsmoos renews mark, owner, and message;
 * Awtsmoos.com keeps every node text-safe so cosmetic commerce cannot alter troops,
 * health, score, permanent Prutahs, abilities, progression, or multiplayer truth.
 */

export class CommanderSigilView {
	constructor(documentObject = document) {
		const surface = createCommanderSigilSurface(documentObject);
		this.root = surface.root;
		this.mark = surface.mark;
		this.title = surface.title;
		this.status = surface.status;
		this.button = surface.button;
		this.wallet = surface.wallet;
	}

	/**
	 * Applies one pure model state to the start-overlay cosmetic card.
	 *
	 * @param {object} model Commander Sigil presentation state.
	 */
	render(model) {
		this.root.dataset.state = model.status;
		this.mark.textContent = model.owned ? '✦' : '◇';
		this.title.textContent = model.title;
		this.status.textContent = statusMessage(model);
		this.status.dataset.tone = 'info';
		this.button.textContent = buttonLabel(model);
		this.button.disabled = !model.canPurchase;
		this.wallet.hidden = model.owned;
	}

	/**
	 * Displays a local purchase status without changing model ownership.
	 *
	 * @param {string} message Human-facing status message.
	 * @param {string} tone Visual status tone.
	 */
	message(message, tone = 'info') {
		this.status.textContent = message;
		this.status.dataset.tone = tone;
	}

	/**
	 * Binds one purchase handler to the fixed cosmetic button.
	 *
	 * @param {Function} handler Purchase callback.
	 */
	bindPurchase(handler) {
		this.button.addEventListener('click', handler);
	}
}

function statusMessage(model) {
	const price = model.pricePerutahs
		? `${model.pricePerutahs} purchased Perutahs`
		: 'Account cosmetic';
	const messages = {
		planned: 'Commander cosmetic planned. No purchase is live yet.',
		policy_error: 'Store safety check failed. Purchase is disabled.',
		signed_out: `${price} · Sign in to unlock. Cosmetic only.`,
		account_unavailable: 'Wallet ownership could not be checked. Gameplay remains available.',
		owned: 'OWNED · Commander cosmetic equipped. No gameplay advantage.',
		available: `${price} · Durable cosmetic only. No gameplay advantage.`
	};
	return messages[model.status] || 'Commander cosmetic unavailable.';
}

function buttonLabel(model) {
	const labels = {
		planned: 'COMING SOON',
		policy_error: 'PURCHASE DISABLED',
		signed_out: 'SIGN IN TO UNLOCK',
		account_unavailable: 'WALLET UNAVAILABLE',
		owned: 'SIGIL EQUIPPED',
		available: `UNLOCK · ${model.pricePerutahs}`
	};
	return labels[model.status] || 'UNAVAILABLE';
}
