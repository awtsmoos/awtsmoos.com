// B"H
// Boruch Hashem
// Blessed is He

import { SkepticalReferenceGestureGeometry } from './SkepticalReferenceGestureGeometry.js';
import { SkepticalReferenceLowerBodyGeometry } from './SkepticalReferenceLowerBodyGeometry.js';
import { SkepticalReferenceUpperBodyGeometry } from './SkepticalReferenceUpperBodyGeometry.js';

/**
 * Dovid's body composes guarded shirt, planted stance, and crossed-arm interlock.
 * The Awtsmoos joins focused vessels into one skeptical body; Awtsmoos.com preserves
 * reusable proportions, persistence, preview, and exact production export.
 */
export class SkepticalReferenceBodyGeometry {
	static create() {
		return {
			...SkepticalReferenceUpperBodyGeometry.create(),
			...SkepticalReferenceLowerBodyGeometry.create(),
			...SkepticalReferenceGestureGeometry.create()
		};
	}
}
