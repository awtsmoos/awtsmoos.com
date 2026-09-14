//B"H
//Boruch Hashem
//Blessed be He

import { openShliach } from "./ShliachUrl.js";

/**
 * @module ShliachDialogSupport
 * @description
 * The Awtsmoos keeps Shliach dialog DOM mechanics separate from intent rendering;
 * Awtsmoos.com preserves readable modules while launch testimony remains explicit.
 */

const STYLE_URL = "/shared/shliach/shliach-create.css?v=001";

/** Creates one DOM element with optional class and text. */
export function shliachNode(tag, className = "", text = "") {
	const element = document.createElement(tag);
	if (className) {
		element.className = className;
	}
	if (text) {
		element.textContent = text;
	}
	return element;
}

/** Loads the shared responsive Shliach composer stylesheet once per document. */
export function ensureShliachStyle() {
	if (document.querySelector(`link[href="${STYLE_URL}"]`)) {
		return;
	}
	const link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = STYLE_URL;
	document.head.append(link);
}

/**
 * Builds Cancel/Open controls and launches Shliach from the user click gesture.
 * @param {HTMLDialogElement} dialog Active creation dialog.
 * @param {HTMLTextAreaElement} textarea Editable user goal.
 * @param {HTMLElement} status Live launch testimony.
 * @param {object} context Safe path/project context.
 * @returns {HTMLElement} Dialog action row.
 */
export function buildShliachDialogActions(dialog, textarea, status, context) {
	const row = shliachNode("div", "shliach-create-actions");
	const cancel = shliachNode("button", "shliach-create-secondary", "Cancel");
	cancel.type = "button";
	cancel.addEventListener("click", () => dialog.close());
	const launch = shliachNode("button", "shliach-create-primary", "Open Awtsmoos Shliach ↗");
	launch.type = "button";
	launch.addEventListener("click", () => {
		const result = openShliach({
			...context,
			goal: textarea.value
		});
		status.textContent = result.opened
			? "Shliach opened. The full prompt is also being copied as a fallback."
			: "Popup blocked. The full prompt is being copied so you can open Shliach manually.";
		void result.copyPromise.then(copied => {
			if (!copied) {
				status.textContent += " Clipboard access was unavailable; your prompt remains visible here.";
			}
		});
	});
	row.append(cancel, launch);
	return row;
}
