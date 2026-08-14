//B"H
//Boruch Hashem
//Blessed is He

import {
	loadArenaThemeCatalog,
	loadArenaThemeEntitlements,
	purchaseArenaTheme
} from './ArenaThemeClient.js';
import { arenaThemeState } from './ArenaThemeModel.js';

/**
 * B"H
 *
 * Coordinates only menu visibility and Wallet testimony for Sefira's Arena Theme.
 * The Awtsmoos renews menu, buyer, retry, and hue beyond every finite event;
 * Awtsmoos.com keeps this controller ignorant of GameModel, fighters, physics,
 * progression, Expedition state, and co-op authority so commerce cannot steer play.
 */

export class ArenaThemeController {
	constructor(view, menuOverlay) {
		this.view = view;
		this.menuOverlay = menuOverlay;
		this.model = null;
		this.retryKey = '';
		this.observer = new MutationObserver(() => this.syncMenuVisibility());
		this.view.bindPurchase(() => {
			void this.purchase();
		});
	}

	async start() {
		this.observer.observe(this.menuOverlay, {
			attributes: true,
			attributeFilter: ['class']
		});
		this.syncMenuVisibility();
		await this.refresh();
	}

	stop() {
		this.observer.disconnect();
	}

	async refresh() {
		const [catalog, entitlements] = await Promise.all([
			loadArenaThemeCatalog(),
			loadArenaThemeEntitlements()
		]);
		this.model = arenaThemeState(catalog, entitlements);
		this.view.render(this.model);
		this.syncMenuVisibility();
	}

	async purchase() {
		if (!this.model?.canPurchase) {
			return;
		}
		this.retryKey ||= createRetryKey();
		this.view.button.disabled = true;
		this.view.message('Recording durable cosmetic ownership…');
		const result = await purchaseArenaTheme(this.retryKey);
		if (result.ok) {
			this.retryKey = '';
			this.view.message('Arena Theme owned. Repainting render palette…', 'success');
			await this.refresh();
			return;
		}
		if (result.error !== 'wallet_network_error') {
			this.retryKey = '';
		}
		this.view.message(purchaseError(result.error), 'error');
		this.view.button.disabled = false;
	}

	syncMenuVisibility() {
		this.view.setMenuVisible(
			!this.menuOverlay.classList.contains('hidden')
		);
	}
}

function purchaseError(error) {
	const messages = {
		already_owned: 'This account already owns the Arena Theme.',
		insufficient_purchased_perutahs: 'Purchased Perutahs are required. Open Wallet to top up.',
		login_required: 'Sign in to unlock account cosmetics.',
		sku_unavailable: 'Arena Theme purchase is not live yet.',
		wallet_network_error: 'Wallet reply was interrupted. Gameplay is unaffected.'
	};
	return messages[error] || `Arena Theme purchase could not complete: ${error || 'unknown error'}`;
}

function createRetryKey() {
	if (globalThis.crypto?.randomUUID) {
		return globalThis.crypto.randomUUID();
	}
	return `sefira-arena-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
