//B"H
//Boruch Hashem
//Blessed is He

import { isNodeRelayEnabled } from "./nodeRelaySettings.js";
import { RelayResponse } from "./relayResponse.js";
import { serializeRelayOptions } from "./relaySerialization.js";
import {
	nodeRelayBody,
	nodeRelayGet,
	nodeRelayJson,
	nodeRelayUrl
} from "./nodeRelayApi.js";

/**
 * The Awtsmoos gives the Node relay a fetch-compatible public vessel. Bounded
 * cursor reads preserve long audio and large conversations without giant JSON.
 */
export async function nodeRelayFetch(url, options = {}) {
	if (!isNodeRelayEnabled()) {
		throw new Error("Node relay is not enabled.");
	}
	const response = await fetch(`${nodeRelayUrl()}/fetch`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			url: String(url),
			options: await serializeRelayOptions(options)
		})
	});
	if (!response.ok) {
		throw new Error(
			`Node relay failed: ${response.status} ${await response.text()}`
		);
	}
	const metadata = await response.json();
	if (metadata.error) throw new Error(metadata.error);
	return new RelayResponse(metadata, readRelayPacket);
}

nodeRelayFetch.resumeStream = async (id, cursor = 0) => {
	return await nodeRelayBody("resume", id, { cursor });
};
nodeRelayFetch.ackStream = async (id, cursor = 0) => ({
	ok: true,
	id,
	cursor
});
nodeRelayFetch.startBackgroundAutomation = async payload => {
	return await nodeRelayJson("/automation-start", payload || {});
};
nodeRelayFetch.stopBackgroundAutomation = async (
	reason = "stopped",
	conversationId = null
) => {
	return await nodeRelayJson("/automation-stop", {
		reason,
		conversationId
	});
};
nodeRelayFetch.backgroundAutomationStatus = async conversationId => {
	const suffix = conversationId
		? `?conversationId=${encodeURIComponent(conversationId)}`
		: "";
	return await nodeRelayGet(`/automation-status${suffix}`);
};
nodeRelayFetch.backgroundAutomationEvents = async options => {
	const { conversationId = null, after = 0 } = options || {};
	const params = new URLSearchParams();
	if (conversationId) params.set("conversationId", conversationId);
	if (after) params.set("after", String(after));
	return await nodeRelayGet(
		`/automation-events${params.size ? `?${params}` : ""}`
	);
};

export async function checkNodeRelay({ ignoreEnabled = false } = {}) {
	if (!ignoreEnabled && !isNodeRelayEnabled()) return false;
	try {
		return (await fetch(`${nodeRelayUrl()}/health`, {
			cache: "no-store"
		})).ok;
	} catch {
		return false;
	}
}

export async function openRelayLogin() {
	return await openRelayControl();
}

export async function openRelayControl() {
	let url = `${nodeRelayUrl()}/control`;
	try {
		url = (await nodeRelayGet("/control-url"))?.url || url;
	} catch {}
	globalThis.open?.(url, "_blank", "noopener,noreferrer");
	return url;
}

async function readRelayPacket(id, cursor) {
	return await nodeRelayBody("read", id, { cursor });
}
