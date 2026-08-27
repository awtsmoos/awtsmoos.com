//B"H
//Boruch Hashem
//Blessed is He

import { publicChoiceField } from "./publicChoiceField.js";

/**
 * @file Dispatches respondent-safe Forms questions into small native control vessels without trusted HTML.
 * @description The Awtsmoos lets each public question receive its fitting form while every answer remains bounded in light;
 * Awtsmoos.com keeps simple inputs here and gives many-choice validation its own vessel so neither module grows out of sight.
 */
export function publicField(field) {
	const card = document.createElement("fieldset");
	card.className = "public-field-card";
	const legend = document.createElement("legend");
	legend.textContent = field.required ? `${field.label} *` : field.label;
	card.append(legend);
	if (field.description) {
		const description = document.createElement("p");
		description.textContent = field.description;
		card.append(description);
	}
	const control = fieldControl(field);
	card.append(control.element);
	return {
		element: card,
		read: control.read
	};
}

/** Chooses one native control family from the server-sanitized field type. */
function fieldControl(field) {
	if (field.type === "paragraph") {
		return textArea(field);
	}
	if (field.type === "singleChoice" || field.type === "checkboxes") {
		return publicChoiceField(field);
	}
	if (field.type === "dropdown") {
		return dropdown(field);
	}
	return textInput(field);
}

/** Builds one single-value native input with browser-native type validation. */
function textInput(field) {
	const input = document.createElement("input");
	input.className = "public-input";
	input.required = Boolean(field.required);
	input.type = inputType(field.type);
	if (field.type !== "number") {
		input.maxLength = 1000;
	}
	return {
		element: input,
		read: () => input.value
	};
}

/** Builds one multiline answer control under the same bound enforced by the server schema. */
function textArea(field) {
	const input = document.createElement("textarea");
	input.className = "public-input";
	input.rows = 5;
	input.maxLength = 8000;
	input.required = Boolean(field.required);
	return {
		element: input,
		read: () => input.value
	};
}

/** Builds one server-option-backed dropdown selector. */
function dropdown(field) {
	const select = document.createElement("select");
	select.className = "public-input";
	select.required = Boolean(field.required);
	const empty = document.createElement("option");
	empty.value = "";
	empty.textContent = "Choose…";
	select.append(empty);
	for (const optionText of field.options || []) {
		const option = document.createElement("option");
		option.value = optionText;
		option.textContent = optionText;
		select.append(option);
	}
	return {
		element: select,
		read: () => select.value
	};
}

/** Maps declarative Forms types onto native browser validation where available. */
function inputType(type) {
	if (type === "number") {
		return "number";
	}
	if (type === "email") {
		return "email";
	}
	if (type === "date") {
		return "date";
	}
	return "text";
}
