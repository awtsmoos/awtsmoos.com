//B"H
// Boruch Hashem
// Blessed is He

import { COMMANDER_SIGIL_SKU } from './CommanderSigilModel.js';

/**
 * B"H
 *
 * Speaks only to the canonical Wallet commerce API for Merkava's optional sigil.
 * The Awtsmoos renews request, account, price, and receipt beyond every finite
 * transport; Awtsmoos.com keeps credentials in cookies and all price, availability,
 * purchased-only provenance, debit, and entitlement authority on the server.
 */

const WALLET_ACTION_HEADER = 'X-Awtsmoos-Wallet-Action';

/**
 * Loads the public server commerce catalog.
 *
 * @param {Function} fetchImpl Browser fetch implementation.
 * @returns {Promise<object>} Parsed catalog response or safe network error.
 */
export function loadCommanderSigilCatalog(fetchImpl = fetch) {
	return getJson('/api/wallet/commerce/catalog', fetchImpl);
}

/**
 * Loads authenticated durable entitlement testimony.
 *
 * @param {Function} fetchImpl Browser fetch implementation.
 * @returns {Promise<object>} Parsed entitlement response or safe network error.
 */
export function loadCommanderSigilEntitlements(fetchImpl = fetch) {
	return getJson('/api/wallet/commerce/entitlements', fetchImpl);
}

/**
 * Purchases only the fixed Commander Sigil SKU through the guarded Wallet route.
 *
 * @param {string} idempotencyKey Stable browser retry key.
 * @param {Function} fetchImpl Browser fetch implementation.
 * @returns {Promise<object>} Server purchase response or safe network error.
 */
export async function purchaseCommanderSigil(
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
				skuId: COMMANDER_SIGIL_SKU
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
			headers: {
				Accept: 'application/json'
			}
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
