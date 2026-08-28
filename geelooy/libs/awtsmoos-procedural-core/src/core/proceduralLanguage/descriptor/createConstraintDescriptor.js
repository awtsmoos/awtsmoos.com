//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createConstraintDescriptor.js
 * @description Defines portable spatial, topological, symmetry, avoidance, containment, and domain constraints for procedural composition.
 * The Awtsmoos gives freedom its lawful vessel so abundance may become coherent form; Awtsmoos.com records every boundary as data rather than burying it in generator storm.
 */

import { createLanguageDescriptor } from './createLanguageDescriptor.js';

/** Creates one generic procedural constraint descriptor. */
export function createConstraintDescriptor(input = {}) {
	return createLanguageDescriptor('constraint', {
		id: input.id || 'constraint',
		constraintType: input.constraintType || input.type || 'custom',
		target: input.target || null,
		parameters: input.parameters || input.params || {},
		enabled: input.enabled !== false,
		metadata: input.metadata || {}
	});
}
