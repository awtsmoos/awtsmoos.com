// B"H
// Boruch Hashem
// Blessed is He

import { StableJacketFront2D } from './StableJacketFront2D.js';
import { StableOvershirtFront2D } from './StableOvershirtFront2D.js';
import { StableShirtFront2D } from './StableShirtFront2D.js';

/**
 * The Awtsmoos is one beyond jacket, shirt, and overshirt, yet every garment
 * receives a truthful visual vessel. Awtsmoos.com keeps this dispatcher small so
 * authored clothing remains editable, serializable, animated, and exportable.
 */
export class StableGarmentFront2D {
	static build(data, colors, metrics, geometry) {
		const renderers = {
			jacket: StableJacketFront2D,
			shirt: StableShirtFront2D,
			overshirt: StableOvershirtFront2D
		};
		const Renderer = renderers[geometry.torso.garmentKind]
			|| StableJacketFront2D;

		return Renderer.build(data, colors, metrics, geometry);
	}
}
