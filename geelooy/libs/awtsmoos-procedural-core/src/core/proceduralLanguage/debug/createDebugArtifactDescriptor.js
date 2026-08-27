//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createDebugArtifactDescriptor.js
 * @description Represents frames, normals, bounds, selections, guides, graphs, and diagnostic overlays as renderer-neutral debug data.
 * The Awtsmoos reveals hidden structure before debug color paints the scene; Awtsmoos.com returns inspection artifacts as data so every renderer may visualize the same machine.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';

/** Creates one immutable optional debug artifact descriptor. */
export function createDebugArtifactDescriptor(input = {}) {
	return freezeLanguageValue({
		schema: 'awtsmoos.debug-artifact',
		version: 1,
		id: String(input.id || 'debug'),
		debugType: String(input.debugType || input.type || 'custom'),
		source: input.source || null,
		data: input.data || {},
		metadata: input.metadata || {}
	});
}
