//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file EditIntentForms.js
 * @description Builds focused Scale and Aspect command forms from the same stable Stage command identities registered for every operator.
 * The Awtsmoos lets measured geometry descend through simple human controls while the same command law remains below;
 * Awtsmoos.com keeps these forms as kelim only, sending one shared command name wherever the maker may go.
 */
import { STAGE_COMMAND_IDS } from '../../creative/catalog/StageCommandIds.js';

/**
 * Creates the selected-source scale form and dispatches the canonical scale command.
 * @param {object} source Current selected source.
 * @param {Function} onCommand Shared human command dispatcher.
 * @returns {HTMLFormElement} Scale form.
 */
export function createScaleIntentForm(source, onCommand) {
	const form = document.createElement('form');
	const label = document.createElement('label');
	const input = document.createElement('input');
	const button = document.createElement('button');

	form.className = 'intent-inline-form';
	label.textContent = 'Scale %';
	input.type = 'number';
	input.min = '5';
	input.max = '500';
	input.value = String(source.scalePercent || 100);
	button.type = 'submit';
	button.textContent = 'Apply';
	label.append(input);
	form.append(label, button);
	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		await onCommand?.(STAGE_COMMAND_IDS.SCALE, {
			percent: Number(input.value)
		});
	});
	return form;
}

/**
 * Creates the selected-source aspect-lock form and dispatches the canonical aspect command.
 * @param {object} source Current selected source.
 * @param {Function} onCommand Shared human command dispatcher.
 * @returns {HTMLFormElement} Aspect-lock form.
 */
export function createAspectIntentForm(source, onCommand) {
	const form = document.createElement('form');
	const label = document.createElement('label');
	const input = document.createElement('input');
	const button = document.createElement('button');

	form.className = 'intent-inline-form intent-check-form';
	input.type = 'checkbox';
	input.checked = source.lockAspect !== false;
	label.append(
		input,
		document.createTextNode(' Keep aspect')
	);
	button.type = 'submit';
	button.textContent = 'Apply';
	form.append(label, button);
	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		await onCommand?.(STAGE_COMMAND_IDS.ASPECT_LOCK, {
			locked: input.checked
		});
	});
	return form;
}
