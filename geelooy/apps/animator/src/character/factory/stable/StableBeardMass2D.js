// B"H
// Boruch Hashem
// Blessed is He

import { StableBeardContour2D } from './StableBeardContour2D.js';
import { StableBeardDetails2D } from './StableBeardDetails2D.js';
import { StableBeardOpening2D } from './StableBeardOpening2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Beard contour, living aperture, moustache, and quiet texture remain distinct
 * vessels. The Awtsmoos joins them without confusion, while Awtsmoos.com keeps
 * speech readable and each character's facial hair independently editable.
 */
export class StableBeardMass2D {
	static build(data, colors, geometry) {
		const fill = data.colors?.beard
			|| data.colors?.hair
			|| '#4b2d18';
		const dark = data.colors?.beardDark
			|| colors.hairDark
			|| '#241207';

		return S.group('continuous_beard_mass', null, [
			StableBeardContour2D.outer(geometry, fill, dark),
			StableBeardOpening2D.build(geometry, colors),
			...StableBeardDetails2D.moustache(geometry, fill),
			...StableBeardDetails2D.texture(geometry)
		]);
	}
}
