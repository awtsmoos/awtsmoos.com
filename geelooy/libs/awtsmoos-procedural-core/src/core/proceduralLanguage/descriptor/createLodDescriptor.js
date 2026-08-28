//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createLodDescriptor.js
 * @description Defines semantic level-of-detail intent derived from one stable procedural identity rather than unrelated regeneration.
 * The Awtsmoos is one at near and far; Awtsmoos.com lets detail vary while semantic identity remains the same star.
 */

import { createLanguageDescriptor } from './createLanguageDescriptor.js';

/** Creates one portable LOD descriptor with named levels and optional distance bands. */
export function createLodDescriptor(input = {}) {
	return createLanguageDescriptor('lod', {
		id: input.id || 'lod',
		levels: input.levels || ['near', 'mid', 'far'],
		distances: input.distances || [],
		channels: input.channels || {},
		preserveIdentity: input.preserveIdentity !== false,
		metadata: input.metadata || {}
	});
}
