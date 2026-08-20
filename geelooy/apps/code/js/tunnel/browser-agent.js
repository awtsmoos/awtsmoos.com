// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Consent-aware Apps Code browser-tunnel facade.
 * @description
 * The Awtsmoos lets one Code tab expose a temporary browser vessel while a separate
 * remembered invitation may permit future Code openings to reconnect. Awtsmoos.com
 * keeps transport, consent, logical agents, and browser authority named separately
 * so no remembered preference can masquerade as a live or native tunnel.
 */

import { State } from "../state.js";
import { BrowserTargetRegistry } from "../browser/target-registry.js";
import { nodeCapabilityReport } from "../node/capabilities.js";
import { CodeTunnelActions } from "./action-ledger.js";
import {
	forgetRememberedBrowserTunnel,
	startBrowserTunnelSession,
	startRememberedBrowserTunnel,
	startRememberedBrowserTunnelOnBoot,
	stopCurrentBrowserTunnel
} from "./browser-agent-consent.js";
import { handleBrowserTunnelMessage } from "./browser-agent-messages.js";
import { initializeBrowserTunnelState } from "./browser-agent-state.js";
import { handleBrowserTunnelRequest } from "./browser-agent-request.js";
import { CodeTunnelSessions } from "./session-registry.js";
import { buildTunnelStatusModel } from "./tunnel-status-model.js";

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
		if (State.browserTunnel.remembered) {
			void startRememberedBrowserTunnelOnBoot(this);
		}
		return this.getStatus();
	},

	start() {
		if (!this.initialized) this.init();
		return startBrowserTunnelSession(this);
	},

	startRemembered() {
		if (!this.initialized) this.init();
		return startRememberedBrowserTunnel(this);
	},

	stop() {
		return stopCurrentBrowserTunnel(this);
	},

	forgetRemembered() {
		return forgetRememberedBrowserTunnel(this);
	},

	onMessage(raw, sourceWs = this.ws) {
		return handleBrowserTunnelMessage(this, raw, sourceWs);
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
