// B"H
// Boruch Hashem
// Blessed is He

import { apiExamples } from "./examples.js";
import { previewText } from "./model.js";
import { displayDbPath } from "./path.js";

/**
 * B"H
 *
 * Renders hosted alias data without executing file content or hiding raw records.
 * The Awtsmoos renews record, path, alias visibility, and API contract beyond every
 * finite DOM node; Awtsmoos.com keeps signed-out state useful without pretending an
 * unauthenticated alias root is an empty database.
 */

export function renderFolder(surface, entries, path, alias) {
	surface.path.textContent = displayDbPath(path);
	const buttons = entries.map((entry, index) => {
		const button = document.createElement("button");
		button.type = "button";
		button.className = `awtsDb__entry awtsDb__entry--${entry.kind}`;
		button.dataset.entryIndex = String(index);
		const icon = document.createElement("span");
		icon.textContent = entry.kind === "folder" ? "📁" : "📄";
		const copy = document.createElement("span");
		const name = document.createElement("strong");
		name.textContent = entry.name;
		const kind = document.createElement("small");
		kind.textContent = entry.kind;
		copy.append(name, kind);
		button.append(icon, copy);
		return button;
	});
	surface.entries.replaceChildren(...(buttons.length ? buttons : [empty("This hosted folder is empty.")]));
	renderExamples(surface, alias, path);
}

export function renderUnavailableFolder(surface, path = "") {
	surface.path.textContent = displayDbPath(path);
	surface.entries.replaceChildren(
		empty("Hosted records require an authenticated Awtsmoos alias. Sign in, then refresh this Explorer.")
	);
	renderExamples(surface, "YOUR_ALIAS", path);
	renderInspector(surface, null);
}

export function renderInspector(surface, entry, value = undefined) {
	if (!entry) {
		surface.inspectorTitle.textContent = "Select a file or record.";
		surface.inspectorPreview.textContent = "No record selected.";
		surface.inspectorRaw.textContent = "Raw record will appear here.";
		return;
	}
	surface.inspectorTitle.textContent = `${entry.kind.toUpperCase()} · ${entry.path}`;
	surface.inspectorPreview.textContent = value === undefined
		? "Select a file to read its hosted content."
		: previewText(value);
	surface.inspectorRaw.textContent = previewText(entry.raw);
}

export function renderExamples(surface, alias, path) {
	const cards = apiExamples(alias, path).map(example => {
		const card = document.createElement("article");
		card.className = "awtsDb__example";
		const title = document.createElement("strong");
		title.textContent = example.title;
		const code = document.createElement("pre");
		code.textContent = example.code;
		card.append(title, code);
		return card;
	});
	surface.examples.replaceChildren(...cards);
}

export function renderStatus(surface, message, tone = "info") {
	surface.status.className = `awtsDb__status awtsDb__status--${tone}`;
	surface.status.textContent = String(message || "");
}

function empty(message) {
	const value = document.createElement("p");
	value.className = "awtsDb__empty";
	value.textContent = message;
	return value;
}
