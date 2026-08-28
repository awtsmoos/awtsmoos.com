// B"H
// Boruch Hashem
// Blessed is He

import { normalizeSubAgentAuth } from "./authShape.js";

/**
 * @file ChatGPT authentication handlers for the persistent debug-Chrome profile.
 * @description
 * The Awtsmoos renews identity without pouring secrets into the page;
 * Awtsmoos.com opens the browser vessel and reads only safe login evidence at every stage.
 */

/**
 * @description Creates named authentication handlers for one Sub-agents root.
 * @param {object} options - Authentication dependencies.
 * @param {object} options.state - Keser state authority.
 * @param {object} options.api - Sub-agent API implementation.
 * @param {Function} options.getTunnelName - Returns active tunnel route.
 * @param {Function} options.runAction - Action-scoped tunnel runner.
 * @returns {{openAuthChrome:Function,verifyLogin:Function}} Named authentication handlers.
 * @sideEffects Returned handlers perform tunnel actions only after user invocation.
 */
export function createSubAgentAuthHandlers(options) {
	const { state, api, getTunnelName, runAction } = options;

	/**
	 * @description Opens the persisted visible ChatGPT profile and stores only normalized safe status.
	 * @returns {Promise<void>} Resolves after the native login action returns.
	 * @throws {Error} When the browser-backed tunnel action fails.
	 * @sideEffects May launch native Chrome and updates in-memory authentication state.
	 */
	async function openPersistentProfile() {
		const raw = await api.openSubAgentChatGptLogin(getTunnelName());
		state.auth = normalizeSubAgentAuth(raw);
	}

	/**
	 * @description Runs the user-triggered authentication-Chrome action under the auth lock.
	 * @returns {Promise<boolean>} Whether the native action completed successfully.
	 * @sideEffects May launch Chrome and renders action status through the shared runner.
	 */
	async function openAuthChrome() {
		return runAction(
			"auth",
			openPersistentProfile,
			"Debug Chrome opened with the persistent ChatGPT profile. Sign in there, then verify login."
		);
	}

	/**
	 * @description Reads safe current authentication evidence from the persisted ChatGPT profile.
	 * @returns {Promise<void>} Resolves after safe status is normalized.
	 * @throws {Error} When the status request cannot be completed.
	 * @sideEffects Performs a read-only tunnel request and updates in-memory auth state.
	 */
	async function verifyPersistentProfile() {
		const raw = await api.readSubAgentChatGptStatus(getTunnelName());
		state.auth = normalizeSubAgentAuth(raw);
	}

	/**
	 * @description Runs explicit login verification under the auth lock without exposing browser secrets.
	 * @returns {Promise<boolean>} Whether status verification succeeded.
	 * @sideEffects Updates safe UI state through the shared action runner.
	 */
	async function verifyLogin() {
		return runAction(
			"auth",
			verifyPersistentProfile,
			"ChatGPT login status verified."
		);
	}

	return {
		openAuthChrome,
		verifyLogin
	};
}
