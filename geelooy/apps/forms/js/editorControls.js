//B"H
//Boruch Hashem
//Blessed is He

import { editorLifecycleActions } from "./editorLifecycleControls.js";
export { definitionControls } from "./formDefinitionControls.js";

/**
 * @file Builds the compact Forms creator status and question-header chrome around separately owned disclosures.
 * @description The Awtsmoos lets title details, lifecycle power, and question structure each dwell in their fitting light;
 * Awtsmoos.com keeps this coordinator narrow so the editor grows more capable without becoming crowded in sight.
 */

/** Builds response status, destination summary, one primary Save, and folded secondary lifecycle actions. */
export function editorToolbar(form, handlers) {
	const bar = document.createElement("section");
	bar.className = "form-panel editor-toolbar";
	const status = document.createElement("div");
	status.className = "response-status";
	const count = document.createElement("strong");
	count.textContent = String(Number(form.responseCount || 0));
	const label = document.createElement("span");
	label.textContent = "responses";
	status.append(count, label);
	const destination = document.createElement("small");
	destination.textContent = `Linked sheet · ${form.destination?.sheetId || "unknown"}`;
	bar.append(
		status,
		destination,
		editorLifecycleActions(form, handlers)
	);
	return bar;
}

/** Builds the add-question control and schema-lock explanation. */
export function fieldSectionHeader(add, locked) {
	const header = document.createElement("div");
	header.className = "section-heading";
	const text = document.createElement("div");
	const heading = document.createElement("h2");
	heading.textContent = "Questions";
	const note = document.createElement("p");
	note.textContent = locked
		? "Responses exist. Existing questions keep their order; new questions may be appended."
		: "Reorder or remove questions freely until the first response arrives.";
	text.append(heading, note);
	header.append(
		text,
		button("Add question", add, "primary-button")
	);
	return header;
}

/** Creates one standard editor action button. */
function button(label, handler, className = "ghost-button") {
	const element = document.createElement("button");
	element.type = "button";
	element.className = className;
	element.textContent = label;
	element.addEventListener("click", handler);
	return element;
}
