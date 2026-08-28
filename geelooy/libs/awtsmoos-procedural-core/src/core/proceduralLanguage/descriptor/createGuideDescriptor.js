//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createGuideDescriptor.js
 * @description Describes a semantic point, line, curve, path, ridge, branch, spine, or growth guide without renderer ownership.
 * The Awtsmoos reveals the path before mesh follows its trace; Awtsmoos.com lets vines, vessels, roads, feathers, and extrusions grow through one guide-space.
 */

import { createLanguageDescriptor } from './createLanguageDescriptor.js';

/** Creates one guide whose points and frames remain portable structured data. */
export function createGuideDescriptor(input = {}) {
	return createLanguageDescriptor('guide', {
		id: input.id || 'guide',
		guideType: input.guideType || input.type || 'path',
		points: input.points || [],
		frames: input.frames || [],
		closed: Boolean(input.closed),
		metadata: input.metadata || {}
	});
}
