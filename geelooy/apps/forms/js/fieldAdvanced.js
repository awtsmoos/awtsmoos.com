//B"H
//Boruch Hashem
//Blessed is He

import { isChoiceType } from "./model.js";
import { textControl } from "./fieldBasics.js";

/**
 * @file Folds secondary Forms question settings into one native advanced disclosure.
 * @description The Awtsmoos lets description, obligation, options, and structure wait behind one quiet gate of light;
 * Awtsmoos.com keeps every advanced choice near while the ordinary question card stays swift to read and right.
 */
export function advancedFieldControls(field, index, callbacks, schemaLocked) {
	const details = document.createElement("details");
	details.className = "field-advanced-disclosure";
	details.open = shouldOpen(field);
	const summary = document.createElement("summary");
	summary.className = "field-advanced-summary";
	const title = document.createElement("span");
	title.textContent = "Question options";
	const state = document.createElement("small");
	state.textContent = summaryState(field);
	summary.append(title, state);
	const body = document.createElement("div");
	body.className = "field-advanced-body";
	body.append(
		textControl(
			"Description",
			field.description,
			(value) => callbacks.patch(index, { description: value })
		),
		requiredToggle(field, index, callbacks)
	);
	if (isChoiceType(field.type)) {
		body.append(optionEditor(field, index, callbacks));
	}
	body.append(fieldActions(index, callbacks, schemaLocked));
	details.append(summary, body);
	return details;
}

/** Opens advanced settings only when the question already carries meaningful secondary configuration. */
function shouldOpen(field) {
	return Boolean(
		field.description
		|| field.required
		|| (isChoiceType(field.type) && field.options?.length > 2)
	);
}

/** Summarizes configured secondary state without forcing the disclosure open. */
function summaryState(field) {
	const states = [];
	if (field.required) states.push("Required");
	if (field.description) states.push("Description");
	if (isChoiceType(field.type)) states.push(`${field.options?.length || 0} options`);
	return states.length ? states.join(" · ") : "Optional";
}

/** Creates a required toggle bound to one stable field. */
function requiredToggle(field, index, callbacks) {
	const label = document.createElement("label");
	label.className = "form-check";
	const input = document.createElement("input");
	input.type = "checkbox";
	input.checked = Boolean(field.required);
	input.addEventListener("change", () => callbacks.patch(index, { required: input.checked }));
	label.append(input, document.createTextNode("Required"));
	return label;
}

/** Creates a newline-based option editor for validated choice fields. */
function optionEditor(field, index, callbacks) {
	const label = document.createElement("label");
	label.className = "form-control";
	const caption = document.createElement("span");
	caption.textContent = "Options · one per line";
	const textarea = document.createElement("textarea");
	textarea.rows = 4;
	textarea.value = (field.options || []).join("\n");
	textarea.addEventListener("input", () => callbacks.patch(index, {
		options: textarea.value.split("\n").map((item) => item.trim()).filter(Boolean)
	}));
	label.append(caption, textarea);
	return label;
}

/** Builds bounded structural controls, disabled when historical response schema is locked. */
function fieldActions(index, callbacks, schemaLocked) {
	const row = document.createElement("div");
	row.className = "form-inline-actions";
	row.append(
		action("Move up", () => callbacks.move(index, -1), schemaLocked || index === 0),
		action("Move down", () => callbacks.move(index, 1), schemaLocked),
		action("Remove", () => callbacks.remove(index), schemaLocked)
	);
	return row;
}

function action(label, run, disabled) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "ghost-button";
	button.textContent = label;
	button.disabled = Boolean(disabled);
	button.addEventListener("click", run);
	return button;
}
