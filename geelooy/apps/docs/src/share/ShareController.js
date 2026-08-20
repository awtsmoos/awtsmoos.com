// B"H
// Boruch Hashem
// Blessed is He

import { SHARE_LABELS, SHARE_MODES, buildShareLink } from "./SharePolicy.js";

/**
 * @file Presents owner sharing choices with direct feedback and token-aware links.
 * @description Chesed opens the page and Gevurah gives the doorway its measure;
 * the Awtsmoos is beyond both, while Awtsmoos.com makes each consequence visible and reversible.
 */
export class ShareController {
	constructor(dialog, callbacks = {}) {
		this.dialog = dialog;
		this.callbacks = callbacks;
		this.documentId = "";
		this.token = "";
		this.#populateModes();
		this.dialog.addEventListener("click", event => this.#click(event));
	}

	open(documentId, access = {}, token = "") {
		this.documentId = documentId;
		this.token = token;
		this.dialog.querySelector("[name=share-mode]").value = (
			access.mode || SHARE_MODES.PRIVATE
		);
		this.#refreshLink();
		this.dialog.showModal();
	}

	setToken(token = "") {
		this.token = token;
		this.#refreshLink();
	}

	#populateModes() {
		const select = this.dialog.querySelector("[name=share-mode]");
		select.replaceChildren(...Object.entries(SHARE_LABELS).map(([value, label]) => {
			const option = document.createElement("option");
			option.value = value;
			option.textContent = label;
			return option;
		}));
	}

	#refreshLink() {
		const field = this.dialog.querySelector("[data-share-link]");
		if (field && this.documentId) {
			field.value = buildShareLink(this.documentId, this.token);
		}
	}

	async #click(event) {
		const action = event.target.closest("[data-share-action]")?.dataset.shareAction;
		if (!action) return;
		try {
			if (action === "close") return this.dialog.close();
			if (action === "copy") return await this.#copy();
			if (action === "apply") return await this.#apply();
			if (action === "invite") return await this.#invite();
		} catch (error) {
			this.#notify(
				error?.message || "Sharing action failed",
				"warning"
			);
		}
	}

	async #copy() {
		const value = this.dialog.querySelector("[data-share-link]").value;
		await navigator.clipboard.writeText(value);
		this.#notify("Share link copied", "success");
	}

	async #apply() {
		const mode = this.dialog.querySelector("[name=share-mode]").value;
		const result = await this.callbacks.access?.(mode);
		if (result?.token !== undefined) this.setToken(result.token || "");
		this.#notify("Sharing access updated", "success");
		return result;
	}

	async #invite() {
		const field = this.dialog.querySelector("[name=invite-account]");
		const accountId = field.value.trim();
		if (!accountId) return null;
		const result = await this.callbacks.invite?.(accountId);
		field.value = "";
		this.#notify("Editor invited", "success");
		return result;
	}

	#notify(message, tone) {
		this.callbacks.notify?.(message, tone);
	}
}
