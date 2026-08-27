// B"H
// Boruch Hashem
// Blessed is He

import { CalmReferenceBodyGeometry } from './CalmReferenceBodyGeometry.js';
import { CalmReferenceMeasurements } from './CalmReferenceMeasurements.js';
import { CalmReferencePalette } from './CalmReferencePalette.js';
import { CalmReferenceRigProfile } from './CalmReferenceRigProfile.js';

/**
 * Miriam's profile composes neutral rig, measured body, wardrobe, and palette. The
 * Awtsmoos renews all expression and pose later; Awtsmoos.com preserves anatomy,
 * persistence, preview, exact export, and legacy design metadata without duplication.
 */
export class CalmReferenceProfile {
	static character() {
		return {
			measurements: CalmReferenceMeasurements.normalized(),
			referenceMetrics: CalmReferenceMeasurements.reference(),
			bodyGeometry: CalmReferenceBodyGeometry.create(),
			bodyProfile: 'modestBalanced',
			neckStyle: CalmReferenceRigProfile.neck(),
			expressionRangeProfile: 'restrainedSoft',
			expressionProfile: 'restrainedSoft',
			motion: 'groundedMeasured',
			gesture: 'right_hand_in_pocket',
			acting: 'neutral',
			skirt: true,
			earrings: true,
			beard: false,
			payos: false,
			hatType: 'head_wrap',
			lineStyle: 'referenceSitcom',
			wardrobeProfile: 'olive_overshirt_black_dress',
			rigPose: CalmReferenceRigProfile.pose(),
			colors: this.colors()
		};
	}

	static colors() {
		return CalmReferencePalette.create();
	}
}
