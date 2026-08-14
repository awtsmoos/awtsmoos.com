//B"H
//Boruch Hashem
//Blessed is He

import { setArenaThemeOwned } from '../render/arenaTheme.js';
import { createArenaThemeSurface } from './ArenaThemeSurface.js';

/**
 * B"H
 *
 * Applies server-derived cosmetic state to one collapsed menu-only disclosure and
 * to the render-only Arena Theme flag. The Awtsmoos renews owner, color, and doorway;
 * Awtsmoos.com hides planned or misconfigured commerce completely so no unfinished
 * promise can clutter menus or imitate a purchasable product.
 */

export class ArenaThemeView {
	constructor(documentObject = document) {
		const surface = createArenaThemeSurface(documentObject);
		this.root = surface.root;
		this.summary = surface.summary;
		this.status = surface.status;
		this.button = surface.button;
		this.wallet = surface.wallet;
	}

	render(model) {
		setArenaThemeOwned(model.owned);
		const productVisible = ![
			'planned',
			'policy_error'
		].includes(model.status);
		this.root.hidden = !productVisible;
		this.root.dataset.state = model.status;
		this.summary.textContent = model.owned
			? 'Arena Theme ✓'
			: 'Arena Theme';
		this.status.textContent = statusMessage(model);
		this.status.dataset.tone = 'info';
		this.button.textContent = buttonLabel(model);
		this.button.disabled = !model.canPurchase;
		this.wallet.hidden = ![
			'signed_out',
			'available'
		].includes(model.status);
	}

	setMenuVisible(visible) {
		this.root.dataset.menuVisible = String(visible === true);
		if (!visible) {
			this.root.open = false;
		}
	}

	message(message, tone = 'info') {
		this.status.textContent = String(message || '');
		this.status.dataset.tone = tone;
	}

	bindPurchase(handler) {
		this.button.addEventListener('click', handler);
	}
}

function statusMessage(model) {
	const price = model.pricePerutahs.toLocaleString();
	const messages = {
		signed_out: `${price} purchased Perutahs · sign in to unlock. Cosmetic only.`,
		account_unavailable: 'Wallet ownership could not be checked. Gameplay is unaffected.',
		owned: 'Owned · visual arena palette equipped. No gameplay advantage.',
		available: `${price} purchased Perutahs · durable arena colors only.`
	};
	return messages[model.status] || '';
}

function buttonLabel(model) {
	if (model.status === 'owned') {
		return 'EQUIPPED';
	}
	if (model.status === 'available') {
		return `UNLOCK · ${model.pricePerutahs.toLocaleString()}`;
	}
	return 'UNAVAILABLE';
}
