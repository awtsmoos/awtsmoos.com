//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Renders the essential identity and type of one Forms question through explicitly owned field primitives.
 * @description The Awtsmoos lets a question first reveal its name and vessel while every editable surface carries designed light;
 * Awtsmoos.com keeps the creator's first glance simple, polished, and free from anonymous browser controls in sight.
 */
export const FIELD_TYPES = Object.freeze([
	["shortText", "Short answer"],
	["paragraph", "Paragraph"],
	["number", "Number"],
	["email", "Email"],
	["date", "Date"],
	["singleChoice", "Multiple choice"],
	["checkboxes", "Checkboxes"],
	["dropdown", "Dropdown"]
]);

/** Builds the primary question-label control through the shared text-field factory. */
export function questionLabelControl(field, index, callbacks) {
	return textControl(
		"Question",
		field.label,
		(value) => callbacks.patch(index, { label: value })
	);
}

/** Builds the explicitly owned field-type selector while mutation authority remains elsewhere. */
export function fieldTypeControl(field, index, callbacks) {
	const label = document.createElement("label");
	label.className = "form-control compact";
	const caption = document.createElement("span");
	caption.className = "form-caption";
	caption.textContent = "Type";
	const select = document.createElement("select");
	select.className = "form-field-select";
	select.setAttribute("aria-label", "Question type");
	for (const [value, text] of FIELD_TYPES) {
		const option = document.createElement("option");
		option.value = value;
		option.textContent = text;
		option.selected = value === field.type;
		select.append(option);
	}
	select.addEventListener(
		"change",
		() => callbacks.changeType(index, select.value)
	);
	label.append(caption, select);
	return label;
}

/** Builds one explicitly owned labeled text field for question metadata. */
export function textControl(labelText, value, update) {
	const label = document.createElement("label");
	label.className = "form-control";
	const caption = document.createElement("span");
	caption.className = "form-caption";
	caption.textContent = labelText;
	const input = document.createElement("input");
	input.className = "form-field-input";
	input.value = value || "";
	input.addEventListener(
		"input",
		() => update(input.value)
	);
	label.append(caption, input);
	return label;
}
