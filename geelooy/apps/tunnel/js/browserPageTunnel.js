//B"H
// Boruch Hashem
// Blessed is He

import {
	parsePacket,
	registrationPacket,
	responsePacket,
	runBrowserPageAction
} from "./browserPageTunnelDispatch.js";
import { attachMissionSurface, detachMissionSurface } from "./missionSurfaceAttachment.js";
import { browserTunnelName, browserTunnelWsUrl } from "./browserPageTunnelProtocol.js";
import { requireBrowserTunnelLogin } from "./browserPageTunnelSession.js";

/**
 * @file Runs the authenticated browser Tunnel and attaches it to authoritative Mission state.
 * @description The Awtsmoos renews socket and Mission incarnation each instant; Awtsmoos.com
 * makes this browser a Room/Work/Context participant without moving durable authority into the tab.
 */
export { registrationPacket, runBrowserPageAction };

export const BrowserPageTunnel = {
	ws: null,
	enabled: false,
	statusEl: null,
	tunnelName: "",
	missionSurface: null,

	init() {
		this.statusEl = document.getElementById("browserTunnelStatus");
		document.getElementById("startBrowserTunnel")?.addEventListener("click", () => this.start());
		document.getElementById("stopBrowserTunnel")?.addEventListener("click", () => this.stop());
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
		detachMissionSurface(this);
		try { this.ws?.close(); } catch {}
		this.ws = null;
		this.render("stopped");
	},

	register() {
		this.tunnelName = browserTunnelName();
		this.send(registrationPacket(this.tunnelName));
		this.render(`registering as ${this.tunnelName}`);
	},

	async onMessage(raw) {
		const packet = parsePacket(raw);
		if (!packet) return;
		if (packet.type === "TUNNEL_ACK" && packet.ok) {
			this.render(`connected as ${this.tunnelName}`);
			await attachMissionSurface(this, { tunnelName: this.tunnelName }).catch(error => {
				console.warn("Mission surface attach failed", error);
			});
			return;
		}
		if (packet.type !== "TUNNEL_REQUEST") return;
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
		detachMissionSurface(this);
		this.ws = null;
		this.render("disconnected");
		if (this.enabled) setTimeout(() => this.start().catch(console.error), 2000);
	},

	send(packet) {
		if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(packet));
	},

	render(text) {
		if (this.statusEl) this.statusEl.textContent = text;
	}
};
