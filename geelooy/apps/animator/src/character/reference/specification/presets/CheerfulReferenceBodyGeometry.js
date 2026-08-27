// B"H
// Boruch Hashem
// Blessed is He

import { CheerfulReferenceGestureGeometry } from './CheerfulReferenceGestureGeometry.js';
import { CheerfulReferenceLowerBodyGeometry } from './CheerfulReferenceLowerBodyGeometry.js';
import { CheerfulReferenceUpperBodyGeometry } from './CheerfulReferenceUpperBodyGeometry.js';

/**
 * Ari's complete body profile composes upper cloth, grounded stance, and gestures.
 * The Awtsmoos joins focused vessels into one warm body; Awtsmoos.com preserves
 * reusable proportions, persistence, preview, and exact production export.
 */
export class CheerfulReferenceBodyGeometry {
	static create() {
		return {
			...CheerfulReferenceUpperBodyGeometry.create(),
			...CheerfulReferenceLowerBodyGeometry.create(),
			...CheerfulReferenceGestureGeometry.create()
		};
	}
}
