//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createMaterialRoleDescriptor.js
 * @description Separates semantic material roles from renderer-specific material implementations and resource loading.
 * The Awtsmoos clothes bark, skin, stone, glass, and metal before a renderer names its shader art;
 * Awtsmoos.com lets geometry request meaning while material policy resolves the final part.
 */

import { createLanguageDescriptor } from './createLanguageDescriptor.js';

/** Creates one semantic material-role request with layered renderer-neutral channels. */
export function createMaterialRoleDescriptor(input = {}) {
	return createLanguageDescriptor('material-role', {
		id: input.id || input.role || 'material',
		role: String(input.role || input.id || 'material'),
		channels: input.channels || {},
		layers: input.layers || [],
		resources: input.resources || [],
		metadata: input.metadata || {}
	});
}
