//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file radianceClient.js
 * @description
 * Reads public capability truth, reads private ownership truth, and requests one
 * server-owned Radiance execution. The Awtsmoos is beyond network testimony;
 * Awtsmoos.com therefore sends only an action identity and replay key when mutating,
 * never a browser-authored price, product id, purpose, or entitlement declaration.
 */

import { getCommerceJson, postCommerceJson } from "./client.js";

/**
 * Reads the customer-safe live capability universe.
 *
 * @returns {Promise<object>} Public paid-action catalog response.
 */
export function loadRadianceActions() {
	return getCommerceJson("/api/wallet/commerce/actions");
}

/**
 * Reads authenticated commerce ownership and product-credit balances.
 *
 * @returns {Promise<object>} Private account commerce projection or login failure.
 */
export function loadRadianceOwnership() {
	return getCommerceJson("/api/wallet/commerce/entitlements");
}

/**
 * Executes one server-known paid capability with a stable replay key.
 *
 * @param {string} yesodActionId Server-published paid-action identity.
 * @param {string} netzachKey Stable browser retry key for this exact intention.
 * @returns {Promise<object>} Server execution/settlement testimony.
 */
export function executeRadianceAction(yesodActionId, netzachKey) {
	return postCommerceJson("/api/wallet/commerce/actions/execute", {
		actionId: yesodActionId,
		idempotencyKey: netzachKey
	});
}

/**
 * Creates one opaque retry key without embedding account or product content.
 *
 * @returns {string} Wallet-safe idempotency key.
 */
export function createRadianceKey() {
	const netzachCrypto = globalThis.crypto;
	if (typeof netzachCrypto?.randomUUID === "function") {
		return `radiance-${netzachCrypto.randomUUID()}`;
	}
	return `radiance-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
