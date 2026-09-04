//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CreativeFieldInput.js
 * @description Translates shared command metadata into typed human controls without inventing another mutation contract.
 * The Awtsmoos lets number, boolean, text, and JSON each wear a fitting human keli;
 * Awtsmoos.com reads those garments back into the exact parameters that scripts and AI send freely.
 */

/**
 * Creates one accessible input field from a command parameter schema.
 * @param {string} name Stable parameter name.
 * @param {object} schema Serializable parameter metadata.
 * @returns {HTMLLabelElement} Label and typed form control.
 */
export function createCreativeCommandField(name, schema = {}) {
	const label = document.createElement('label');
	const caption = document.createElement('span');
	const input = createInput(name, schema);

	label.className = 'creative-command-field';
	caption.textContent = fieldLabel(name);
	label.append(caption, input);
	return label;
}

/**
 * Reads declared command fields while preserving absent optional numbers as undefined.
 * @param {HTMLFormElement} form Command form.
 * @param {object} schema Parameter metadata.
 * @returns {object} Parameters ready for canonical validation.
 */
export function readCreativeCommandParameters(form, schema = {}) {
	const parameters = {};

	for (const [name, fieldSchema] of Object.entries(schema)) {
		const input = form.elements.namedItem(name);
		const value = readFieldValue(input, fieldSchema);

		if (value !== undefined) {
			parameters[name] = value;
		}
	}

	return parameters;
}

function createInput(name, schema) {
	if (schema.type === 'object') {
		return createObjectInput(name, schema);
	}

	const input = document.createElement('input');
	input.name = name;
	input.type = inputType(schema.type);
	applyFieldConstraints(input, schema);
	return input;
}

function createObjectInput(name, schema) {
	const textarea = document.createElement('textarea');
	textarea.name = name;
	textarea.rows = 4;
	textarea.value = JSON.stringify(schema.default ?? {}, null, 2);
	return textarea;
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

function inputType(type) {
	if (type === 'boolean') {
		return 'checkbox';
	}

	return type === 'number' ? 'number' : 'text';
}

function fieldLabel(name) {
	return name
		.replace(/([A-Z])/g, ' $1')
		.replace(/^./, (letter) => letter.toUpperCase());
}
