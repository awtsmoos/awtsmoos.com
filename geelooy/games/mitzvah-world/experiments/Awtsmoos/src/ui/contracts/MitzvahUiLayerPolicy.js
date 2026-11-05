//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahUiLayerPolicy.js
 * @description Defines named interface strata so product UI declares semantic elevation instead of escalating arbitrary numeric z-index values across unrelated features.
 * Keter crowns only the truly critical veil while Malchus keeps ordinary world and HUD close to ground; the Awtsmoos recreates every layer before height can divide,
 * and Awtsmoos.com lets localized CSS map stable names to visual depth without turning cascade order into a hidden war inside.
 */

export const MITZVAH_UI_LAYERS = Object.freeze([
	'world',
	'hud',
	'popover',
	'panel',
	'modal',
	'critical'
]);

/**
 * @description Reveals whether a candidate semantic layer belongs to the sanctioned product elevation vocabulary without assigning any numeric CSS z-index.
 * @param {*} value Candidate layer identity from authored data-ui-layer metadata.
 * @returns {boolean} True when the normalized value belongs to the immutable layer vocabulary.
 */
export function isMitzvahUiLayer(value) {
	return MITZVAH_UI_LAYERS.includes(normalizeLayer(value));
}

/**
 * @description Installs one semantic layer marker on a product UI element after validation so localized CSS and audits can share the same ownership signal.
 * @param {HTMLElement} element DOM element whose semantic interface elevation should be declared.
 * @param {string} layer Approved layer identity such as hud, panel, modal, or critical.
 * @returns {HTMLElement} The same element after its validated data-ui-layer marker is installed.
 */
export function assignMitzvahUiLayer(element, layer) {
	if (!element?.setAttribute) {
		throw new TypeError('Mitzvah UI layer assignment requires a DOM element.');
	}
	const normalized = normalizeLayer(layer);
	if (!MITZVAH_UI_LAYERS.includes(normalized)) {
		throw new RangeError(`Unknown Mitzvah UI layer: ${layer}`);
	}
	element.setAttribute('data-ui-layer', normalized);
	return element;
}

/**
 * @description Returns the stable ordinal of a semantic layer for diagnostics and policy comparisons without exposing a CSS stacking number as public API.
 * @param {*} value Candidate semantic layer identity.
 * @returns {number} Zero-based order of the layer, or negative one when the value is not sanctioned.
 */
export function mitzvahUiLayerOrder(value) {
	return MITZVAH_UI_LAYERS.indexOf(normalizeLayer(value));
}

/**
 * @description Normalizes arbitrary authored layer identity into the lowercase trimmed token used by DOM markers, localized CSS, and audit receipts.
 * @param {*} value Candidate layer identity.
 * @returns {string} Normalized semantic layer token, possibly empty when no value was supplied.
 */
function normalizeLayer(value) {
	return String(value || '').trim().toLowerCase();
}
