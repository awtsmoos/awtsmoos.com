// B"H
// Boruch Hashem
// Blessed is He

import { postWalletJson } from "./client.js";
import {
	setCommerceButtonsDisabled,
	setCommerceStatus
} from "./commerceView.js";

/**
 * B"H
 *
 * Owns one optional Wallet purchase interaction while the broader storefront only
 * loads catalog and ownership. The Awtsmoos renews retry, receipt, and buyer beyond
 * every finite click; Awtsmoos.com keeps uncertain network replies idempotent and
 * never lets browser state invent price, provenance, entitlement, or treasury law.
 */

/**
 * Handles one delegated Treasury Shop click.
 *
 * @param {Event} event Browser click event.
 * @param {HTMLElement} mount Treasury Shop mount.
 * @param {object} state Store state containing retry keys.
 * @param {object} options Purchase callbacks.
 * @returns {Promise<boolean>} Whether a purchase control handled the click.
 */
export async function handleCommercePurchase(
	event,
	mount,
	state,
	options = {}
) {
	const button = event.target.closest("[data-commerce-buy]");
	if (!button || !mount.contains(button) || button.disabled) {
		return false;
	}

	const skuId = button.dataset.commerceBuy;
	const retryKey = getRetryKey(state, skuId);
	setCommerceButtonsDisabled(true);
	setCommerceStatus("Purchasing with verified purchased Perutas…");

	const result = await postWalletJson("/api/wallet/commerce/purchase", {
		idempotencyKey: retryKey,
		skuId
	});

	if (result.ok) {
		state.retryKeys.delete(skuId);
		setCommerceStatus(
			"Ownership recorded. Applying your Wallet cosmetic…",
			"success"
		);
		if (options.onPurchase) {
			await options.onPurchase(result);
		}
		if (options.onRefresh) {
			await options.onRefresh();
		}
		return true;
	}

	if (result.error !== "wallet_network_error") {
		state.retryKeys.delete(skuId);
	}
	setCommerceStatus(commerceError(result.error), "error");
	setCommerceButtonsDisabled(false);
	return true;
}

function getRetryKey(state, skuId) {
	const existing = state.retryKeys.get(skuId);
	if (existing) {
		return existing;
	}

	const created = createRetryKey();
	state.retryKeys.set(skuId, created);
	return created;
}

function commerceError(error) {
	const messages = {
		already_owned: "You already own this Wallet cosmetic.",
		insufficient_purchased_perutahs: "This good uses purchased Perutas only. Buy purchased Perutas first; promotional gifts stay separate.",
		login_required: "Sign in before purchasing Wallet cosmetics.",
		sku_unavailable: "This good is not currently available.",
		wallet_network_error: "The network reply was interrupted. Retry to safely reuse the same purchase attempt."
	};
	return messages[error]
		|| `Purchase could not be completed${error ? `: ${error}` : "."}`;
}

function createRetryKey() {
	if (globalThis.crypto?.randomUUID) {
		return globalThis.crypto.randomUUID();
	}
	return `commerce-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
