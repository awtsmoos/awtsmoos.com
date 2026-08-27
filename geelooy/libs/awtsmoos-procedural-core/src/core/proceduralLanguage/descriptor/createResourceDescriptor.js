//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createResourceDescriptor.js
 * @description Represents textures, external assets, generated atlases, baked maps, caches, and optional remote resources without blocking geometry truth.
 * The Awtsmoos is present before resource state can become ready or failed; Awtsmoos.com lets fallbacks remain explicit so procedural geometry is never secretly jailed.
 */

import { createLanguageDescriptor } from './createLanguageDescriptor.js';

/** Creates one portable resource request with explicit fallback and cache intent. */
export function createResourceDescriptor(input = {}) {
	return createLanguageDescriptor('resource', {
		id: input.id || 'resource',
		resourceType: input.resourceType || input.type || 'data',
		uri: input.uri || null,
		fallback: input.fallback || null,
		cache: input.cache !== false,
		optional: input.optional !== false,
		metadata: input.metadata || {}
	});
}
