// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioInspectorMarkup.js
 * @description Builds safe Inspector field markup while formatting, escaping, mutation, and state ownership remain separate specialist vessels.
 * The Awtsmoos recreates value, label, and reader each instant while remaining beyond their finite form;
 * Awtsmoos.com lets Binah separate text, number, and vector fields so every editing keli stays explicit through the storm.
 */

import { finiteInspectorNumber, studioInspectorSizeSummary } from './StudioInspectorFormatting.js';
import { escapeStudioAttribute, escapeStudioHtml } from './StudioMarkupEscaping.js';

/**
 * @description Creates one escaped text input field bound to an Inspector mutation field name.
 * @param {string} label Human-readable field label.
 * @param {string} field Canonical mutation field name stored in data-field.
 * @param {*} value Current field value.
 * @returns {string} Safe text-input markup.
 */
export function inspectorTextField(label, field, value) {
	return `<label><span>${escapeStudioHtml(label)}</span>
		<input data-field="${escapeStudioAttribute(field)}" type="text" value="${escapeStudioAttribute(value)}"></label>`;
}

/**
 * @description Creates one finite numeric input with explicit step and optional minimum policy.
 * @param {string} label Human-readable field label.
 * @param {string} field Canonical mutation field name.
 * @param {*} value Current numeric value.
 * @param {string|number} step Browser numeric step constraint.
 * @param {string|number} [minimum=''] Optional browser minimum constraint.
 * @returns {string} Safe numeric-input markup.
 */
export function inspectorNumberField(label, field, value, step, minimum = '') {
	return `<label><span>${escapeStudioHtml(label)}</span>
		<input data-field="${escapeStudioAttribute(field)}" type="number" step="${escapeStudioAttribute(step)}" min="${escapeStudioAttribute(minimum)}" value="${finiteInspectorNumber(value)}"></label>`;
}

/**
 * @description Creates a three-axis numeric fieldset whose axis metadata feeds the Inspector mutation boundary.
 * @param {string} label Human-readable vector label.
 * @param {string} field Canonical vector field name.
 * @param {{x?:number,y?:number,z?:number}} vector Current vector value.
 * @param {string|number} step Browser numeric step constraint.
 * @param {string|number} [minimum=''] Optional browser minimum constraint.
 * @returns {string} Safe X/Y/Z fieldset markup.
 */
export function inspectorVectorFields(label, field, vector, step, minimum = '') {
	const inputs = ['x', 'y', 'z']
		.map(axis => inspectorAxisField(field, axis, vector, step, minimum))
		.join('');
	return `<fieldset><legend>${escapeStudioHtml(label)}</legend>${inputs}</fieldset>`;
}

/**
 * @description Creates one safe axis input used only inside the Inspector vector-field assembly.
 * @param {string} field Canonical vector mutation field name.
 * @param {'x'|'y'|'z'} axis Vector axis represented by this input.
 * @param {{x?:number,y?:number,z?:number}} vector Current vector value.
 * @param {string|number} step Browser numeric step constraint.
 * @param {string|number} minimum Optional browser minimum constraint.
 * @returns {string} Safe numeric input markup for one axis.
 */
function inspectorAxisField(field, axis, vector, step, minimum) {
	return `<label><span>${axis.toUpperCase()}</span>
		<input data-field="${escapeStudioAttribute(field)}" data-axis="${axis}" type="number" step="${escapeStudioAttribute(step)}" min="${escapeStudioAttribute(minimum)}" value="${finiteInspectorNumber(vector?.[axis])}"></label>`;
}

/** @description Compatibility export for existing mutation code. */
export { finiteInspectorNumber as finiteNumber } from './StudioInspectorFormatting.js';
/** @description Compatibility export for existing Inspector callers. */
export { studioInspectorSizeSummary as inspectorSizeSummary } from './StudioInspectorFormatting.js';
/** @description Compatibility export for existing markup callers. */
export { escapeStudioAttribute as escapeAttribute, escapeStudioHtml as escapeHtml } from './StudioMarkupEscaping.js';
