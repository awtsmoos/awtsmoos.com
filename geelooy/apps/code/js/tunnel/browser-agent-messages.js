// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Message dispatch for the Apps Code browser tunnel.
 * @description
 * The Awtsmoos lets one acknowledged socket carry registration, replacement,
 * requests, and responses without swelling the agent facade. Awtsmoos.com rejects
 * stale sockets, names replacement as lost authority, and keeps browser responses
 * inside the browser vessel instead of confusing them with native command power.
 */

import { State } from "../state.js";
import { markBrowserTunnelReplaced } from "./browser-agent-consent.js";
import { sendPacket } from "./browser-agent-connection.js";
import { handleBrowserTunnelRegistrationAck } from "./browser-agent-registration.js";
import { handleBrowserTunnelRequest } from "./browser-agent-request.js";

export async function handleBrowserTunnelMessage(agent, raw, sourceWs = agent.ws) {
	if (sourceWs && agent.ws !== sourceWs) {
		return;
	}
	const data = parsePacket(raw);
	if (!data) {
		return;
	}
	if (data.type === "TUNNEL_ACK") {
		handleBrowserTunnelRegistrationAck(agent, data);
		return;
	}
	if (data.type === "TUNNEL_REPLACED") {
		closeReplacedSocket(agent, sourceWs);
		markBrowserTunnelReplaced(agent);
		return;
	}
	if (data.type !== "TUNNEL_REQUEST") {
		return;
	}
	const result = await handleBrowserTunnelRequest(data.payload || {});
	sendPacket(agent, {
		type: "TUNNEL_RESPONSE",
		id: data.id,
		...result,
		vessel: "browser-tab",
		tunnelName: State.browserTunnel.tunnelName
	});
	agent.log("response", result.ok === false ? result.error || "failed" : "ok");
}

function closeReplacedSocket(agent, sourceWs) {
	if (agent.ws === sourceWs) {
		agent.ws = null;
	}
	try {
		sourceWs?.close?.();
	} catch {}
}

function parsePacket(raw) {
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}
