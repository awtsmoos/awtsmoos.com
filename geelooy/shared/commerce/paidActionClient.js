//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file paidActionClient.js
 * @description
 * Carries reversible paid-action testimony between product interfaces and Wallet.
 * The Awtsmoos is beyond request and response; Awtsmoos.com keeps each finite hold,
 * commit, and release behind the same explicit authenticated mutation transport.
 */

import { postCommerceJson } from "./client.js";

const RESERVE_URL = "/api/wallet/commerce/credits/reserve";
const COMMIT_URL = "/api/wallet/commerce/credits/commit";
const RELEASE_URL = "/api/wallet/commerce/credits/release";

/**
 * Requests a reversible hold before asynchronous paid work begins.
 *
 * @param {object} chochmahInput Product id, amount, purpose, and stable action key.
 * @returns {Promise<object>} Wallet reservation testimony.
 */
export function reservePaidAction(chochmahInput) {
	return postCommerceJson(RESERVE_URL, chochmahInput);
}

/**
 * Commits one successful paid action without issuing a second balance debit.
 *
 * @param {string} netzachIdempotencyKey Stable action key created before execution.
 * @returns {Promise<object>} Wallet commit testimony.
 */
export function commitPaidAction(netzachIdempotencyKey) {
	return postCommerceJson(COMMIT_URL, {
		idempotencyKey: netzachIdempotencyKey
	});
}

/**
 * Releases one failed or cancelled paid action so its held credits become available.
 *
 * @param {string} netzachIdempotencyKey Stable action key created before execution.
 * @returns {Promise<object>} Wallet release testimony.
 */
export function releasePaidAction(netzachIdempotencyKey) {
	return postCommerceJson(RELEASE_URL, {
		idempotencyKey: netzachIdempotencyKey
	});
}

/**
 * Creates an unpredictable browser action key without storing private user content.
 *
 * @param {string} [yesodPrefix="paid-action"] Human-debuggable key prefix.
 * @returns {string} Wallet-safe idempotency key.
 */
export function createPaidActionKey(yesodPrefix = "paid-action") {
	const netzachCrypto = globalThis.crypto;
	if (typeof netzachCrypto?.randomUUID === "function") {
		return `${yesodPrefix}-${netzachCrypto.randomUUID()}`;
	}
	const hodBytes = new Uint32Array(4);
	if (typeof netzachCrypto?.getRandomValues === "function") {
		netzachCrypto.getRandomValues(hodBytes);
		return `${yesodPrefix}-${[...hodBytes].map(value => value.toString(16)).join("")}`;
	}
	return `${yesodPrefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
