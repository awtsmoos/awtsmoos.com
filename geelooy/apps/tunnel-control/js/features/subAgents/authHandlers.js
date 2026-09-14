//B"H
//Boruch Hashem
//Blessed be He

import { normalizeSubAgentAuth } from "./authShape.js";

/**
 * @file Human-owned Shared AI Browser repair and ChatGPT authentication handlers.
 * @description
 * The Awtsmoos lets Tunnel Control restore Chrome and Shliach independently from login.
 * Every action records only safe readiness evidence while credentials stay inside Chrome.
 */
export function createSubAgentAuthHandlers(options) {
	const { state, api, getTunnelName, runAction } = options;

	async function ensureSharedBrowser() {
		const raw = await api.ensureSubAgentChrome(getTunnelName());
		state.auth = normalizeSubAgentAuth(raw);
	}

	async function ensureChrome() {
		return runAction(
			"auth",
			ensureSharedBrowser,
			"Shared AI Browser repaired and the Awtsmoos Shliach doorway restored."
		);
	}

	async function openSharedBrowser() {
		const raw = await api.openSubAgentChatGptLogin(getTunnelName());
		state.auth = normalizeSubAgentAuth(raw);
	}

	async function openAuthChrome() {
		return runAction(
			"auth",
			openSharedBrowser,
			"Awtsmoos Shliach opened in the Shared AI Browser. Sign in there if requested."
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
			"Shared AI Browser, Shliach doorway, and ChatGPT login status verified."
		);
	}

	return {
		ensureChrome,
		openAuthChrome,
		verifyLogin
	};
}
