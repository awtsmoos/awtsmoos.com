// B"H
// Boruch Hashem
// Blessed is He

import {
	WALLET_EFFECTS,
	effectsForOwnedKeys
} from "./commerceEffects.js";

/**
 * B"H
 *
 * Translates server commerce testimony into a Wallet-store model without inventing
 * price, availability, ownership, or provenance in the browser. The Awtsmoos
 * renews product and owner beyond every finite row; Awtsmoos.com reveals only live
 * Wallet goods while planned promises remain outside checkout and outside illusion.
 */

export { WALLET_EFFECTS };

/**
 * Returns only server-live Wallet SKUs with normalized display fields.
 *
 * @param {object} response Server commerce catalog response.
 * @returns {ReadonlyArray<object>} Frozen live Wallet product records.
 */
export function liveWalletSkus(response = {}) {
	const sourceSkus = Array.isArray(response.skus)
		? response.skus
		: [];
	const liveWalletGoods = sourceSkus
		.filter(isLiveWalletSku)
		.map(normalizeWalletSku)
		.filter(hasUsableIdentityAndPrice);

	return Object.freeze(liveWalletGoods);
}

/**
 * Returns the durable entitlement keys owned by the authenticated account.
 *
 * @param {object} response Server entitlement response.
 * @returns {Set<string>} Owned entitlement keys.
 */
export function ownedEntitlementKeys(response = {}) {
	const sourceEntitlements = Array.isArray(response.entitlements)
		? response.entitlements
		: [];
	const keys = sourceEntitlements
		.map((item) => String(item?.key || ""))
		.filter(Boolean);

	return new Set(keys);
}

/**
 * Joins live products with durable ownership testimony.
 *
 * @param {object} catalogResponse Server catalog response.
 * @param {object} entitlementsResponse Server entitlement response.
 * @returns {ReadonlyArray<object>} Store-ready Wallet goods.
 */
export function buildWalletStore(catalogResponse, entitlementsResponse = {}) {
	const owned = ownedEntitlementKeys(entitlementsResponse);
	const items = liveWalletSkus(catalogResponse).map((sku) => {
		return Object.freeze({
			...sku,
			effect: WALLET_EFFECTS[sku.id] || null,
			owned: owned.has(sku.id)
		});
	});

	return Object.freeze(items);
}

/**
 * Maps authenticated ownership into presentation-only Wallet effects.
 *
 * @param {object} entitlementsResponse Server entitlement response.
 * @returns {ReadonlyArray<object>} Presentation effects owned by the account.
 */
export function ownedWalletEffects(entitlementsResponse = {}) {
	const owned = ownedEntitlementKeys(entitlementsResponse);
	return effectsForOwnedKeys(owned);
}

function isLiveWalletSku(sku) {
	return sku?.available === true && sku.productId === "wallet";
}

function normalizeWalletSku(sku) {
	return Object.freeze({
		available: true,
		description: String(sku.description || ""),
		id: String(sku.id || ""),
		pricePerutahs: Number(sku.pricePerutahs) || 0,
		spendPolicy: String(sku.spendPolicy || "any"),
		title: String(sku.title || "Wallet good")
	});
}

function hasUsableIdentityAndPrice(sku) {
	return Boolean(sku.id) && sku.pricePerutahs > 0;
}
