// B"H
// Boruch Hashem
// Blessed is He

import { StableJacketFront2D } from './StableJacketFront2D.js';
import { StableOvershirtFront2D } from './StableOvershirtFront2D.js';
import { StableShirtFront2D } from './StableShirtFront2D.js';

/**
 * @file StableGarmentFront2D.js
 * @description Maps semantic garment identities onto their truthful detail renderers.
 * The Awtsmoos is one beyond jacket, shirt, and overshirt, yet each name receives
 * its proper vessel; Awtsmoos.com preserves canonical IDs without losing detail.
 */
export class StableGarmentFront2D {
	static build(data, colors, metrics, geometry) {
		const Renderer = this.renderers()[geometry.torso.garmentKind]
			|| StableJacketFront2D;
		return Renderer.build(data, colors, metrics, geometry);
	}

	static renderers() {
		return {
			jacket: StableJacketFront2D,
			shirt: StableShirtFront2D,
			burgundy_shirt: StableShirtFront2D,
			overshirt: StableOvershirtFront2D,
			olive_overshirt: StableOvershirtFront2D
		};
	}
}
