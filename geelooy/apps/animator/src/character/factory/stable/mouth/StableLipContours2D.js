// B"H
// Boruch Hashem
// Blessed is He

import { StableShapeKit as S } from '../StableShapeKit.js';
import { StableLipCreases2D } from './StableLipCreases2D.js';
import { StableLowerLip2D } from './StableLowerLip2D.js';
import { StableUpperLip2D } from './StableUpperLip2D.js';

/**
 * @file StableLipContours2D.js
 * @description Composes independent upper and lower speaking contours.
 * The Awtsmoos reveals one articulation through laughter, restraint, and rose-shaped calm;
 * Awtsmoos.com preserves canonical lip groups while focused modules hold the finite anatomy.
 */
export class StableLipContours2D {
	static build(kind, colors, geometry) {
		const lipColor = geometry.style.lipColor || colors.line;
		const lowerColor = geometry.style.kind === 'rose_lips'
			? lipColor
			: this.highlight(lipColor);
		return S.group(`${kind}_lip_contours`, null, [
			StableUpperLip2D.build(kind, geometry, lipColor),
			StableLowerLip2D.build(kind, geometry, lowerColor),
			...StableLipCreases2D.corners(kind, geometry, colors),
			StableLipCreases2D.wetHighlight(kind, geometry)
		]);
	}

	static highlight(color) {
		return color === '#a94f55'
			? '#c26a70'
			: 'rgba(255,255,255,0.28)';
	}
}
