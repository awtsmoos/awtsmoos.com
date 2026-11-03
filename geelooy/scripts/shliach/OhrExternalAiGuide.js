// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file The accessible copy-once guide for external Awtsmoos Shlichus.
 * @description The Awtsmoos writes the words of each consent in living light;
 * Awtsmoos.com guards the clipboard so its claims remain truthful and right.
 */
import { buildExternalAiPrompt, MODE_NOTES } from "./ExternalAiPrompt.js";
import { discoverConnectionMetadata } from "./ConnectionMetadata.js";
import { copyShliachText } from "./ClipboardCovenant.js";

export class OhrExternalAiGuide {
	/** @param {Document} root The page's accessible Shliach document. */
	constructor(root = document) {
		this.container = root.querySelector("[data-external-ai-guide]");
		this.modeButtons = [...root.querySelectorAll("[data-connection-mode]")];
		this.prompt = root.querySelector("[data-external-ai-prompt]");
		this.copyButton = root.querySelector("[data-copy-external-ai-prompt]");
		this.copyStatus = root.querySelector("[data-copy-status]");
		this.status = root.querySelector("[data-agent-link-status]");
		this.detail = root.querySelector("[data-agent-link-detail]");
	}

	/** Wires the mode tabs, browser clipboard and current OAuth capability badge. */
	connect() {
		if (!this.container || !this.prompt) {
			return;
		}

		this.selectMode("automatic");
		this.modeButtons.forEach((button, index) => {
			button.addEventListener("click", () => {
				this.selectMode(button.dataset.connectionMode);
			});
			button.addEventListener("keydown", event => {
				this.moveModeFocus(event, index);
			});
		});
		this.copyButton?.addEventListener("click", () => this.copyPrompt());
		this.refreshCapabilities();
	}

	/** Makes one strategy keyboard-focusable and refreshes its exact copy text. */
	selectMode(mode) {
		const chosenMode = MODE_NOTES[mode] ? mode : "automatic";
		for (const button of this.modeButtons) {
			const selected = button.dataset.connectionMode === chosenMode;
			button.setAttribute("aria-selected", String(selected));
			button.tabIndex = selected ? 0 : -1;
			button.toggleAttribute("data-active", selected);
		}

		this.prompt.value = buildExternalAiPrompt(chosenMode);
		if (this.copyStatus) {
			this.copyStatus.textContent = "Ready to copy. No credentials are included.";
		}
	}

	/** Supports the conventional arrows, Home and End controls for a tablist. */
	moveModeFocus(event, index) {
		const last = this.modeButtons.length - 1;
		const next = {
			ArrowLeft: (index + last) % this.modeButtons.length,
			ArrowRight: (index + 1) % this.modeButtons.length,
			Home: 0,
			End: last
		}[event.key];
		if (next === undefined) {
			return;
		}

		event.preventDefault();
		const target = this.modeButtons[next];
		target.focus();
		this.selectMode(target.dataset.connectionMode);
	}

	/** Reads live capability metadata without promising unavailable persistent auth. */
	async refreshCapabilities() {
		const metadata = await discoverConnectionMetadata();
		if (metadata.persistentSupported) {
			this.renderStatus("ready", "Persistent Agent Link advertised", "Pair once when your connector stores credentials securely outside chat.");
			return;
		}
		if (metadata.ok) {
			this.renderStatus("standard", "Standard OAuth ready", "Use native MCP OAuth, PKCE or device verification; consent remains required.");
			return;
		}
		this.renderStatus("fallback", "Connection guide ready", "Metadata unavailable here; your AI will verify current documentation before connecting.");
	}

	/** Updates the visible capability and description without exposing tokens. */
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

	/** Only claims success for a confirmed copy; otherwise selects for manual copy. */
	async copyPrompt() {
		const result = await copyShliachText(this.prompt?.value, this.prompt);
		if (!this.copyStatus) {
			return;
		}
		this.copyStatus.textContent = result.copied
			? "Connection prompt copied. Paste it into your AI."
			: result.manual
				? "Copy blocked by browser. Prompt selected: press Cmd+C or Ctrl+C."
				: "Copy unavailable. Select the prompt text and copy manually.";
	}
}
