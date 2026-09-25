// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Coordinates external-AI onboarding without hiding transport truth.
 * @description
 * The Awtsmoos sends light through changing vessels; Awtsmoos.com lets the visitor
 * choose a safe path, copy a secret-free covenant, and see what is actually live.
 */
import { buildExternalAiPrompt } from "./ExternalAiPrompt.js";
import { discoverConnectionMetadata } from "./ConnectionMetadata.js";

export class OhrExternalAiGuide {
	constructor(root = document) {
		this.container = root.querySelector("[data-external-ai-guide]");
		this.modeButtons = [...root.querySelectorAll("[data-connection-mode]")];
		this.prompt = root.querySelector("[data-external-ai-prompt]");
		this.copyButton = root.querySelector("[data-copy-external-ai-prompt]");
		this.copyStatus = root.querySelector("[data-copy-status]");
		this.status = root.querySelector("[data-agent-link-status]");
		this.detail = root.querySelector("[data-agent-link-detail]");
	}

	/** Activates strategy selection, live capability discovery and accessible copy behavior. */
	connect() {
		if (!this.container || !this.prompt) {
			return;
		}

		this.selectMode("automatic");
		for (const button of this.modeButtons) {
			button.addEventListener("click", () => {
				this.selectMode(button.dataset.connectionMode);
			});
		}
		this.copyButton?.addEventListener("click", () => this.copyPrompt());
		this.refreshCapabilities();
	}

	/** Selects one connection strategy while preserving a credentials-free prompt. */
	selectMode(mode) {
		for (const button of this.modeButtons) {
			const selected = button.dataset.connectionMode === mode;
			button.setAttribute("aria-selected", String(selected));
			button.toggleAttribute("data-active", selected);
		}

		this.prompt.value = buildExternalAiPrompt(mode);
	}

	/** Reads live OAuth metadata before promising persistent Agent Link support. */
	async refreshCapabilities() {
		const metadata = await discoverConnectionMetadata();
		if (metadata.persistentSupported) {
			this.renderStatus("ready", "Persistent Agent Link advertised", "Pair once when your connector can store credentials securely outside chat.");
			return;
		}
		if (metadata.ok) {
			this.renderStatus("standard", "Standard OAuth ready", "Use PKCE or device verification. Persistence appears only when live metadata advertises it.");
			return;
		}
		this.renderStatus("fallback", "Connection guide ready", "Metadata could not be checked. Your AI will inspect live docs before choosing a flow.");
	}

	/** Renders one compact live capability state without exposing credentials. */
	renderStatus(state, label, detail) {
		if (this.status) {
			this.status.dataset.state = state;
			this.status.textContent = label;
		}
		if (this.detail) {
			this.detail.textContent = detail;
		}
		this.container.dataset.persistence = state;
	}

	/** Copies the generated prompt with a selectable fallback for restrictive browsers. */
	async copyPrompt() {
		try {
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(this.prompt.value);
			} else {
				this.prompt.focus();
				this.prompt.select();
				document.execCommand("copy");
			}
			if (this.copyStatus) {
				this.copyStatus.textContent = "Connection prompt copied. Paste it into your external AI.";
			}
		} catch (error) {
			if (this.copyStatus) {
				this.copyStatus.textContent = "Copy was blocked. Select the prompt and copy it manually.";
			}
		}
	}
}
