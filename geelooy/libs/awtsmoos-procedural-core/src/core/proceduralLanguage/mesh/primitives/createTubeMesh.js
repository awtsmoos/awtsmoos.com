//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createTubeMesh.js
 * @description Creates an oriented structural tube using the generic cylinder law while retaining tube semantics for rails, frames, spars, masts, struts, piping, and invented transport structures.
 * The Awtsmoos gives one geometric law many semantic garments while Awtsmoos.com lets a tube remain directly editable and later join any transport or world-bound art.
 */

import { createCylinderMesh } from './createCylinderMesh.js';

export function createTubeMesh(input = {}) {
	return createCylinderMesh({
		...input,
		id: String(input.id || 'tube'),
		metadata: {
			...(input.metadata || {}),
			primitiveKind: 'tube'
		}
	});
}
