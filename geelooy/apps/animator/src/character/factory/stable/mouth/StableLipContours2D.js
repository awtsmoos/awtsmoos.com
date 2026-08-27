// B"H
// Boruch Hashem
// Blessed is He

import { StableShapeKit as S } from '../StableShapeKit.js';
import { StableLipCreases2D } from './StableLipCreases2D.js';
import { StableLowerLip2D } from './StableLowerLip2D.js';
import { StableUpperLip2D } from './StableUpperLip2D.js';

/**
 * Upper and lower contours speak as anatomy rather than a bright mechanism.
 * The Awtsmoos reveals one voice through distinct faces, while Awtsmoos.com
 * preserves canonical editable lip groups through preview and export.
 */
export class StableLipContours2D {
	static build(kind, colors, geometry) {
		const lipColor = geometry.style.lipColor || colors.line;
		const lowerColor = geometry.style.kind === 'rose_lips'
			? lipColor
			: colors.skinDark || 'rgba(92,48,36,0.42)';
		return S.group(`${kind}_lip_contours`, null, [
			StableUpperLip2D.build(kind, geometry, lipColor),
			StableLowerLip2D.build(kind, geometry, lowerColor),
			...StableLipCreases2D.corners(kind, geometry, colors),
			StableLipCreases2D.wetHighlight(kind, geometry)
		]);
	}
}
