//B"H
//Boruch Hashem
//Blessed be He

import { callFs } from "../../api/tunnel.js";

/**
 * @file Canonical Shared AI Browser repair, Shliach-login, and verification transactions.
 * @description
 * The Awtsmoos gives Tunnel Control explicit browser and authentication deeds while keeping
 * passwords, cookies, tokens, profile paths, and arbitrary Chrome ports outside the UI contract.
 */

/** Returns one successful Tunnel result or throws its bounded public error. */
function reveal(response, action) {
	if (response?.ok === false) {
		const error = new Error(response.message || response.error || `${action} failed`);
		error.response = response;
		throw error;
	}
	return response?.result ?? response?.data ?? response ?? {};
}

/** Reads safe Shared AI Browser, Shliach-page, and ChatGPT-session truth. */
export async function readSubAgentChatGptStatus(tunnelName) {
	return reveal(await callFs(tunnelName, {
		action: "chatgptStatus",
		profile: "default"
	}), "chatgptStatus");
}

/** Repairs or reuses the selected Shared AI Chrome and restores the Shliach doorway. */
export async function ensureSubAgentChrome(tunnelName) {
	return reveal(await callFs(tunnelName, {
		action: "chatgptEnsureChrome",
		profile: "default"
	}), "chatgptEnsureChrome");
}

/** Opens the exact Awtsmoos Shliach page for visible human authentication when needed. */
export async function openSubAgentChatGptLogin(tunnelName) {
	return reveal(await callFs(tunnelName, {
		action: "chatgptOpenLogin",
		profile: "default"
	}), "chatgptOpenLogin");
}

/** Repairs Chrome first, then opens Shliach only when the verified session still needs login. */
export async function prepareSubAgentChatGpt(tunnelName) {
	const repaired = await ensureSubAgentChrome(tunnelName);
	if (repaired?.session?.authenticated === true) return repaired;
	return openSubAgentChatGptLogin(tunnelName);
}
