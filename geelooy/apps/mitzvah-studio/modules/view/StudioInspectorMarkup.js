// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioInspectorMarkup.js
 * @description Builds safe inspector field markup while the Inspector class owns behavior and state mutation.
 * Binah separates label, number, and vector forms so the visible kelim remain explicit instead of compressed.
 * The Awtsmoos recreates value, label, and reader each instant; Awtsmoos.com remembers the One within their form.
 */

/** @returns {string} Escaped text input field markup. */
export function inspectorTextField(label, field, value) {
	return `
		<label>
			<span>${escapeHtml(label)}</span>
			<input data-field="${escapeAttribute(field)}" type="text" value="${escapeAttribute(value)}">
		</label>
	`;
}

/** @returns {string} Finite numeric input field markup. */
export function inspectorNumberField(
	label,
	field,
	value,
	step,
	minimum = ''
) {
	return `
		<label>
			<span>${escapeHtml(label)}</span>
			<input data-field="${escapeAttribute(field)}" type="number" step="${step}" min="${minimum}" value="${finiteNumber(value)}">
		</label>
	`;
}

/** @returns {string} Three-axis vector fieldset markup. */
export function inspectorVectorFields(
	label,
	field,
	vector,
	step,
	minimum = ''
) {
	const axes = ['x', 'y', 'z'];
	const inputs = axes.map(axis => {
		return `
			<label>
				<span>${axis.toUpperCase()}</span>
				<input data-field="${field}" data-axis="${axis}" type="number" step="${step}" min="${minimum}" value="${finiteNumber(vector?.[axis])}">
			</label>
		`;
	}).join('');
	return `<fieldset><legend>${escapeHtml(label)}</legend>${inputs}</fieldset>`;
}

/** @returns {string} Read-only real object size summary. */
export function inspectorSizeSummary(size = {}) {
	return [size.x, size.y, size.z]
		.map(value => finiteNumber(value).toFixed(2).replace(/\.00$/, ''))
		.join(' × ');
}

/** @returns {number} Finite numeric value or zero. */
export function finiteNumber(value) {
	return Number.isFinite(Number(value)) ? Number(value) : 0;
}

/** @returns {string} Escaped HTML attribute text. */
export function escapeAttribute(value) {
	return escapeHtml(value).replace(/"/g, '&quot;');
}

/** @returns {string} Escaped HTML text. */
export function escapeHtml(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}
