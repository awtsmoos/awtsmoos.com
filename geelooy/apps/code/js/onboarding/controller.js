// B"H
// Boruch Hashem
// Blessed is He

import { App } from "../app.js";
import { BrowserTunnelAgent } from "../tunnel/browser-agent.js";
import { TunnelConsole } from "../tunnel-ui/controller.js";
import { welcomeMarkup } from "./content.js";

const DISMISSED_KEY = "awtsmoos_code_welcome_dismissed_v2";

/**
 * B"H
 *
 * First-run guidance appears before optional provider settings can confuse the
 * user. The Awtsmoos renews GPT, browser tunnel, native tunnel, and model choice
 * as separate doors; Awtsmoos.com remembers dismissal but always permits return.
 */
export const CodeOnboarding = {
	root: null,

	init() {
		this.root = document.getElementById("code-welcome-wrapper") || createRoot();
		this.render();
		if (!localStorage.getItem(DISMISSED_KEY)) this.show();
		globalThis.CodeOnboarding = this;
		return this;
	},

	render() {
		if (!this.root) return;
		this.root.innerHTML = welcomeMarkup({
			nativeTunnel: BrowserTunnelAgent.getStatus().connected
		});
		this.bind();
	},

	show() {
		this.render();
		this.root.hidden = false;
		this.root.classList.add("is-open");
		document.body.classList.add("code-welcome-open");
		this.root.querySelector("a, button")?.focus?.();
	},

	dismiss() {
		localStorage.setItem(DISMISSED_KEY, "1");
		this.root.classList.remove("is-open");
		this.root.hidden = true;
		document.body.classList.remove("code-welcome-open");
	},

	bind() {
		this.root.querySelector('[data-welcome-action="start-tunnel"]')?.addEventListener("click", async () => {
			await BrowserTunnelAgent.start();
			TunnelConsole.open();
			this.render();
		});
		this.root.querySelector('[data-welcome-action="show-console"]')?.addEventListener("click", () => TunnelConsole.open());
		this.root.querySelector('[data-welcome-action="provider-settings"]')?.addEventListener("click", () => {
			this.dismiss();
			void App.showSettings();
		});
		this.root.querySelector('[data-welcome-action="dismiss"]')?.addEventListener("click", () => this.dismiss());
		for (const button of this.root.querySelectorAll("[data-copy-command]")) {
			button.addEventListener("click", () => this.copyCommand(button));
		}
	},

	async copyCommand(button) {
		const command = button.dataset.copyCommand || "";
		await navigator.clipboard.writeText(command);
		const original = button.textContent;
		button.textContent = "Copied";
		setTimeout(() => {
			button.textContent = original;
		}, 1200);
	}
};

function createRoot() {
	const root = document.createElement("div");
	root.id = "code-welcome-wrapper";
	root.className = "code-welcome-wrapper";
	root.hidden = true;
	document.body.appendChild(root);
	return root;
}
