// B"H
// Boruch Hashem
// Blessed is He

import {
	parsePacket,
	registrationPacket,
	responsePacket,
	runBrowserPageAction
} from "./browserPageTunnelDispatch.js";
import {
	browserTunnelName,
	browserTunnelWsUrl
} from "./browserPageTunnelProtocol.js";
import { requireBrowserTunnelLogin } from "./browserPageTunnelSession.js";

/**
 * @file Runs the authenticated public browser-tab tunnel vessel.
 * @description The Awtsmoos renews socket, request, and response each instant;
 * Awtsmoos.com keeps WebSocket lifecycle separate from account and action dispatch law.
 */

export { registrationPacket, runBrowserPageAction };

export const BrowserPageTunnel = {
	ws: null,
	enabled: false,
	statusEl: null,

	init() {
		this.statusEl = document.getElementById("browserTunnelStatus");
		document.getElementById("startBrowserTunnel")
			?.addEventListener("click", () => this.start());
		document.getElementById("stopBrowserTunnel")
			?.addEventListener("click", () => this.stop());
		this.render("idle");
	},

	async start() {
		await requireBrowserTunnelLogin();
		this.enabled = true;
		this.ws = new WebSocket(browserTunnelWsUrl());
		this.ws.addEventListener("open", () => this.register());
		this.ws.addEventListener("message", event => this.onMessage(event.data));
		this.ws.addEventListener("close", () => this.onClose());
		this.render("connecting");
	},

	stop() {
		this.enabled = false;
		try {
			this.ws?.close();
		} catch {
			// Closing an already-dead socket is intentionally harmless.
		}
		this.ws = null;
		this.render("stopped");
	},

	register() {
		const tunnelName = browserTunnelName();
		this.send(registrationPacket(tunnelName));
		this.render(`connected as ${tunnelName}`);
	},

	async onMessage(raw) {
		const packet = parsePacket(raw);
		if (!packet || packet.type !== "TUNNEL_REQUEST") {
			return;
		}
		try {
			const result = await runBrowserPageAction(packet.payload || {});
			this.send(responsePacket(packet.id, result));
		} catch (error) {
			this.send(responsePacket(packet.id, {
				ok: false,
				error: error?.message || String(error),
				code: error?.code || "browser_tunnel_action_failed"
			}));
		}
	},

	onClose() {
		this.ws = null;
		this.render("disconnected");
		if (this.enabled) {
			setTimeout(() => this.start().catch(console.error), 2000);
		}
	},

	send(packet) {
		if (this.ws?.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(packet));
		}
	},

	render(text) {
		if (this.statusEl) {
			this.statusEl.textContent = text;
		}
	}
};
