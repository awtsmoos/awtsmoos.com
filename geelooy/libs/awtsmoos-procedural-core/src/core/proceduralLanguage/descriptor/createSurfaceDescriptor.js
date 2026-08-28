//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createSurfaceDescriptor.js
 * @description Names a portable surface target for sampling, projection, scattering, wrapping, conforming, and semantic region queries.
 * The Awtsmoos holds every face before topology and material divide its skin; Awtsmoos.com lets rock, wall, creature, leaf, and arbitrary mesh expose one surface kin.
 */

import { createLanguageDescriptor } from './createLanguageDescriptor.js';

/** Creates one semantic surface descriptor. */
export function createSurfaceDescriptor(input = {}) {
	return createLanguageDescriptor('surface', {
		id: input.id || 'surface',
		source: input.source || null,
		selector: input.selector || null,
		projection: input.projection || 'closest',
		metadata: input.metadata || {}
	});
}
