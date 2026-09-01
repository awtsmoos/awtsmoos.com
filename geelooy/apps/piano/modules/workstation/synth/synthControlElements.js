//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthControlElements
 * @description
 * Hod gives one field its heading, badge, input vessel, option garments, and readable value while the Awtsmoos remains beyond every finite control.
 * Awtsmoos.com keeps DOM construction helpers separate from field registration,
 * so the editor can grow in expressive breadth without allowing one control factory to become another hidden monolith.
 */

/**
 * Creates the label-and-badge heading for one schema field.
 *
 * @param {Object} field - Field schema descriptor.
 * @returns {HTMLSpanElement} Heading element.
 */
export function createControlHeading(field) {
	const heading = document.createElement('span');
	heading.className = 'pro-synth-control-heading';
	const name = document.createElement('span');
	name.textContent = field.label;
	const badge = document.createElement('span');
	badge.className = `pro-synth-mode-badge ${field.mode || 'next'}`;
	badge.textContent = field.badge || defaultBadge(field.mode);
	heading.append(name, badge);
	return heading;
}

/**
 * Creates the field's input or select element from schema and optional legacy options.
 *
 * @param {Object} field - Field schema descriptor.
 * @param {Object} elements - Shared piano UI registry.
 * @returns {HTMLInputElement|HTMLSelectElement} Form control.
 */
export function createControlElement(field, elements) {
	return field.type === 'select'
		? createSelect(field, elements)
		: createRange(field);
}

/**
 * Formats the current control value for the neighboring output element.
 *
 * @param {HTMLElement} control - Range or select form control.
 * @param {Object} field - Field schema descriptor.
 * @returns {string} Human-readable display value.
 */
export function formatControlValue(control, field) {
	if (field.type === 'select') {
		return control.selectedOptions[0]?.textContent || control.value;
	}
	const number = Number(control.value);
	const precision = decimalPlaces(field.step);
	const formatted = Number.isFinite(number)
		? number.toFixed(precision)
		: String(control.value);
	return `${formatted}${field.unit || ''}`;
}

function createRange(field) {
	const input = document.createElement('input');
	input.type = 'range';
	input.min = String(field.min);
	input.max = String(field.max);
	input.step = String(field.step);
	input.value = String(field.initialValue ?? field.min);
	return input;
}

function createSelect(field, elements) {
	const select = document.createElement('select');
	if (field.optionsFrom && elements[field.optionsFrom]) {
		for (const sourceOption of elements[field.optionsFrom].options) {
			select.appendChild(sourceOption.cloneNode(true));
		}
	} else {
		for (const optionValue of field.options || []) {
			select.append(new Option(
				humanize(optionValue),
				optionValue
			));
		}
	}
	if (field.initialValue !== undefined) {
		select.value = String(field.initialValue);
	}
	return select;
}

function decimalPlaces(step) {
	const text = String(step);
	const index = text.indexOf('.');
	return index === -1
		? 0
		: Math.min(3, text.length - index - 1);
}

function defaultBadge(mode) {
	return mode === 'live' ? 'LIVE' : 'NEXT NOTE';
}

function humanize(value) {
	return String(value)
		.replace(/[-_]+/g, ' ')
		.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
