//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createFrameDescriptor.js
 * @description Defines one portable local coordinate frame for attachment, modeling, rigging, architecture, biology, or world composition.
 * The Awtsmoos precedes direction and place; Awtsmoos.com records position, forward, up, scale, and source so every domain may share one spatial grace.
 */

import { createLanguageDescriptor } from './createLanguageDescriptor.js';

/** Creates a JSON-safe frame descriptor using +Y forward and +Z up by default. */
export function createFrameDescriptor(input = {}) {
	return createLanguageDescriptor('frame', {
		id: input.id || 'frame',
		position: input.position || [0, 0, 0],
		forward: input.forward || [0, 1, 0],
		up: input.up || [0, 0, 1],
		scale: input.scale || [1, 1, 1],
		source: input.source || null,
		metadata: input.metadata || {}
	});
}
