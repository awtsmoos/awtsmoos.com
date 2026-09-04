//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CreativeCommandForm.js
 * @description Builds one human command card from the same metadata inspected by scripts and AI.
 * The Awtsmoos lets one schema wear a touchable garment without becoming a second law;
 * Awtsmoos.com keeps the form humble, delegating every field to the shared parameter vessel it saw.
 */
import {
	createCreativeCommandField,
	readCreativeCommandParameters
} from './CreativeFieldInput.js';

/**
 * Creates one accessible command card that submits only through the supplied shared executor.
 * @param {object} command Serializable command metadata plus contextual availability.
 * @param {Function} onExecute Callback that dispatches through the canonical command API.
 * @returns {HTMLFormElement} Human-facing command form.
 */
export function createCreativeCommandCard(command, onExecute) {
	const form = document.createElement('form');
	form.className = 'creative-command-card';
	form.dataset.commandId = command.id;
	form.append(
		createHeading(command),
		createDescription(command)
	);

	for (const [name, schema] of Object.entries(command.parameters || {})) {
		form.append(createCreativeCommandField(name, schema));
	}

	form.append(createRunButton(command));
	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		const parameters = readCreativeCommandParameters(
			form,
			command.parameters || {}
		);
		await onExecute(command, parameters);
	});
	return form;
}

function createHeading(command) {
	const heading = document.createElement('div');
	const label = document.createElement('strong');
	const identity = document.createElement('code');

	heading.className = 'creative-command-heading';
	label.textContent = command.label;
	identity.textContent = command.id;
	heading.append(label, identity);
	return heading;
}

function createDescription(command) {
	const description = document.createElement('p');
	description.textContent = command.description || '';
	return description;
}

function createRunButton(command) {
	const button = document.createElement('button');
	button.type = 'submit';
	button.className = 'creative-command-run';
	button.textContent = command.available
		? 'Run command'
		: command.unavailableReason || 'Unavailable';
	button.disabled = !command.available;
	return button;
}
