//B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Converts Wallet commerce testimony into one presentation-only Commander Sigil
 * state. The Awtsmoos renews owner, catalog, sigil, and price beyond every finite
 * record; Awtsmoos.com refuses to infer availability, purchased provenance, or
 * ownership from local game state, permanent Prutahs, score, or battlefield power.
 */

export const COMMANDER_SIGIL_SKU = 'merkava.commander.sigil.001';

/**
 * Derives the safe presentation state for the Commander Sigil offer.
 *
 * @param {object} catalogResponse Server commerce catalog response.
 * @param {object} entitlementResponse Authenticated entitlement response.
 * @returns {Readonly<object>} Presentation-only state with no gameplay authority.
 */
export function commanderSigilState(
	catalogResponse = {},
	entitlementResponse = {}
) {
	const sku = findCommanderSigilSku(catalogResponse);
	if (!sku || sku.available !== true) {
		return state('planned', sku, false, false);
	}
	if (sku.spendPolicy !== 'purchased_only') {
		return state('policy_error', sku, false, false);
	}
	if (entitlementResponse.ok !== true) {
		const status = entitlementResponse.error === 'login_required'
			? 'signed_out'
			: 'account_unavailable';
		return state(status, sku, false, false);
	}
	if (ownsCommanderSigil(entitlementResponse)) {
		return state('owned', sku, true, false);
	}
	return state('available', sku, false, true);
}

/**
 * Finds only the exact server-known Commander Sigil SKU.
 *
 * @param {object} catalogResponse Server commerce catalog response.
 * @returns {object|null} Matching SKU or null.
 */
export function findCommanderSigilSku(catalogResponse = {}) {
	const skus = Array.isArray(catalogResponse.skus)
		? catalogResponse.skus
		: [];
	return skus.find((sku) => sku?.id === COMMANDER_SIGIL_SKU) || null;
}

/**
 * Checks durable ownership without reading any game save or local storage.
 *
 * @param {object} entitlementResponse Authenticated entitlement response.
 * @returns {boolean} Whether the account owns the Commander Sigil entitlement.
 */
export function ownsCommanderSigil(entitlementResponse = {}) {
	const entitlements = Array.isArray(entitlementResponse.entitlements)
		? entitlementResponse.entitlements
		: [];
	return entitlements.some((item) => item?.key === COMMANDER_SIGIL_SKU);
}

function state(status, sku, owned, canPurchase) {
	return Object.freeze({
		canPurchase,
		description: String(sku?.description || ''),
		owned,
		pricePerutahs: Number(sku?.pricePerutahs) || 0,
		skuId: COMMANDER_SIGIL_SKU,
		spendPolicy: String(sku?.spendPolicy || 'any'),
		status,
		title: String(sku?.title || 'Merkava Commander Sigil')
	});
}
