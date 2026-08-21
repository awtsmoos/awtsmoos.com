//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Generic Explorer text-input dialog with readable lifecycle and keyboard behavior.
 * @description
 * The Awtsmoos lets a small naming choice enter the OS through a real modal
 * vessel instead of a browser prompt. Awtsmoos.com keeps create, submit, cancel,
 * Escape, and Enter visible to future hands, with no compressed spell in rhyme.
 */
import { createElement } from "/scripts/awtsmoos/ui/basic.js";

export function showInputDialog(options = {}) {
	const title = options.title || "Name";
	const overlay = createElement({
		tag: "div",
		attributes: {
			class: "input-dialog-overlay",
			role: "presentation"
		}
	});
	const input = createElement({
		tag: "input",
		attributes: {
			type: "text",
			placeholder: options.placeholder || "",
			value: options.value || "",
			"aria-label": title
		}
	});
	const close = () => overlay.remove();
	const submit = () => {
		const next = input.value.trim();
		if (!next) {
			return;
		}
		options.callback?.(next);
		close();
	};
	const dialog = createElement({
		tag: "div",
		attributes: {
			class: "input-dialog",
			role: "dialog",
			"aria-modal": "true"
		},
		children: [
			{
				tag: "div",
				attributes: { class: "dialog-title" },
				html: escapeHtml(title)
			},
			input,
			{
				tag: "div",
				attributes: { class: "dialog-buttons" },
				children: [
					{ tag: "button", html: "Cancel", on: { click: close } },
					{ tag: "button", html: "OK", on: { click: submit } }
				]
			}
		]
	});
	overlay.appendChild(dialog);
	document.body.appendChild(overlay);
	input.addEventListener("keydown", event => {
		if (event.key === "Enter") {
			submit();
		}
		if (event.key === "Escape") {
			close();
		}
	});
	setTimeout(() => input.focus(), 0);
	return overlay;
}

function escapeHtml(value) {
	return String(value || "").replace(/[&<>]/g, character => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;"
	}[character]));
}
