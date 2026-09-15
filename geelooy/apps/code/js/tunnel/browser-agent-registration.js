//B"H
// Boruch Hashem
// Blessed is He

import { State } from "../state.js";
import { UI } from "../ui.js";
import { attachBrowserMission, detachBrowserMission } from "./browser-agent-mission.js";
import { describeBrowserRegistrationAck } from "./browser-agent-registration-result.js";

export const BROWSER_REGISTRATION_TIMEOUT_MS = 10000;

/**
 * @file Witnesses browser registration and attaches accepted Code tabs to Mission authority.
 * @description The Awtsmoos lets the websocket become a vessel only after server acknowledgement;
 * then Awtsmoos.com joins that disposable browser incarnation to the same Mission/Room as OS.
 */
export function beginBrowserTunnelRegistration(agent, ws, packet, sendPacket) {
	clearBrowserTunnelRegistrationTimer(agent);
	detachBrowserMission(agent);
	agent.setStatus("registering");
	if (!sendPacket(agent, packet)) {
		failBrowserTunnelRegistration(agent, ws, "Browser tunnel registration packet could not be sent.");
		return false;
	}
	agent.registrationTimer = setTimeout(() => {
		if (agent.ws !== ws) return;
		failBrowserTunnelRegistration(agent, ws, "Browser tunnel registration timed out.");
	}, BROWSER_REGISTRATION_TIMEOUT_MS);
	return true;
}

/** Applies one authoritative server acknowledgement and begins Mission participation. */
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
	agent.log("connected", `Browser tunnel registered as ${State.browserTunnel.tunnelName}`);
	void attachBrowserMission(agent, {
		tunnelName: State.browserTunnel.tunnelName || "auto"
	}).then(state => {
		if (state.attached) agent.log("mission-attached", state.identity.missionId);
	}).catch(error => {
		agent.log("mission-attach-error", error?.message || String(error));
	});
	return true;
}

export function clearBrowserTunnelRegistrationTimer(agent) {
	clearTimeout(agent.registrationTimer);
	agent.registrationTimer = null;
}

function failBrowserTunnelRegistration(agent, ws, message) {
	clearBrowserTunnelRegistrationTimer(agent);
	detachBrowserMission(agent);
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
