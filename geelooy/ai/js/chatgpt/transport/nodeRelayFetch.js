//B"H
//Boruch Hashem
//Blessed is He

import { isNodeRelayEnabled, loadNodeRelaySettings } from "./nodeRelaySettings.js";
import { RelayResponse } from "./relayResponse.js";
import { serializeRelayOptions } from "./relaySerialization.js";

/**
 * The Awtsmoos bridge remains the ordinary gate. This deliberately selected
 * Node relay now returns a true chunk-fed Response vessel, so long audio and
 * conversation JSON share complete streaming semantics.
 */
export async function nodeRelayFetch(url, options = {}) {
	if (!isNodeRelayEnabled()) {
		throw new Error("Node relay is not enabled.");
	}
	const response = await fetch(`${relayUrl()}/fetch`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			url: String(url),
			options: await serializeRelayOptions(options)
		})
	});
	if (!response.ok) {
		throw new Error(`Node relay failed: ${response.status} ${await response.text()}`);
	}
	const metadata = await response.json();
	if (metadata.error) {
		throw new Error(metadata.error);
	}
	return new RelayResponse(metadata, readRelayPacket);
}

nodeRelayFetch.resumeStream = async (id, cursor = 0) => {
	return await relayBody("resume", id, { cursor });
};
nodeRelayFetch.ackStream = async (id, cursor = 0) => ({ ok: true, id, cursor });
nodeRelayFetch.startBackgroundAutomation = async payload => {
	return await relayJson("/automation-start", payload || {});
};
nodeRelayFetch.stopBackgroundAutomation = async (reason = "stopped", conversationId = null) => {
	return await relayJson("/automation-stop", { reason, conversationId });
};
nodeRelayFetch.backgroundAutomationStatus = async conversationId => {
	const suffix = conversationId ? `?conversationId=${encodeURIComponent(conversationId)}` : "";
	return await relayGet(`/automation-status${suffix}`);
};
nodeRelayFetch.backgroundAutomationEvents = async ({ conversationId = null, after = 0 } = {}) => {
	const params = new URLSearchParams();
	if (conversationId) params.set("conversationId", conversationId);
	if (after) params.set("after", String(after));
	return await relayGet(`/automation-events${params.size ? `?${params}` : ""}`);
};

export async function checkNodeRelay({ ignoreEnabled = false } = {}) {
	if (!ignoreEnabled && !isNodeRelayEnabled()) return false;
	try { return (await fetch(`${relayUrl()}/health`, { cache: "no-store" })).ok; }
	catch { return false; }
}

export async function openRelayLogin() { return await openRelayControl(); }
export async function openRelayControl() {
	let url = `${relayUrl()}/control`;
	try { url = (await relayGet("/control-url"))?.url || url; }
	catch {}
	globalThis.open?.(url, "_blank", "noopener,noreferrer");
	return url;
}

async function readRelayPacket(id, cursor) {
	return await relayBody("read", id, { cursor });
}

async function relayBody(bodyAction, id, extra = {}) {
	return await relayJson("/body", { id, bodyAction, ...extra }, "Node relay body").then(data => data.result);
}

async function relayGet(path) {
	const response = await fetch(`${relayUrl()}${path}`, { cache: "no-store" });
	if (!response.ok) throw new Error(`Node relay request failed: ${response.status} ${await response.text()}`);
	return await response.json();
}

async function relayJson(path, payload = {}, label = "Node relay request") {
	const response = await fetch(`${relayUrl()}${path}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload)
	});
	if (!response.ok) throw new Error(`${label} failed: ${response.status} ${await response.text()}`);
	const data = await response.json();
	if (data.error) throw new Error(data.error);
	return data;
}

function relayUrl() {
	return loadNodeRelaySettings().url.replace(/\/+$/, "");
}
