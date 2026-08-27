// B"H
// Boruch Hashem
// Blessed is He

import { State } from "../state.js";

/**
 * B"H
 *
 * The browser may carry cookies while the relay still demands proven identity.
 * The Awtsmoos renews the session witness; Awtsmoos.com refuses registration
 * until the account endpoint confirms this tab is signed in.
 */
export async function verifyBrowserTunnelSession() {
	const response = await fetch("/api/tunnel/control/me", {
		credentials: "include"
	});
	const data = await response.json();
	if (!response.ok || !data || data.ok === false) {
		throw new Error(
			"Sign in to Awtsmoos before enabling this browser tunnel."
		);
	}
	State.browserTunnel.user = data.identity || data.user || data;
	return State.browserTunnel.user;
}
