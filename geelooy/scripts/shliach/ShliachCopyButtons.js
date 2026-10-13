//B"H
//Boruch Hashem
//Blessed is He

/**
 * Copy buttons for tunnel install commands and agent prompts.
 * Yaakov 2026-10-13: one-tap copy for every command and prompt on /Shliach/.
 * @module ShliachCopyButtons
 */
export class ShliachCopyButtons {
	/**
	 * @param {Document|Element} root The scope to search for copy buttons.
	 */
	constructor(root = document) {
		this.root = root;
	}

	/** Wires every [data-copy-target] button to copy its target's text. */
	connect() {
		const buttons = [...this.root.querySelectorAll("[data-copy-target]")];
		buttons.forEach((button) => {
			button.addEventListener("click", () => this.copyFrom(button));
		});
	}

	/**
	 * Copies the text of the target element to the clipboard.
	 * @param {HTMLButtonElement} button The clicked copy button.
	 * @returns {Promise<void>}
	 */
	async copyFrom(button) {
		const targetId = button.getAttribute("data-copy-target");
		const target = targetId ? this.root.getElementById(targetId) : null;
		if (!target) return;
		const text = (target.textContent || "").trim();
		if (!text) return;
		try {
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(text);
			} else {
				const range = document.createRange();
				range.selectNodeContents(target);
				const selection = window.getSelection();
				selection?.removeAllRanges();
				selection?.addRange(range);
				document.execCommand("copy");
				selection?.removeAllRanges();
			}
			button.setAttribute("data-copied", "true");
			const original = button.textContent;
			button.textContent = "Copied ✓";
			setTimeout(() => {
				button.removeAttribute("data-copied");
				button.textContent = original;
			}, 1800);
		} catch {
			button.textContent = "Copy failed";
			setTimeout(() => {
				button.textContent = "Copy";
			}, 1800);
		}
	}
}
