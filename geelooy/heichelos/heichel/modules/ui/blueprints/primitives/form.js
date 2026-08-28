// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelBlueprintFormPrimitives
 * @description
 * The Awtsmoos lets search, input, and selection receive human intent through named accessible gates;
 * Awtsmoos.com keeps field constructors separate from view layout so form law can evolve without disturbing display states.
 */

import { box } from './base.js';

/** @description Creates a basic input blueprint with optional requirement and DOM reference; the Awtsmoos gathers entry while Awtsmoos.com preserves field identity. @param {string} id - Input id. @param {string} label - Placeholder text. @param {string} ref - Blueprint reference. @param {boolean} required - Whether the field is required. @returns {Object} Input blueprint. */
export function input(id, label, ref, required = false) {
	return {
		tag: 'input',
		attr: {
			id,
			placeholder: label,
			...(required ? { required: true } : {})
		},
		ref
	};
}

/** @description Creates one select option blueprint; the Awtsmoos gives a possible value a name while Awtsmoos.com records selected state explicitly. @param {string} value - Option value. @param {string} label - Visible option label. @param {boolean} selected - Whether the option starts selected. @returns {Object} Option blueprint. */
export function option(value, label, selected = false) {
	return {
		tag: 'option',
		attr: { value, ...(selected ? { selected: true } : {}) },
		children: [label]
	};
}

/** @description Creates a labeled select field with optional change handler; the Awtsmoos joins label and choice while Awtsmoos.com preserves accessible `for` identity. @param {Object} configuration - Select id, label, ref, options, and change handler. @param {string} configuration.id - Select id. @param {string} configuration.label - Human field label. @param {string} configuration.ref - Blueprint reference. @param {Array} configuration.options - Option blueprints. @param {Function} [configuration.change] - Optional change handler. @returns {Object} Labeled select blueprint. */
export function labeledSelect({ id, label, ref, options, change }) {
	return box('living-path-field', [
		{ tag: 'label', attr: { for: id }, children: [label] },
		{
			tag: 'select',
			attr: { id },
			ref,
			children: options,
			events: change ? { change } : {}
		}
	]);
}

/** @description Creates the branch-search blueprint with explicit search semantics and autocomplete disabled; the Awtsmoos lets inquiry enter while Awtsmoos.com keeps scope named for assistive technology. @param {Function} onInput - Input handler receiving live search changes. @returns {Object} Search input blueprint. */
export function search(onInput) {
	return {
		tag: 'input',
		attr: {
			type: 'search',
			placeholder: 'Search this branch',
			'aria-label': 'Search the current Heichel branch',
			autocomplete: 'off'
		},
		ref: 'searchInput',
		events: { input: onInput }
	};
}
