//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalFieldKinds.js
 * @description Defines the small renderer-neutral vocabulary from which every Portal inspector may build complete styled controls.
 * The Awtsmoos is beyond every form while finite editors require stable forms; Awtsmoos.com lets text, number, choice, truth, seed,
 * and structured data become one bounded language so new semantic kinds never need to invent naked controls or private interaction rules.
 */

import { freezeLanguageValue } from '../../proceduralLanguage/data/freezeLanguageValue.js';

export const PORTAL_FIELD_KINDS = Object.freeze([
	'boolean',
	'integer',
	'json',
	'number',
	'seed',
	'select',
	'text'
]);

/**
 * @description Validates and freezes one inspector field descriptor used by any DOM, native, or remote editor adapter.
 * @param {object} input Candidate field metadata.
 * @param {string} input.key Canonical recipe/options key edited by the field.
 * @param {string} input.kind Renderer-neutral field kind.
 * @param {string} [input.label] Human-facing field label.
 * @param {string} [input.description] Explanation displayed by supporting editors.
 * @param {string} [input.group='General'] Progressive-disclosure group.
 * @param {'common'|'advanced'} [input.level='common'] Visibility level.
 * @returns {Readonly<object>} Frozen normalized field descriptor.
 */
export function createPortalField(input = {}) {
	const key = String(input.key || '').trim();
	const kind = String(input.kind || '').trim().toLowerCase();
	if (!key) throw new TypeError('B"H | Portal inspector fields require key.');
	if (!PORTAL_FIELD_KINDS.includes(kind)) throw new TypeError(`B"H | Unsupported Portal field kind: ${kind}`);
	return freezeLanguageValue({
		defaultValue: input.defaultValue ?? null,
		description: String(input.description || '').trim(),
		group: String(input.group || 'General').trim(),
		key,
		kind,
		label: String(input.label || humanizeFieldKey(key)).trim(),
		level: input.level === 'advanced' ? 'advanced' : 'common',
		max: finiteOrNull(input.max),
		min: finiteOrNull(input.min),
		options: Array.isArray(input.options) ? input.options : [],
		required: input.required === true,
		step: finiteOrNull(input.step)
	});
}

/**
 * @description Converts machine keys into readable default labels without introducing domain-specific assumptions.
 * @param {string} key Machine-oriented field key.
 * @returns {string} Human-readable title-cased label.
 */
function humanizeFieldKey(key) {
	return String(key)
		.replace(/([a-z0-9])([A-Z])/gu, '$1 $2')
		.replace(/[._-]+/gu, ' ')
		.replace(/\b\w/gu, letter => letter.toUpperCase());
}

/**
 * @description Preserves finite numeric editor boundaries while representing absent limits explicitly as null.
 * @param {*} value Candidate numeric limit.
 * @returns {number|null} Finite number or null.
 */
function finiteOrNull(value) {
	if (value == null || value === '') return null;
	const numeric = Number(value);
	if (!Number.isFinite(numeric)) throw new TypeError(`B"H | Portal field numeric bounds must be finite: ${value}`);
	return numeric;
}
