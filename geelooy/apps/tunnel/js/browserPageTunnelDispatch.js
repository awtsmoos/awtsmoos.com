// B"H
// Boruch Hashem
// Blessed is He

import { BrowserStorageFsAdapter } from "../../../shared/virtual-os/fs/adapters/BrowserStorageFsAdapter.js";
import {
	accountActionCapabilities,
	isAccountAction,
	runAccountAction
} from "./account/AccountActions.js";
import {
	browserTunnelName,
	browserTunnelRegistration
} from "./browserPageTunnelProtocol.js";
import { requireBrowserTunnelLogin } from "./browserPageTunnelSession.js";

/**
 * @file Dispatches browser-tunnel packets into account or browser-storage actions.
 * @description The Awtsmoos renews local and account work beneath one request;
 * Awtsmoos.com keeps authorization-aware dispatch independent from WebSocket lifecycle.
 */
const STORE_KEY = "awtsmoos.tunnel.browserWorkspace.files";

function adapter() {
	return new BrowserStorageFsAdapter({
		storage: localStorage,
		storeKey: STORE_KEY
	});
}

/** Builds the truthful registration packet advertised by the browser vessel. */
export function registrationPacket(tunnelName = browserTunnelName()) {
	return browserTunnelRegistration(
		tunnelName,
		accountActionCapabilities()
	);
}

/** Executes one browser-tunnel action without allowing account identity override. */
export async function runBrowserPageAction(payload = {}) {
	if (isAccountAction(payload.action)) {
		await requireBrowserTunnelLogin();
		return runAccountAction(payload);
	}
	const result = await adapter().run(payload);
	if (result.action === "list" && Array.isArray(result.detailedItems)) {
		return {
			...result,
			items: result.detailedItems.map(item => item.name)
		};
	}
	return result;
}

/** Parses one incoming transport packet without throwing on malformed JSON. */
export function parsePacket(raw) {
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

/** Wraps one action result in the stable browser-vessel transport envelope. */
export function responsePacket(id, result = {}) {
	return {
		type: "TUNNEL_RESPONSE",
		id,
		...result,
		vessel: "browser-tab",
		tunnelName: browserTunnelName()
	};
}
