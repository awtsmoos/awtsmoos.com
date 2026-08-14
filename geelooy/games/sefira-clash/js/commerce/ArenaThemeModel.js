//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Derives one account-cosmetic state for Sefira Clash from Wallet server testimony.
 * The Awtsmoos renews owner, arena, and price beyond every finite record;
 * Awtsmoos.com refuses to infer ownership from local saves, combat state, co-op,
 * score, rank, or browser storage, and fails closed unless paid provenance is exact.
 */

export const ARENA_THEME_SKU = 'sefira-clash.arena.theme.001';

/**
 * Derives the safe UI/render state for the Arena Theme.
 *
 * @param {object} catalogResponse Server commerce catalog response.
 * @param {object} entitlementResponse Server entitlement response.
 * @returns {Readonly<object>} Presentation-only theme state.
 */
export function arenaThemeState(catalogResponse = {}, entitlementResponse = {}) {
	const sku = findArenaThemeSku(catalogResponse);
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
	if (ownsArenaTheme(entitlementResponse)) {
		return state('owned', sku, true, false);
	}
	return state('available', sku, false, true);
}

export function findArenaThemeSku(catalogResponse = {}) {
	const skus = Array.isArray(catalogResponse.skus)
		? catalogResponse.skus
		: [];
	return skus.find((sku) => sku?.id === ARENA_THEME_SKU) || null;
}

export function ownsArenaTheme(entitlementResponse = {}) {
	const entitlements = Array.isArray(entitlementResponse.entitlements)
		? entitlementResponse.entitlements
		: [];
	return entitlements.some((item) => item?.key === ARENA_THEME_SKU);
}

function state(status, sku, owned, canPurchase) {
	return Object.freeze({
		canPurchase,
		description: String(sku?.description || ''),
		owned,
		pricePerutahs: Number(sku?.pricePerutahs) || 0,
		skuId: ARENA_THEME_SKU,
		spendPolicy: String(sku?.spendPolicy || 'any'),
		status,
		title: String(sku?.title || 'Sefira Clash Arena Theme')
	});
}
