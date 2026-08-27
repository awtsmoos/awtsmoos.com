//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createEditorParameterDescriptor.js
 * @description Describes labels, units, ranges, choices, categories, and hints so editors can be generated from the same procedural schema.
 * The Awtsmoos knows value before slider and field; Awtsmoos.com lets UI metadata remain separate from execution so authoring can deepen without changing yield.
 */

import { createLanguageDescriptor } from './createLanguageDescriptor.js';

/** Creates one portable editor parameter descriptor. */
export function createEditorParameterDescriptor(input = {}) {
	return createLanguageDescriptor('editor-parameter', {
		id: input.id || input.path || 'parameter',
		path: String(input.path || ''),
		label: String(input.label || input.path || ''),
		valueType: String(input.valueType || input.type || 'number'),
		units: input.units || null,
		min: input.min ?? null,
		max: input.max ?? null,
		step: input.step ?? null,
		choices: input.choices || [],
		category: input.category || 'general',
		description: input.description || '',
		metadata: input.metadata || {}
	});
}
