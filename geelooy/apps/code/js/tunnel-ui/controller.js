// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Consent-aware Code browser-tunnel console controller.
 * @description
 * The Awtsmoos gives each human verb one visible control: session, remember, stop,
 * forget. Awtsmoos.com keeps these actions independent so rendering cannot silently
 * widen consent lifetime, while the compact console continues to mirror live agents,
 * missions, and reconnect truth without replacing the full Tunnel Control app.
 */

import { BrowserTunnelAgent } from "../tunnel/browser-agent.js";
import { tunnelConsoleMarkup } from "./markup.js";

export const TunnelConsole = {
	root: null,
	openState: false,

	init() {
		this.root = document.getElementById("tunnel-console-wrapper") || createRoot();
		document.getElementById("tunnel-console-btn")?.addEventListener("click", () => this.toggle());
		globalThis.addEventListener("awtsmoos:code-tunnel-update", () => this.render());
		globalThis.addEventListener("awtsmoos:code-browser-target", () => this.render());
		this.render();
		globalThis.TunnelConsole = this;
		return this;
	},

	open() {
		this.openState = true;
		this.root.hidden = false;
		this.root.classList.add("is-open");
		this.render();
	},

	close() {
		this.openState = false;
		this.root.classList.remove("is-open");
		this.root.hidden = true;
	},

	toggle() {
		this.openState ? this.close() : this.open();
	},

	render() {
		if (!this.root) return;
		this.root.innerHTML = tunnelConsoleMarkup(BrowserTunnelAgent.getStatus());
		this.root.hidden = !this.openState;
		this.root.classList.toggle("is-open", this.openState);
		this.bindControls();
		this.updateButton();
	},

	bindControls() {
		bind(this.root, "close", () => this.close());
		bind(this.root, "start-session", () => {
			void BrowserTunnelAgent.start();
		});
		bind(this.root, "start-remembered", () => {
			void BrowserTunnelAgent.startRemembered();
		});
		bind(this.root, "stop", () => BrowserTunnelAgent.stop());
		bind(this.root, "forget", () => BrowserTunnelAgent.forgetRemembered());
	},

	updateButton() {
		const button = document.getElementById("tunnel-console-btn");
		if (!button) return;
		const status = BrowserTunnelAgent.getStatus();
		button.dataset.state = status.status;
		button.setAttribute("aria-expanded", String(this.openState));
		button.title = `${status.tunnelName || "Code tunnel"}: ${status.status}, ${status.consentLabel}`;
		const badge = button.querySelector("[data-agent-count]");
		if (badge) badge.textContent = String(status.activeAgentCount || status.agentCount || 0);
	}
};

function bind(root, action, handler) {
	root.querySelector(`[data-tunnel-action="${action}"]`)?.addEventListener("click", handler);
}

function createRoot() {
	const root = document.createElement("aside");
	root.id = "tunnel-console-wrapper";
	root.className = "code-tunnel-console";
	root.hidden = true;
	root.setAttribute("aria-label", "Live browser tunnel agents, consent, and missions");
	document.body.appendChild(root);
	return root;
}
