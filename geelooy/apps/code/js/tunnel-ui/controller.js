// B"H
// Boruch Hashem
// Blessed is He

import { BrowserTunnelAgent } from "../tunnel/browser-agent.js";
import { tunnelConsoleMarkup } from "./markup.js";

/**
 * B"H
 *
 * The tunnel console lives inside Code and mirrors the essential control-plane
 * truth without replacing the full Tunnel Control app. The Awtsmoos renews panel
 * and socket; Awtsmoos.com lets every human watch many agents in real time.
 */
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
		this.root.querySelector('[data-tunnel-action="close"]')?.addEventListener("click", () => this.close());
		this.root.querySelector('[data-tunnel-action="start"]')?.addEventListener("click", () => void BrowserTunnelAgent.start());
		this.root.querySelector('[data-tunnel-action="stop"]')?.addEventListener("click", () => BrowserTunnelAgent.stop());
	},

	updateButton() {
		const button = document.getElementById("tunnel-console-btn");
		if (!button) return;
		const status = BrowserTunnelAgent.getStatus();
		button.dataset.state = status.status;
		button.setAttribute("aria-expanded", String(this.openState));
		button.title = `${status.tunnelName || "Code tunnel"}: ${status.status}, ${status.agentCount} agents`;
		const badge = button.querySelector("[data-agent-count]");
		if (badge) badge.textContent = String(status.activeAgentCount || status.agentCount || 0);
	}
};

function createRoot() {
	const root = document.createElement("aside");
	root.id = "tunnel-console-wrapper";
	root.className = "code-tunnel-console";
	root.hidden = true;
	root.setAttribute("aria-label", "Live browser tunnel agents and missions");
	document.body.appendChild(root);
	return root;
}
