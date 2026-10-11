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
		if (this.ws) return;
		this.enabled = true;
		this.fatalError = false;
		this.render("connecting");
		let login;
		try {
			login = await requireBrowserTunnelLogin();
		} catch (error) {
			this.enabled = false;
			this.render("sign in required — log in to Awtsmoos, then Start again", "error");
			return;
		}
		if (!this.enabled) return;
		this.accountCapabilities = login?.capabilities || null;
		try {
			this.ws = new WebSocket(browserTunnelWsUrl());
		} catch (error) {
			this.enabled = false;
			this.ws = null;
			this.render("could not open socket — server unreachable", "error");
			return;
		}
		this.ws.addEventListener("open", () => {
			if (this.connectTimer) { clearTimeout(this.connectTimer); this.connectTimer = null; }
			this.register();
		});
		this.ws.addEventListener("message", event => this.onMessage(event.data));
		this.ws.addEventListener("error", () => this.onSocketError());
		this.ws.addEventListener("close", () => this.onClose());
		if (this.connectTimer) clearTimeout(this.connectTimer);
		this.connectTimer = setTimeout(() => {
			this.connectTimer = null;
			if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
				this.onSocketError("connection timed out — server unreachable");
			}
		}, 15000);
	},

	onSocketError(message) {
		this.fatalError = true;
		this.enabled = false;
		if (this.connectTimer) { clearTimeout(this.connectTimer); this.connectTimer = null; }
		try { this.ws?.close(); } catch {}
		this.ws = null;
		this.render(message || "connection failed — server unreachable", "error");
	},

	stop() {
		this.enabled = false;
		this.fatalError = false;
		if (this.connectTimer) { clearTimeout(this.connectTimer); this.connectTimer = null; }
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
		if (this.connectTimer) { clearTimeout(this.connectTimer); this.connectTimer = null; }
		this.ws = null;
		if (this.fatalError) {
			// The error text is already on screen; don't overwrite it.
			this.fatalError = false;
			return;
		}
		this.render("disconnected");
		if (this.enabled) setTimeout(() => this.start().catch(console.error), 2000);
	},

	send(packet) {
		if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(packet));
	},

	render(text, tone) {
		if (this.statusEl) this.statusEl.textContent = text;
		const pill = document.getElementById("browserPill");
		if (pill) {
			const live = /connected|registering/.test(text);
			const bad = tone === "error";
			pill.textContent = text;
			pill.classList.toggle("good", live && !bad);
			pill.classList.toggle("idle", !live && !bad);
			pill.classList.toggle("bad", bad);
		}
		const stop = document.getElementById("stopBrowserTunnel");
		if (stop) stop.disabled = !this.ws;
		const start = document.getElementById("startBrowserTunnel");
		if (start) start.disabled = !!this.ws;
	}
};
