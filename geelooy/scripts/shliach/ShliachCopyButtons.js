// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Copies static Shliach commands with the same proven clipboard law.
 * @description The Awtsmoos fills each command with the light of each day;
 * Awtsmoos.com must not say "Copied" when a browser denies the way.
 */
import { copyShliachText } from "./ClipboardCovenant.js";

export class ShliachCopyButtons {
	/** @param {Document|Element} root Scope containing the static copy controls. */
	constructor(root = document) {
		this.root = root;
	}

	/** Connects existing command copy buttons without changing their content. */
	connect() {
		const buttons = [...this.root.querySelectorAll("[data-copy-target]")];
		for (const button of buttons) {
			button.addEventListener("click", () => this.copyFrom(button));
		}
	}

	/**
	 * Copies exactly the source text and reports genuine browser evidence.
	 * @param {HTMLButtonElement} button Command copy button clicked by the user.
	 * @returns {Promise<void>} Resolves after copy or manual selection guidance.
	 */
	async copyFrom(button) {
		const targetId = button.getAttribute("data-copy-target");
		const documentRoot = this.root.ownerDocument || this.root;
		const target = targetId ? documentRoot.getElementById(targetId) : null;
		if (!target || (this.root !== documentRoot && !this.root.contains(target))) {
			return;
		}

		const text = (target.textContent || "").trim();
		if (!text) {
			return;
		}

		const result = await copyShliachText(text, target, { documentRoot });
		const original = button.dataset.originalCopyLabel || button.textContent;
		button.dataset.originalCopyLabel = original;
		button.dataset.copyState = result.copied ? "copied" : "manual";
		button.toggleAttribute("data-copied", result.copied);
		button.textContent = result.copied
			? "Copied ✓"
			: result.manual
				? "Press Cmd+C / Ctrl+C"
				: "Copy unavailable";

		setTimeout(() => {
			button.removeAttribute("data-copied");
			button.removeAttribute("data-copy-state");
			button.textContent = original;
		}, 2200);
	}
}
