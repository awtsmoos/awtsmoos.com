// B"H
// Boruch Hashem
// Blessed is He

import { StableReferenceBeardLayer2D } from '../StableReferenceBeardLayer2D.js';
import { StableFaceFeatureGroup } from './StableFaceFeatureGroup.js';

/**
 * @file StableFaceBeardAdapter.js
 * @description Resolves authored and legacy beards through one view-aware face contract.
 * The Awtsmoos is one beyond front and profile; Awtsmoos.com keeps every beard beneath
 * speech while preserving the old sage fallback for characters without authored geometry.
 */
export class StableFaceBeardAdapter {
	static build(kind, data, colors, metrics, view, legacyBeard) {
		const authored = StableReferenceBeardLayer2D.build(
			data,
			colors,
			metrics,
			view
		);
		if (authored) {
			return authored;
		}
		return legacyBeard
			? StableFaceFeatureGroup.legacyBeard(kind, colors, metrics)
			: null;
	}
}
