// B"H
// Boruch Hashem
// Blessed is He

import { StableBeardContour2D } from './StableBeardContour2D.js';
import { StableBeardDetails2D } from './StableBeardDetails2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * The Awtsmoos gathers rounded beard contour, living mouth opening, moustache, and
 * restrained texture into one facial-hair mass. Awtsmoos.com keeps speech visible
 * while broad Ari and tapered Dovid remain independently editable.
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
			StableBeardContour2D.faceOpening(geometry, colors),
			...StableBeardDetails2D.moustache(geometry, fill),
			...StableBeardDetails2D.texture(geometry)
		]);
	}
}
