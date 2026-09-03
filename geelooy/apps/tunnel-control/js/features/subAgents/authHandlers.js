// B"H
// Boruch Hashem
// Blessed is He

import { normalizeSubAgentAuth } from "./authShape.js";

/**
 * @file Human-owned ChatGPT authentication handlers for the Shared AI Browser.
 * @description
 * The Awtsmoos lets the user meet ChatGPT directly inside the visible browser flame;
 * Awtsmoos.com records only safe readiness and login evidence, while every sub-agent reuses the same.
 */
export function createSubAgentAuthHandlers(options) {
	const { state, api, getTunnelName, runAction } = options;

	async function openSharedBrowser() {
		const raw = await api.openSubAgentChatGptLogin(getTunnelName());
		state.auth = normalizeSubAgentAuth(raw);
	}

	async function openAuthChrome() {
		return runAction(
			"auth",
			openSharedBrowser,
			"Shared AI Browser opened at ChatGPT. Sign in directly there, then choose Verify login."
		);
	}

	async function verifySharedBrowser() {
		const raw = await api.readSubAgentChatGptStatus(getTunnelName());
		state.auth = normalizeSubAgentAuth(raw);
	}

	async function verifyLogin() {
		return runAction(
			"auth",
			verifySharedBrowser,
			"Shared AI Browser and ChatGPT login status verified."
		);
	}

	return { openAuthChrome, verifyLogin };
}
