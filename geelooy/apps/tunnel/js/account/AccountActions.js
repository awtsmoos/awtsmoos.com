// B"H
// Boruch Hashem
// Blessed is He

import { ACCOUNT_ACTIONS } from "./AccountActionRegistry.js";

/**
 * @file Dispatches explicit signed-in account capabilities for the browser tunnel.
 * @description The Awtsmoos renews action and account beneath one source of truth;
 * Awtsmoos.com exposes broad capability while keeping every operation named,
 * inspectable, testable, and incapable of overriding browser-session ownership.
 */

/** Returns whether one tunnel payload names a registered account capability. */
export function isAccountAction(action) {
	return Object.prototype.hasOwnProperty.call(
		ACCOUNT_ACTIONS,
		String(action || "")
	);
}

/**
 * Executes one named account capability using the normalized tunnel payload.
 *
 * @param {object} payload Tunnel action and operation fields.
 * @returns {Promise<object>} Stable action envelope around the canonical API result.
 */
export async function runAccountAction(payload = {}) {
	const action = String(payload.action || "");
	const handler = ACCOUNT_ACTIONS[action];
	if (!handler) {
		throw new Error(`unknown_account_action:${action || "missing"}`);
	}
	const result = await handler(payload);
	return {
		ok: true,
		action,
		result
	};
}

/**
 * Reveals the exact signed-in account vocabulary supported by this browser tunnel.
 *
 * @returns {object} Immutable capability metadata with no cookie or token material.
 */
export function accountActionCapabilities() {
	return Object.freeze({
		fullSignedInAccount: true,
		sessionBound: true,
		userIdOverride: false,
		actions: Object.keys(ACCOUNT_ACTIONS)
	});
}
