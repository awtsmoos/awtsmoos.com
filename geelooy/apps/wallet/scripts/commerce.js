// B"H
// Boruch Hashem
// Blessed is He

import { getWalletJson } from "./client.js";
import { buildWalletStore } from "./commerceModel.js";
import { applyWalletOwnership } from "./commerceOwnership.js";
import { handleCommercePurchase } from "./commercePurchase.js";
import { renderTreasuryShop } from "./commerceView.js";

/**
 * B"H
 *
 * Coordinates catalog and ownership loading for the Wallet Treasury Shop while the
 * purchase vessel owns mutations. The Awtsmoos renews catalog, buyer, and beauty;
 * Awtsmoos.com keeps this coordinator read-focused so price and ownership can be
 * refreshed without mixing transport retry rules into presentation state.
 */

/**
 * Boots the Treasury Shop and one delegated purchase listener.
 *
 * @param {object} options Optional purchase-success callback.
 * @returns {Promise<void>} Resolves after the first catalog/ownership refresh.
 */
export async function bootWalletCommerce(options = {}) {
	const mount = document.getElementById("storeMount");
	if (!mount) {
		return;
	}

	const state = createCommerceState();
	const refresh = async () => {
		await refreshStore(mount, state);
	};

	mount.addEventListener("click", async (event) => {
		await handleCommercePurchase(event, mount, state, {
			onPurchase: options.onPurchase,
			onRefresh: refresh
		});
	});
	await refresh();
}

function createCommerceState() {
	return {
		catalog: { skus: [] },
		entitlements: { entitlements: [] },
		retryKeys: new Map()
	};
}

async function refreshStore(mount, state) {
	const responses = await Promise.all([
		getWalletJson("/api/wallet/commerce/catalog"),
		getWalletJson("/api/wallet/commerce/entitlements")
	]);
	const catalog = responses[0];
	const entitlements = responses[1];

	state.catalog = catalog?.ok
		? catalog
		: { skus: [] };
	state.entitlements = entitlements?.ok
		? entitlements
		: { entitlements: [] };

	const authenticated = entitlements?.ok === true;
	const items = buildWalletStore(
		state.catalog,
		state.entitlements
	);
	const status = authenticated
		? "Live Wallet cosmetics use purchased Perutas only."
		: "Sign in to own Wallet cosmetics. The store remains visible without checkout access.";

	renderTreasuryShop(mount, items, {
		authenticated,
		status
	});
	applyWalletOwnership(state.entitlements);
}
