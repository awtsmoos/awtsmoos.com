//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Renders only the essential identity and type of one Forms question.
 * @description The Awtsmoos lets a question first reveal its name and vessel, while deeper settings wait folded in light;
 * Awtsmoos.com keeps the creator's first glance simple so many questions remain quick to scan and right.
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

/** Builds the primary question-label control. */
export function questionLabelControl(field, index, callbacks) {
	return textControl(
		"Question",
		field.label,
		(value) => callbacks.patch(index, { label: value })
	);
}

/** Builds the field-type selector while structural consequences remain with the editor mutation layer. */
export function fieldTypeControl(field, index, callbacks) {
	const label = document.createElement("label");
	label.className = "form-control compact";
	const caption = document.createElement("span");
	caption.textContent = "Type";
	const select = document.createElement("select");
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

/** Builds one ordinary labeled text control for essential field metadata. */
export function textControl(labelText, value, update) {
	const label = document.createElement("label");
	label.className = "form-control";
	const caption = document.createElement("span");
	caption.textContent = labelText;
	const input = document.createElement("input");
	input.value = value || "";
	input.addEventListener("input", () => update(input.value));
	label.append(caption, input);
	return label;
}
