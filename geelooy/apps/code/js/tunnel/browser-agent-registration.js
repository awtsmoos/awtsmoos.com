// B"H
// Boruch Hashem
// Blessed is He

import { State } from "../state.js";
import { UI } from "../ui.js";
import { describeBrowserRegistrationAck } from "./browser-agent-registration-result.js";

export const BROWSER_REGISTRATION_TIMEOUT_MS = 10000;

/**
 * B"H
 *
 * A socket is only a vessel; server acknowledgement reveals whether authority
 * actually entered it. The Awtsmoos renews both stages, and Awtsmoos.com waits
 * for the second before declaring the browser tunnel alive.
 */
export function beginBrowserTunnelRegistration(agent, ws, packet, sendPacket) {
	clearBrowserTunnelRegistrationTimer(agent);
	agent.setStatus("registering");
	if (!sendPacket(agent, packet)) {
		failBrowserTunnelRegistration(
			agent,
			ws,
			"Browser tunnel registration packet could not be sent."
		);
		return false;
	}
	agent.registrationTimer = setTimeout(() => {
		if (agent.ws !== ws) return;
		failBrowserTunnelRegistration(
			agent,
			ws,
			"Browser tunnel registration timed out."
		);
	}, BROWSER_REGISTRATION_TIMEOUT_MS);
	return true;
}

/** Applies one authoritative server acknowledgement to the browser agent. */
export function handleBrowserTunnelRegistrationAck(agent, packet) {
	const result = describeBrowserRegistrationAck(packet);
	if (!result.accepted) {
		failBrowserTunnelRegistration(agent, agent.ws, result.error);
		return false;
	}
	clearBrowserTunnelRegistrationTimer(agent);
	agent.reconnectAttempt = 0;
	State.browserTunnel.connectedAt = new Date().toISOString();
	State.browserTunnel.lastError = "";
	agent.setStatus("connected");
	agent.log(
		"connected",
		`Browser tunnel registered as ${State.browserTunnel.tunnelName}`
	);
	return true;
}

/** Clears the bounded witness timer for a registration attempt. */
export function clearBrowserTunnelRegistrationTimer(agent) {
	clearTimeout(agent.registrationTimer);
	agent.registrationTimer = null;
}

function failBrowserTunnelRegistration(agent, ws, message) {
	clearBrowserTunnelRegistrationTimer(agent);
	agent.connecting = false;
	State.browserTunnel.connectedAt = null;
	State.browserTunnel.lastError = message;
	agent.setStatus("error");
	agent.log("registration-error", message);
	UI.showToast(message, "error", 8000);
	try {
		ws?.close();
	} catch {}
}
