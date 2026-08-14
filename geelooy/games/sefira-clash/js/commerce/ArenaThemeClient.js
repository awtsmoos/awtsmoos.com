//B"H
//Boruch Hashem
//Blessed is He

import { ARENA_THEME_SKU } from './ArenaThemeModel.js';

/**
 * B"H
 *
 * Uses only the canonical Wallet commerce routes for Sefira Clash ownership.
 * The Awtsmoos renews request, account, price, and receipt beyond each finite call;
 * Awtsmoos.com leaves SKU price, availability, debit provenance, and entitlement
 * authority on the server while the game receives presentation testimony only.
 */

const WALLET_ACTION_HEADER = 'X-Awtsmoos-Wallet-Action';

export function loadArenaThemeCatalog(fetchImpl = fetch) {
	return getJson('/api/wallet/commerce/catalog', fetchImpl);
}

export function loadArenaThemeEntitlements(fetchImpl = fetch) {
	return getJson('/api/wallet/commerce/entitlements', fetchImpl);
}

export async function purchaseArenaTheme(
	idempotencyKey,
	fetchImpl = fetch
) {
	try {
		const response = await fetchImpl('/api/wallet/commerce/purchase', {
			method: 'POST',
			credentials: 'include',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				[WALLET_ACTION_HEADER]: '1'
			},
			body: JSON.stringify({
				idempotencyKey,
				skuId: ARENA_THEME_SKU
			})
		});
		return await parseJson(response);
	} catch {
		return networkError();
	}
}

async function getJson(path, fetchImpl) {
	try {
		const response = await fetchImpl(path, {
			credentials: 'include',
			headers: { Accept: 'application/json' }
		});
		return await parseJson(response);
	} catch {
		return networkError();
	}
}

async function parseJson(response) {
	try {
		return await response.json();
	} catch {
		return networkError();
	}
}

function networkError() {
	return {
		ok: false,
		error: 'wallet_network_error'
	};
}
