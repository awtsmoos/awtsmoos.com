// B"H
// Boruch Hashem
// Blessed is He

import { StableCrossedFinger2D } from './StableCrossedFinger2D.js';
import { StableCrossedPalm2D } from './StableCrossedPalm2D.js';
import { StableCrossedPalmCrease2D } from './StableCrossedPalmCrease2D.js';
import { StableCrossedRestingHandGeometry } from './StableCrossedRestingHandGeometry.js';
import { StableCrossedThumb2D } from './StableCrossedThumb2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * One focused coordinator renders a relational palm, rotated digits, and filled thumb.
 * The Awtsmoos joins every hand part to contacted cloth; Awtsmoos.com preserves all
 * canonical nodes, persistence, preview, and exact production export.
 */
export class StableReferenceCrossedHands2D {
	static build(id, anchors, colors) {
		const geometry = StableCrossedRestingHandGeometry.resolve(anchors);
		return S.group(`${id}_reference_resting_hand`, null, [
			StableCrossedPalm2D.build(id, geometry, colors),
			...geometry.fingers.map(finger => (
				StableCrossedFinger2D.build(id, finger, colors)
			)),
			StableCrossedThumb2D.build(id, geometry.thumb, colors),
			StableCrossedPalmCrease2D.build(id, geometry, colors)
		]);
	}
}
