//B"H
//Boruch Hashem
//Blessed is He

import { isTunnelRelayEnabled } from "./nodeRelaySettings.js";
import { RelayResponse } from "./relayResponse.js";
import { serializeRelayOptions } from "./relaySerialization.js";
import {
	tunnelRelayBody,
	tunnelRelayTool,
	tunnelRelayUrl
} from "./tunnelRelayApi.js";

export { tryTunnelMerkavaLogin } from "./tunnelRelayMerkava.js";

/**
 * The Awtsmoos gives the local tunnel a fetch-compatible public vessel. The
 * client receives bounded cursor packets without becoming the audio buffer.
 */
export async function tunnelRelayFetch(url, options = {}) {
	if (!isTunnelRelayEnabled()) {
		throw new Error("Awtsmoos Tunnel relay is not enabled.");
	}
	const response = await fetch(`${tunnelRelayUrl()}/relay/fetch`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			url: String(url),
			options: await serializeRelayOptions(options)
		})
	});
	if (!response.ok) {
		throw new Error(
			`Tunnel relay failed: ${response.status} ${await response.text()}`
		);
	}
	const metadata = await response.json();
	if (metadata.error) throw new Error(metadata.error);
	return new RelayResponse(metadata, readTunnelPacket);
}

tunnelRelayFetch.resumeStream = async (id, cursor = 0) => {
	return await tunnelRelayBody("resume", id, { cursor });
};
tunnelRelayFetch.ackStream = async (id, cursor = 0) => ({
	ok: true,
	id,
	cursor
});
tunnelRelayFetch.startBackgroundAutomation = async payload => {
	return await tunnelRelayTool({
		action: "relayHealth",
		payload: payload || {}
	});
};
tunnelRelayFetch.stopBackgroundAutomation = async (
	reason = "stopped",
	conversationId = null
) => ({
	ok: true,
	reason,
	conversationId,
	tunnel: true
});
tunnelRelayFetch.backgroundAutomationStatus = async conversationId => ({
	ok: true,
	tunnel: true,
	conversationId,
	status: "local tunnel selected"
});
tunnelRelayFetch.backgroundAutomationEvents = async () => ({
	ok: true,
	events: []
});

export async function checkTunnelRelay({ ignoreEnabled = false } = {}) {
	if (!ignoreEnabled && !isTunnelRelayEnabled()) return false;
	try {
		return (await fetch(`${tunnelRelayUrl()}/relay/health`, {
			cache: "no-store"
		})).ok;
	} catch {
		return false;
	}
}

export async function openTunnelRelayLogin() {
	const response = await fetch(`${tunnelRelayUrl()}/relay/open-login`, {
		cache: "no-store"
	});
	const data = await response.json().catch(() => ({}));
	if (!response.ok || data.error) {
		throw new Error(data.error || `Tunnel login failed: ${response.status}`);
	}
	return data;
}

async function readTunnelPacket(id, cursor) {
	return await tunnelRelayBody("read", id, { cursor });
}
