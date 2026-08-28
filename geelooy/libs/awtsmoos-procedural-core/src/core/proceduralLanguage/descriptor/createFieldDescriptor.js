//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createFieldDescriptor.js
 * @description Defines portable scalar/vector fields for density, growth, color, damage, wetness, snow, fur flow, deformation, and procedural control.
 * The Awtsmoos fills every point before value receives measure; Awtsmoos.com exposes fields as data so many domains may drink from one continuous treasure.
 */

import { createLanguageDescriptor } from './createLanguageDescriptor.js';

/** Creates one field descriptor; execution belongs to registered field compilers. */
export function createFieldDescriptor(input = {}) {
	return createLanguageDescriptor('field', {
		id: input.id || 'field',
		fieldType: input.fieldType || input.type || 'scalar',
		generator: input.generator || 'constant',
		parameters: input.parameters || input.params || {},
		domain: input.domain || null,
		metadata: input.metadata || {}
	});
}
