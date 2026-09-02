//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CreativeCommandForm.js
 * @description Builds friendly command controls directly from the same metadata visible to scripts and AI.
 * The Awtsmoos lets one schema become a human vessel without inventing another hidden operation;
 * Awtsmoos.com turns command truth into touchable fields while preserving the same validation foundation.
 */

/**
 * Creates one accessible command card and submits only through the supplied shared executor.
 * @param {object} command Serializable command metadata with availability.
 * @param {Function} onExecute Human execution callback.
 * @returns {HTMLElement} Command card element.
 */
export function createCreativeCommandCard(command, onExecute) {
	const form = document.createElement('form');
	form.className = 'creative-command-card';
	form.dataset.commandId = command.id;
	form.append(createHeading(command), createDescription(command));

	for (const [name, schema] of Object.entries(command.parameters || {})) {
		form.append(createField(name, schema));
	}

	const button = document.createElement('button');
	button.type = 'submit';
	button.className = 'creative-command-run';
	button.textContent = command.available ? 'Run command' : command.unavailableReason || 'Unavailable';
	button.disabled = !command.available;
	form.append(button);
	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		await onExecute(command, readCommandParameters(form, command.parameters || {}));
	});
	return form;
}

export function readCommandParameters(form, schema = {}) {
	const parameters = {};

	for (const [name, fieldSchema] of Object.entries(schema)) {
		const input = form.elements.namedItem(name);
		parameters[name] = readFieldValue(input, fieldSchema);
	}

	return parameters;
}

function createHeading(command) {
	const heading = document.createElement('div');
	heading.className = 'creative-command-heading';
	heading.innerHTML = `<strong>${escapeText(command.label)}</strong><code>${escapeText(command.id)}</code>`;
	return heading;
}

function createDescription(command) {
	const description = document.createElement('p');
	description.textContent = command.description || '';
	return description;
}

function createField(name, schema) {
	const label = document.createElement('label');
	label.className = 'creative-command-field';
	const caption = document.createElement('span');
	caption.textContent = fieldLabel(name);
	const input = document.createElement('input');
	input.name = name;
	input.type = schema.type === 'boolean' ? 'checkbox' : schema.type === 'number' ? 'number' : 'text';
	applyFieldConstraints(input, schema);
	label.append(caption, input);
	return label;
}

function applyFieldConstraints(input, schema) {
	if (schema.required) {
		input.required = true;
	}

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
		return Number(input?.value);
	}

	return String(input?.value ?? '');
}

function fieldLabel(name) {
	return name.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
}

function escapeText(value) {
	return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
}
