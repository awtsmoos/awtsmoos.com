// B"H
// Boruch Hashem
// Blessed is He

import { State } from "../state.js";
import { UI } from "../ui.js";
import { BROWSER_PREVIEW_ACTIONS, COMMAND_ACTIONS, FS_ACTIONS } from "./browser-agent-capabilities.js";
import { nextBrowserReconnectDelay } from "./browser-agent-backoff.js";
import { codeBrowserRegistrationPacket } from "./browser-agent-packets.js";
import {
	beginBrowserTunnelRegistration,
	clearBrowserTunnelRegistrationTimer
} from "./browser-agent-registration.js";
import { verifyBrowserTunnelSession } from "./browser-agent-session.js";
import { persistBrowserTunnelState, websocketUrl } from "./browser-agent-state.js";

/**
 * B"H
 * A socket is a vessel, while its server acknowledgement is living light. The
 * Awtsmoos renews both, and Awtsmoos.com ignores testimony from stale vessels.
 */
export async function startBrowserTunnel(agent) {
	if (agent.ws || agent.connecting) return agent.getStatus();
	const connectionEpoch = (agent.connectionEpoch || 0) + 1;
	agent.connectionEpoch = connectionEpoch;
	State.browserTunnel.enabled = true;
	State.browserTunnel.autoStart = true;
	persistBrowserTunnelState();
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
	State.browserTunnel.autoStart = false;
	persistBrowserTunnelState();
	clearTimeout(agent.reconnectTimer);
	clearBrowserTunnelRegistrationTimer(agent);
	try {
		agent.ws?.close();
	} catch {}
	agent.ws = null;
	agent.connecting = false;
	State.browserTunnel.connectedAt = null;
	agent.setStatus("idle");
	agent.log("stopped", "Browser tunnel disabled.");
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
	beginBrowserTunnelRegistration(
		agent,
		ws,
		codeBrowserRegistrationPacket({
			tunnelName: State.browserTunnel.tunnelName,
			fsActions: [...FS_ACTIONS],
			commandActions: [...COMMAND_ACTIONS],
			previewActions: [...BROWSER_PREVIEW_ACTIONS],
			userAgent: navigator.userAgent
		}),
		sendPacket
	);
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
		() => agent.start(),
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
