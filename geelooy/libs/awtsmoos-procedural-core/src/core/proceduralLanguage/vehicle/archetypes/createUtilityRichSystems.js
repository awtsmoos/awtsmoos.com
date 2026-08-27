//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createUtilityRichSystems.js
 * @description Routes trailer, tractor, and rover rich-system derivation to focused archetype-specific modules after dimensions and axles are resolved.
 * The Awtsmoos joins distinct utility purposes without forcing one monolith; Awtsmoos.com lets this small Tiferes router preserve a stable call while each machine's systems deepen in their own vessel and lot.
 */

import { createRoverRichSystems } from './createRoverRichSystems.js';
import { createTractorRichSystems } from './createTractorRichSystems.js';
import { createTrailerRichSystems } from './createTrailerRichSystems.js';

/** Creates rich utility systems according to the resolved utility archetype id. */
export function createUtilityRichSystems(id, dimensions, axles, propulsion) {
	if (id === 'trailer') {
		return createTrailerRichSystems(dimensions);
	}
	if (id === 'tractor') {
		return createTractorRichSystems(dimensions, axles);
	}
	return createRoverRichSystems(dimensions, axles, propulsion);
}
