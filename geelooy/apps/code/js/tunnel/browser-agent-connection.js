// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Code browser-tunnel socket lifecycle independent of remembered preference.
 * @description
 * The Awtsmoos lets a socket rise and fall inside consent already granted for this
 * runtime. Awtsmoos.com verifies the account before each fresh connection, waits for
 * registration before declaring authority, ignores stale vessels, and reconnects only
 * while the present Code tab still carries session or remembered runtime permission.
 */

import { State } from "../state.js";
import { UI } from "../ui.js";
import { BROWSER_PREVIEW_ACTIONS, COMMAND_ACTIONS, FS_ACTIONS } from "./browser-agent-capabilities.js";
import { nextBrowserReconnectDelay } from "./browser-agent-backoff.js";
import { ensureBrowserTunnelRuntimeConsent } from "./browser-agent-consent.js";
import { codeBrowserRegistrationPacket } from "./browser-agent-packets.js";
import {
	beginBrowserTunnelRegistration,
	clearBrowserTunnelRegistrationTimer
} from "./browser-agent-registration.js";
import { verifyBrowserTunnelSession } from "./browser-agent-session.js";
import { websocketUrl } from "./browser-agent-state.js";

export async function startBrowserTunnel(agent) {
	if (agent.ws || agent.connecting) return agent.getStatus();
	ensureBrowserTunnelRuntimeConsent();
	const connectionEpoch = (agent.connectionEpoch || 0) + 1;
	agent.connectionEpoch = connectionEpoch;
	agent.connecting = true;
	agent.setStatus("connecting");
	try {
		await verifyBrowserTunnelSession();
		if (agent.connectionEpoch !== connectionEpoch || !State.browserTunnel.enabled) {
			agent.connecting = false;
			return agent.getStatus();
		}
		const ws = new WebSocket(websocketUrl());
		agent.ws = ws;
		ws.addEventListener("open", () => onOpen(agent, ws));
		ws.addEventListener("message", event => agent.onMessage(event.data, ws));
		ws.addEventListener("close", () => onClose(agent, ws));
		ws.addEventListener("error", () => onError(agent, ws, "WebSocket error"));
	} catch (error) {
		agent.connecting = false;
		State.browserTunnel.lastError = error.message;
		agent.setStatus("error");
		agent.log("error", error.message);
		UI.showToast(`Browser tunnel: ${error.message}`, "error", 7000);
	}
	return agent.getStatus();
}

export function stopBrowserTunnel(agent) {
	agent.connectionEpoch = (agent.connectionEpoch || 0) + 1;
	State.browserTunnel.enabled = false;
	State.browserTunnel.consentMode = "disabled";
	clearTimeout(agent.reconnectTimer);
	clearBrowserTunnelRegistrationTimer(agent);
	try {
		agent.ws?.close();
	} catch {}
	agent.ws = null;
	agent.connecting = false;
	State.browserTunnel.connectedAt = null;
	agent.setStatus("idle");
	agent.log("stopped", "Current browser tunnel session stopped.");
	return agent.getStatus();
}

export function sendPacket(agent, packet) {
	if (agent.ws?.readyState !== WebSocket.OPEN) return false;
	agent.ws.send(JSON.stringify(packet));
	return true;
}

function onOpen(agent, ws) {
	if (agent.ws !== ws) return;
	agent.connecting = false;
	State.browserTunnel.connectedAt = null;
	State.browserTunnel.lastError = "";
	beginBrowserTunnelRegistration(agent, ws, codeBrowserRegistrationPacket({
		tunnelName: State.browserTunnel.tunnelName,
		fsActions: [...FS_ACTIONS],
		commandActions: [...COMMAND_ACTIONS],
		previewActions: [...BROWSER_PREVIEW_ACTIONS],
		userAgent: navigator.userAgent
	}), sendPacket);
}

function onClose(agent, ws) {
	if (agent.ws !== ws) return;
	clearBrowserTunnelRegistrationTimer(agent);
	agent.ws = null;
	agent.connecting = false;
	State.browserTunnel.connectedAt = null;
	const reconnecting = Boolean(State.browserTunnel.enabled);
	agent.setStatus(reconnecting ? "reconnecting" : "disconnected");
	agent.log("disconnected", "Browser tunnel socket closed.");
	if (!reconnecting) return;
	agent.reconnectTimer = setTimeout(
		() => startBrowserTunnel(agent),
		nextBrowserReconnectDelay(agent)
	);
}

function onError(agent, ws, message) {
	if (agent.ws !== ws) return;
	clearBrowserTunnelRegistrationTimer(agent);
	agent.connecting = false;
	State.browserTunnel.lastError = message;
	agent.setStatus("error");
	agent.log("error", message);
}
