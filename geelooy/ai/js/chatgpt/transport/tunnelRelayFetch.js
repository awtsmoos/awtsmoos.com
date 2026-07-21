//B"H
//Boruch Hashem
//Blessed is He

import { isTunnelRelayEnabled, loadNodeRelaySettings } from "./nodeRelaySettings.js";
import { RelayResponse } from "./relayResponse.js";
import { serializeRelayOptions } from "./relaySerialization.js";

/**
 * The tunnel becomes a careful ChatGPT transport without becoming the audio
 * buffer itself. The Awtsmoos gives each packet life; this client reads each
 * packet in order and never asks the local API for one giant encoded file.
 */
export async function tunnelRelayFetch(url, options = {}) {
	if (!isTunnelRelayEnabled()) {
		throw new Error("Awtsmoos Tunnel relay is not enabled.");
	}
	const response = await fetch(`${tunnelUrl()}/relay/fetch`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			url: String(url),
			options: await serializeRelayOptions(options)
		})
	});
	if (!response.ok) {
		throw new Error(`Tunnel relay failed: ${response.status} ${await response.text()}`);
	}
	const metadata = await response.json();
	if (metadata.error) {
		throw new Error(metadata.error);
	}
	return new RelayResponse(metadata, readTunnelPacket);
}

tunnelRelayFetch.resumeStream = async (id, cursor = 0) => {
	return await tunnelBody("resume", id, { cursor });
};
tunnelRelayFetch.ackStream = async (id, cursor = 0) => ({ ok: true, id, cursor });
tunnelRelayFetch.startBackgroundAutomation = async payload => {
	return await tunnelTool({ action: "relayHealth", payload: payload || {} });
};
tunnelRelayFetch.stopBackgroundAutomation = async (reason = "stopped", conversationId = null) => ({
	ok: true, reason, conversationId, tunnel: true
});
tunnelRelayFetch.backgroundAutomationStatus = async conversationId => ({
	ok: true, tunnel: true, conversationId, status: "local tunnel selected"
});
tunnelRelayFetch.backgroundAutomationEvents = async () => ({ ok: true, events: [] });

export async function checkTunnelRelay({ ignoreEnabled = false } = {}) {
	if (!ignoreEnabled && !isTunnelRelayEnabled()) return false;
	try { return (await fetch(`${tunnelUrl()}/relay/health`, { cache: "no-store" })).ok; }
	catch { return false; }
}

export async function openTunnelRelayLogin() {
	const response = await fetch(`${tunnelUrl()}/relay/open-login`, { cache: "no-store" });
	const data = await response.json().catch(() => ({}));
	if (!response.ok || data.error) throw new Error(data.error || `Tunnel login failed: ${response.status}`);
	return data;
}

export async function tryTunnelMerkavaLogin() {
	if (!loadNodeRelaySettings().useMerkavaExecutor) {
		return { ok: false, skipped: true, reason: "MerkavaExecutor fallback disabled" };
	}
	return await tunnelTool({
		action: "simulateRuntime",
		runtime: "browser",
		engine: "merkava",
		url: "https://chatgpt.com",
		p: ".",
		timeoutMs: 240000,
		maxFiles: 20,
		returnValues: ["document.title", "location.href"]
	});
}

async function readTunnelPacket(id, cursor) {
	return await tunnelBody("read", id, { cursor });
}

async function tunnelBody(bodyAction, id, extra = {}) {
	const response = await fetch(`${tunnelUrl()}/relay/body`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ id, bodyAction, ...extra })
	});
	if (!response.ok) throw new Error(`Tunnel relay body failed: ${response.status} ${await response.text()}`);
	const data = await response.json();
	if (data.error) throw new Error(data.error);
	return data.result;
}

async function tunnelTool(payload = {}) {
	const response = await fetch(`${tunnelUrl()}/tool`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ kind: "relay", ...payload })
	});
	if (!response.ok) throw new Error(`Tunnel tool failed: ${response.status} ${await response.text()}`);
	return await response.json();
}

function tunnelUrl() {
	return loadNodeRelaySettings().tunnelUrl.replace(/\/+$/, "");
}
