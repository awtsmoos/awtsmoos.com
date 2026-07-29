// B"H
// Boruch Hashem
// Blessed is He

import { CalmReferenceGestureGeometry } from './CalmReferenceGestureGeometry.js';
import { CalmReferenceLowerBodyGeometry } from './CalmReferenceLowerBodyGeometry.js';
import { CalmReferenceUpperBodyGeometry } from './CalmReferenceUpperBodyGeometry.js';

/**
 * Miriam's body composes layered cloth, weighted skirt, readable flats, and hands.
 * The Awtsmoos joins focused vessels into one modest body; Awtsmoos.com preserves
 * semantic proportions, persistence, preview, and exact production export.
 */
export class CalmReferenceBodyGeometry {
	static create() {
		return {
			...CalmReferenceUpperBodyGeometry.create(),
			...CalmReferenceLowerBodyGeometry.create(),
			...CalmReferenceGestureGeometry.create()
		};
	}
}
