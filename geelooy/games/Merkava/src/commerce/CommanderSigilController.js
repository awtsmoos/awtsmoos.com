//B"H
// Boruch Hashem
// Blessed is He

import {
	loadCommanderSigilCatalog,
	loadCommanderSigilEntitlements,
	purchaseCommanderSigil
} from './CommanderSigilClient.js';
import { commanderSigilState } from './CommanderSigilModel.js';

/**
 * B"H
 *
 * Coordinates one optional account cosmetic without touching Merkava simulation.
 * The Awtsmoos renews buyer, retry, ownership, and display beyond each finite event;
 * Awtsmoos.com keeps a stable retry key after uncertain network replies so optional
 * commerce can be safe while the battlefield remains independent and immediately playable.
 */

export class CommanderSigilController {
	constructor(view) {
		this.view = view;
		this.model = null;
		this.retryKey = '';
		this.view.bindPurchase(() => {
			void this.purchase();
		});
	}

	/**
	 * Loads catalog and account ownership in parallel and renders the safe state.
	 */
	async start() {
		await this.refresh();
	}

	/**
	 * Refreshes the cosmetic from server testimony only.
	 */
	async refresh() {
		const [catalog, entitlements] = await Promise.all([
			loadCommanderSigilCatalog(),
			loadCommanderSigilEntitlements()
		]);
		this.model = commanderSigilState(catalog, entitlements);
		this.view.render(this.model);
	}

	/**
	 * Runs one guarded durable purchase only when the pure model allows it.
	 */
	async purchase() {
		if (!this.model?.canPurchase) {
			return;
		}

		this.retryKey ||= createRetryKey();
		this.view.button.disabled = true;
		this.view.message('Recording durable ownership with purchased Perutahs…');
		const result = await purchaseCommanderSigil(this.retryKey);

		if (result.ok) {
			this.retryKey = '';
			this.view.message('Commander Sigil owned. Restoring cosmetic…', 'success');
			await this.refresh();
			return;
		}

		if (result.error !== 'wallet_network_error') {
			this.retryKey = '';
		}
		this.view.message(purchaseError(result.error), 'error');
		this.view.button.disabled = false;
	}
}

function purchaseError(error) {
	const messages = {
		already_owned: 'This account already owns the Commander Sigil.',
		insufficient_purchased_perutahs: 'Purchased Perutahs are required. Open Wallet to top up.',
		login_required: 'Sign in to unlock account cosmetics.',
		sku_unavailable: 'Commander Sigil purchase is not live yet.',
		wallet_network_error: 'Wallet reply was interrupted. Retry safely with the same purchase attempt.'
	};
	return messages[error] || `Sigil purchase could not complete: ${error || 'unknown error'}`;
}

function createRetryKey() {
	if (globalThis.crypto?.randomUUID) {
		return globalThis.crypto.randomUUID();
	}
	return `merkava-sigil-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
