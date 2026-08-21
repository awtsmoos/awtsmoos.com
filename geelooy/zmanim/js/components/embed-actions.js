//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond clipboard, iframe, server document, comparison, and JSON while one measured day may travel through every vessel;
 * Awtsmoos.com coordinates quick presets and custom embed choices without letting integration logic become another calculator to wrestle.
 */

import { buildEmbedCode } from "../domain/embed-mode.js";
import {
	buildServerEmbedCode,
	buildZmanimApiUrl
} from "../domain/server-embed-url.js";
import { readEmbedConfig, synchronizeEmbedForm } from "./embed-config.js";
import { renderEmbedActionsView } from "./embed-actions-view.js";

/** Copy-ready embed configurator for interactive, server HTML, and JSON integrations. */
export class AwtsmoosEmbedActions extends HTMLElement {
	constructor() {
		super();
		this.boundClick = event => this.handleClick(event);
		this.boundChange = event => this.handleChange(event);
	}

	connectedCallback() {
		this.render();
		this.addEventListener("click", this.boundClick);
		this.addEventListener("change", this.boundChange);
	}

	disconnectedCallback() {
		this.removeEventListener("click", this.boundClick);
		this.removeEventListener("change", this.boundChange);
	}

	async handleClick(event) {
		const presetButton = event.target.closest("button[data-embed-mode]");
		const customButton = event.target.closest("button[data-embed-copy]");
		if (!presetButton && !customButton) {
			return;
		}
		const mode = presetButton?.dataset.embedMode || "custom";
		const target = presetButton?.dataset.embedTarget || customButton.dataset.embedCopy;
		const custom = mode === "custom"
			? readEmbedConfig(this.querySelector(".embed-options-form"))
			: {};
		const value = this.copyValue(target, mode, custom);
		if (!value) {
			this.status("That embed target is unavailable.");
			return;
		}
		try {
			await navigator.clipboard.writeText(value);
			this.status(this.successMessage(target, mode));
		} catch (error) {
			this.status("Clipboard access was blocked by this browser.");
		}
	}

	handleChange(event) {
		const form = event.target.closest(".embed-options-form");
		if (form) {
			synchronizeEmbedForm(form);
		}
	}

	copyValue(target, mode, custom) {
		if (target === "interactive") {
			return buildEmbedCode(mode, undefined, custom);
		}
		if (target === "server") {
			return buildServerEmbedCode(mode, undefined, custom);
		}
		if (target === "api") {
			return buildZmanimApiUrl().href;
		}
		return "";
	}

	render() {
		this.replaceChildren(renderEmbedActionsView());
		synchronizeEmbedForm(this.querySelector(".embed-options-form"));
	}

	successMessage(target, mode) {
		const targetLabel = target === "server" ? "server HTML" : target;
		return `Copied ${mode} ${targetLabel} integration.`;
	}

	status(message) {
		const status = this.querySelector(".embed-status");
		if (status) {
			status.textContent = message;
		}
	}
}

customElements.define("awtsmoos-embed-actions", AwtsmoosEmbedActions);
