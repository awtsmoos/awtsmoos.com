// B"H
// Boruch Hashem
// Blessed is He

import { State } from "../state.js";
import { BrowserTargetRegistry } from "../browser/target-registry.js";
import { nodeCapabilityReport } from "../node/capabilities.js";
import { CodeTunnelActions } from "./action-ledger.js";
import {
	sendPacket,
	startBrowserTunnel,
	stopBrowserTunnel
} from "./browser-agent-connection.js";
import { handleBrowserTunnelRegistrationAck } from "./browser-agent-registration.js";
import { initializeBrowserTunnelState } from "./browser-agent-state.js";
import { handleBrowserTunnelRequest } from "./browser-agent-request.js";
import { CodeTunnelSessions } from "./session-registry.js";
import { buildTunnelStatusModel } from "./tunnel-status-model.js";

/**
 * B"H
 * The browser facade holds one current socket and many logical agents. The
 * Awtsmoos renews each vessel; Awtsmoos.com rejects messages from stale sockets.
 */
export const BrowserTunnelAgent = {
	ws: null,
	reconnectTimer: null,
	registrationTimer: null,
	reconnectAttempt: 0,
	connecting: false,
	initialized: false,
	events: [],

	init() {
		if (this.initialized) return this.getStatus();
		this.initialized = true;
		initializeBrowserTunnelState();
		globalThis.BrowserTunnelAgent = this;
		this.emitUpdate();
		if (State.browserTunnel.autoStart) void this.start();
		return this.getStatus();
	},

	start() {
		if (!this.initialized) this.init();
		return startBrowserTunnel(this);
	},

	stop() {
		return stopBrowserTunnel(this);
	},

	async onMessage(raw, sourceWs = this.ws) {
		if (sourceWs && this.ws !== sourceWs) return;
		let data;
		try {
			data = JSON.parse(raw);
		} catch {
			return;
		}
		if (data.type === "TUNNEL_ACK") {
			handleBrowserTunnelRegistrationAck(this, data);
			return;
		}
		if (data.type === "TUNNEL_REPLACED") {
			this.log("replaced", "This browser tunnel was replaced by another tab.");
			return;
		}
		if (data.type !== "TUNNEL_REQUEST") return;
		const result = await handleBrowserTunnelRequest(data.payload || {});
		sendPacket(this, {
			type: "TUNNEL_RESPONSE",
			id: data.id,
			...result,
			vessel: "browser-tab",
			tunnelName: State.browserTunnel.tunnelName
		});
		this.log("response", result.ok === false ? result.error || "failed" : "ok");
	},

	handleRequest(payload) {
		return handleBrowserTunnelRequest(payload);
	},

	setStatus(value) {
		State.browserTunnel.status = value;
		State.browserTunnel.reconnectAttempt = this.reconnectAttempt;
		this.emitUpdate();
	},

	log(type, message) {
		this.events.unshift({
			type,
			message: String(message || "").slice(0, 240),
			at: new Date().toISOString()
		});
		this.events.splice(60);
		this.emitUpdate();
	},

	getStatus() {
		return buildTunnelStatusModel({
			tunnel: State.browserTunnel,
			sessions: CodeTunnelSessions.snapshot(),
			actions: CodeTunnelActions.snapshot(),
			browserTarget: BrowserTargetRegistry.snapshot(),
			runtime: {
				...nodeCapabilityReport({ nativeTunnel: false }),
				browserTunnelConnected: State.browserTunnel.status === "connected"
			}
		});
	},

	emitUpdate() {
		globalThis.dispatchEvent?.(new CustomEvent("awtsmoos:code-tunnel-update", {
			detail: this.getStatus()
		}));
	}
};
