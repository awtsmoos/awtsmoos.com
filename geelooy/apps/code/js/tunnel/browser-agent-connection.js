// B"H
// Boruch Hashem
// Blessed is He

import { State } from "../state.js";
import { UI } from "../ui.js";
import { codeBrowserRegistrationPacket } from "./browser-agent-packets.js";
import { persistBrowserTunnelState, websocketUrl } from "./browser-agent-state.js";
import {
	BROWSER_PREVIEW_ACTIONS,
	COMMAND_ACTIONS,
	FS_ACTIONS
} from "./browser-agent-request.js";

const MINIMUM_RECONNECT_MS = 1000;
const MAXIMUM_RECONNECT_MS = 30000;

/**
 * B"H
 *
 * Connection policy owns one socket and one bounded reconnect timer. The
 * Awtsmoos renews authentication, registration, replacement, and reconnection;
 * Awtsmoos.com leaves multi-agent identity inside requests, not duplicate sockets.
 */
export async function startBrowserTunnel(agent) {
	if (agent.ws || agent.connecting) return agent.getStatus();
	State.browserTunnel.enabled = true;
	State.browserTunnel.autoStart = true;
	persistBrowserTunnelState();
	agent.connecting = true;
	agent.setStatus("connecting");
	try {
		await checkSession();
		const ws = new WebSocket(websocketUrl());
		agent.ws = ws;
		ws.addEventListener("open", () => onOpen(agent, ws));
		ws.addEventListener("message", event => agent.onMessage(event.data));
		ws.addEventListener("close", () => onClose(agent, ws));
		ws.addEventListener("error", () => onError(agent, "WebSocket error"));
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
	State.browserTunnel.enabled = false;
	State.browserTunnel.autoStart = false;
	persistBrowserTunnelState();
	clearTimeout(agent.reconnectTimer);
	try {
		agent.ws?.close();
	} catch {}
	agent.ws = null;
	agent.connecting = false;
	agent.setStatus("idle");
	agent.log("stopped", "Browser tunnel disabled.");
	return agent.getStatus();
}

export function sendPacket(agent, packet) {
	if (agent.ws?.readyState !== WebSocket.OPEN) return false;
	agent.ws.send(JSON.stringify(packet));
	return true;
}

async function checkSession() {
	const response = await fetch("/api/tunnel/control/me", {
		credentials: "include"
	});
	const data = await response.json();
	if (!data || data.ok === false) {
		throw new Error("Sign in to Awtsmoos before enabling this browser tunnel.");
	}
	State.browserTunnel.user = data.identity || data.user || data;
}

function onOpen(agent, ws) {
	if (agent.ws !== ws) return;
	agent.connecting = false;
	agent.reconnectAttempt = 0;
	State.browserTunnel.connectedAt = new Date().toISOString();
	State.browserTunnel.lastError = "";
	agent.setStatus("connected");
	sendPacket(agent, codeBrowserRegistrationPacket({
		tunnelName: State.browserTunnel.tunnelName,
		fsActions: [...FS_ACTIONS],
		commandActions: [...COMMAND_ACTIONS],
		previewActions: [...BROWSER_PREVIEW_ACTIONS],
		userAgent: navigator.userAgent
	}));
	agent.log("connected", `Browser tunnel connected as ${State.browserTunnel.tunnelName}`);
}

function onClose(agent, ws) {
	if (agent.ws === ws) agent.ws = null;
	agent.connecting = false;
	const reconnecting = Boolean(State.browserTunnel.enabled);
	agent.setStatus(reconnecting ? "reconnecting" : "disconnected");
	agent.log("disconnected", "Browser tunnel socket closed.");
	if (!reconnecting) return;
	agent.reconnectTimer = setTimeout(() => agent.start(), reconnectDelay(agent));
}

function onError(agent, message) {
	agent.connecting = false;
	State.browserTunnel.lastError = message;
	agent.setStatus("error");
	agent.log("error", message);
}

function reconnectDelay(agent) {
	agent.reconnectAttempt += 1;
	const base = Math.min(MAXIMUM_RECONNECT_MS, MINIMUM_RECONNECT_MS * 2 ** (agent.reconnectAttempt - 1));
	return Math.min(MAXIMUM_RECONNECT_MS, base + Math.floor(Math.random() * Math.max(1, base * 0.25)));
}
