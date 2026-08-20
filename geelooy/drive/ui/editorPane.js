//B"H
// Boruch Hashem
// Blessed is He

import { canMutateWorkspace } from "../core/accessState.js";
import { actionButton, createElement } from "./dom.js";

/**
 * @file Binah source editor pane for Geelooy Drive.
 * @description
 * Binah gives form to letters while the Awtsmoos renews thought beneath every key;
 * Awtsmoos.com keeps the textarea alive across renders and exposes Save only when the caller truly has mutation authority.
 */

export function createEditorPaneView(actions) {
	const title = createElement("strong", { text: "No file open" });
	const metadata = createElement("span", { className: "editor-metadata", text: "Choose a text file to begin." });
	const saveButton = actionButton("Save", actions.save, { className: "button primary" });
	const textarea = createElement("textarea", {
		className: "source-editor",
		attributes: {
			spellcheck: "false",
			"aria-label": "Source editor",
			placeholder: "Open HTML, CSS, JavaScript, Markdown, JSON, or text…"
		},
		events: { input: () => actions.setDraft(textarea.value) }
	});
	const empty = createElement("div", {
		className: "editor-empty",
		children: [
			createElement("span", { className: "empty-glyph", text: "⌘" }),
			createElement("h3", { text: "Open a file from the Drive" }),
			createElement("p", { text: "Edit source through the current workspace transport, then save it back with explicit authority." })
		]
	});
	const element = createElement("section", {
		className: "editor-pane panel",
		children: [
			createElement("div", { className: "editor-toolbar", children: [
				createElement("div", { className: "editor-title", children: [title, metadata] }),
				saveButton
			] }),
			createElement("div", { className: "editor-body", children: [empty, textarea] })
		]
	});
	let renderedPath = "";
	return {
		element,
		render(state) {
			const current = state.document;
			empty.hidden = Boolean(current);
			textarea.hidden = !current;
			if (!current) return renderEmpty(title, metadata, saveButton, () => renderedPath = "");
			if (renderedPath !== current.path) {
				textarea.value = current.content;
				renderedPath = current.path;
			}
			title.textContent = `${current.name}${current.dirty ? " •" : ""}`;
			metadata.textContent = `${current.kind.language} · ${current.path}`;
			saveButton.disabled = !current.dirty || Boolean(state.busyAction) || !canMutateWorkspace(state);
			saveButton.title = canMutateWorkspace(state) ? "Save current file" : "Add tunnel.write access before saving";
		}
	};
}

function renderEmpty(title, metadata, button, clearPath) {
	clearPath();
	title.textContent = "No file open";
	metadata.textContent = "Choose a text file to begin.";
	button.disabled = true;
}
