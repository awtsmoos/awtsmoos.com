//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CreativeFieldInput.js
 * @description Translates shared command metadata into typed human fields without inventing a separate mutation contract.
 * The Awtsmoos lets number, boolean, text, and JSON each wear a fitting human vessel;
 * Awtsmoos.com reads those vessels back into the same parameters that scripts and AI send through the command level.
 */

/** Creates one accessible field from a serializable command-parameter schema. */
export function createCreativeCommandField(name, schema = {}) {
	const label = document.createElement('label');
	label.className = 'creative-command-field';
	const caption = document.createElement('span');
	caption.textContent = fieldLabel(name);
	const input = createInput(name, schema);
	label.append(caption, input);
	return label;
}

/** Reads all declared fields while preserving optional values as absent. */
export function readCreativeCommandParameters(form, schema = {}) {
	const parameters = {};

	for (const [name, fieldSchema] of Object.entries(schema)) {
		const value = readFieldValue(form.elements.namedItem(name), fieldSchema);
		if (value !== undefined) {
			parameters[name] = value;
		}
	}

	return parameters;
}

function createInput(name, schema) {
	if (schema.type === 'object') {
		const textarea = document.createElement('textarea');
		textarea.name = name;
		textarea.rows = 4;
		textarea.value = JSON.stringify(schema.default ?? {}, null, 2);
		return textarea;
	}

	const input = document.createElement('input');
	input.name = name;
	input.type = schema.type === 'boolean' ? 'checkbox' : schema.type === 'number' ? 'number' : 'text';
	applyFieldConstraints(input, schema);
	return input;
}

function applyFieldConstraints(input, schema) {
	input.required = Boolean(schema.required);

	if (schema.min !== undefined) {
		input.min = String(schema.min);
	}

	if (schema.max !== undefined) {
		input.max = String(schema.max);
	}

	if (schema.default !== undefined) {
		if (schema.type === 'boolean') {
			input.checked = Boolean(schema.default);
		} else {
			input.value = String(schema.default);
		}
	}
}

function readFieldValue(input, schema) {
	if (schema.type === 'boolean') {
		return Boolean(input?.checked);
	}

	if (schema.type === 'number') {
		return input?.value === '' ? undefined : Number(input?.value);
	}

	if (schema.type === 'object') {
		const text = String(input?.value || '').trim();
		return text ? JSON.parse(text) : {};
	}

	return String(input?.value ?? '');
}

function fieldLabel(name) {
	return name.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
}
