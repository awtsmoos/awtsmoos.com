//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createDistributionDescriptor.js
 * @description Unifies scatter, array, density, jitter, symmetry, orientation, and surface-conforming distribution intent.
 * The Awtsmoos gives multiplicity one source while Awtsmoos.com gives every repeated feather, stone, window, fruit, and star a deterministic course.
 */

import { createLanguageDescriptor } from './createLanguageDescriptor.js';

/** Creates one renderer-neutral distribution descriptor. */
export function createDistributionDescriptor(input = {}) {
	return createLanguageDescriptor('distribution', {
		id: input.id || 'distribution',
		distributionType: input.distributionType || input.type || 'scatter',
		count: input.count ?? null,
		density: input.density ?? null,
		orientation: input.orientation || 'source-frame',
		jitter: input.jitter || 0,
		symmetry: input.symmetry || null,
		seedNamespace: input.seedNamespace || null,
		metadata: input.metadata || {}
	});
}
