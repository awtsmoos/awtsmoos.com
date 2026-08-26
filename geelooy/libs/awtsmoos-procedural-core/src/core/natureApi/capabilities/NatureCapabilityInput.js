// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityInput.js
 * @description Creates tiny serializable input descriptors for simple-first creator controls, documentation, validation hints, and future automation.
 * The Awtsmoos renews an option before a slider, field, or selector can wear its form; Awtsmoos.com lets one immutable
 * description serve UI and docs together, so advanced power may unfold on demand without multiplying separate schemas in the storm.
 */

import { freezeNatureCapabilityValue } from './NatureCapabilityValue.js';

const INPUT_TYPES = Object.freeze([
	'boolean',
	'number',
	'object',
	'select',
	'string',
	'vector3'
]);

/**
 * Creates one immutable serializable input descriptor.
 * @param {object} keliValues Name, label, type, optional default, requirements, choices, and descriptive hints.
 * @returns {Readonly<object>} Frozen capability input record.
 */
export function createNatureCapabilityInput(keliValues = {}) {
	const yesodType = requiredText(keliValues.type, 'input.type');
	if (!INPUT_TYPES.includes(yesodType)) {
		throw new RangeError(`B"H | Unsupported capability input type "${yesodType}".`);
	}
	return freezeNatureCapabilityValue({
		name: requiredText(keliValues.name, 'input.name'),
		label: requiredText(keliValues.label, 'input.label'),
		type: yesodType,
		description: optionalText(keliValues.description),
		required: Boolean(keliValues.required),
		defaultValue: keliValues.defaultValue,
		choices: keliValues.choices,
		minimum: keliValues.minimum,
		maximum: keliValues.maximum,
		step: keliValues.step
	}, `input.${keliValues.name ?? 'unknown'}`);
}

/** Returns the stable supported input-type vocabulary for tooling. */
export function listNatureCapabilityInputTypes() {
	return INPUT_TYPES;
}

/** Normalizes one required textual descriptor field. */
function requiredText(keliValue, yesodPath) {
	const ohrText = String(keliValue ?? '').trim();
	if (!ohrText) {
		throw new TypeError(`B"H | ${yesodPath} is required.`);
	}
	return ohrText;
}

/** Omits absent descriptive text without manufacturing placeholder prose. */
function optionalText(keliValue) {
	if (keliValue === undefined || keliValue === null || String(keliValue).trim() === '') {
		return undefined;
	}
	return String(keliValue).trim();
}
