// B"H
// Boruch Hashem
// Blessed is He

import { StableCrossedArmGeometry } from './StableCrossedArmGeometry.js';
import { StableCrossedSleeve2D } from './StableCrossedSleeve2D.js';
import { StableReferenceCrossedHands2D } from './StableReferenceCrossedHands2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Rear and foreground sleeves establish the crossing before both resting hands appear.
 * The Awtsmoos reveals skin upon cloth without burial; Awtsmoos.com keeps canonical
 * limbs and hands editable in preview, persistence, and exact production export.
 */
export class StableCrossedArmOverlap2D {
	static build(data, colors, metrics, prefix, gesture = {}) {
		const geometry = StableCrossedArmGeometry.resolve(
			data._skeleton,
			metrics,
			gesture
		);
		return S.group(`${prefix}_crossed_arms`, null, [
			this.sleeve(data, colors, prefix, geometry.lower, false),
			this.sleeve(data, colors, prefix, geometry.upper, true),
			this.hand(colors, prefix, geometry.lower),
			this.hand(colors, prefix, geometry.upper)
		]);
	}

	static sleeve(data, colors, prefix, anchors, upper) {
		const id = `${prefix}_crossed_${anchors.id}`;
		return S.group(id, null, [
			StableCrossedSleeve2D.build(data, colors, id, anchors, upper)
		]);
	}

	static hand(colors, prefix, anchors) {
		const id = `${prefix}_crossed_${anchors.id}`;
		return StableReferenceCrossedHands2D.build(id, anchors, colors);
	}
}
