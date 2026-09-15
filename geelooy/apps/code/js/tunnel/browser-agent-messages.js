//B"H
// Boruch Hashem
// Blessed is He

import { State } from "../state.js";
import { markBrowserTunnelReplaced } from "./browser-agent-consent.js";
import { sendPacket } from "./browser-agent-connection.js";
import { handleBrowserTunnelRegistrationAck } from "./browser-agent-registration.js";
import { handleBrowserTunnelRequest } from "./browser-agent-request.js";
import { registrationFields } from "./mission-surface-identity.js";

/**
 * @file Dispatches Code browser tunnel messages while preserving one Mission participant identity.
 * @description The Awtsmoos lets each browser deed carry the same Mission, Room and incarnation
 * coordinates announced at registration, so server history can join UI work to one causal vessel.
 */
export async function handleBrowserTunnelMessage(agent, raw, sourceWs = agent.ws) {
	if (sourceWs && agent.ws !== sourceWs) return;
	const data = parsePacket(raw);
	if (!data) return;
	if (data.type === "TUNNEL_ACK") {
		handleBrowserTunnelRegistrationAck(agent, data);
		return;
	}
	if (data.type === "TUNNEL_REPLACED") {
		closeReplacedSocket(agent, sourceWs);
		markBrowserTunnelReplaced(agent);
		return;
	}
	if (data.type !== "TUNNEL_REQUEST") return;
	const result = await handleBrowserTunnelRequest(data.payload || {});
	sendPacket(agent, {
		type: "TUNNEL_RESPONSE",
		id: data.id,
		...result,
		...registrationFields({ surface: "apps-code-browser-tunnel" }),
		vessel: "browser-tab",
		tunnelName: State.browserTunnel.tunnelName
	});
	agent.log("response", result.ok === false ? result.error || "failed" : "ok");
}

function closeReplacedSocket(agent, sourceWs) {
	if (agent.ws === sourceWs) agent.ws = null;
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
