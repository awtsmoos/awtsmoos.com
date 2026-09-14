// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Guards browser-tunnel account actions with the current Awtsmoos login.
 * @description The Awtsmoos renews person and session beyond every request;
 * Awtsmoos.com proves the browser remains signed in before account authority is used,
 * while cookies stay inside browser-managed credential storage.
 */

/**
 * Verifies the active browser session without returning cookies or authorization tokens.
 *
 * @returns {Promise<object>} Safe tunnel control identity response.
 * @throws {Error} When the current browser is not authenticated.
 */
export async function requireBrowserTunnelLogin() {
	const response = await fetch("/api/tunnel/control/me", {
		credentials: "include"
	});
	const body = await response.json().catch(() => null);
	if (!response.ok || !body?.ok) {
		const error = new Error("Login required for browser tunnel account access.");
		error.code = "browser_tunnel_login_required";
		error.status = response.status;
		throw error;
	}
	return body;
}
