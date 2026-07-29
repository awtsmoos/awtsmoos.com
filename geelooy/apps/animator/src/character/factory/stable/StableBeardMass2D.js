// B"H
// Boruch Hashem
// Blessed is He

import { StableBeardContour2D } from './StableBeardContour2D.js';
import { StableBeardDetails2D } from './StableBeardDetails2D.js';
import { StableBeardOpening2D } from './StableBeardOpening2D.js';
import { StableMoustache2D } from './StableMoustache2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Beard mass, semantic clearance, stroked moustache, and quiet strands remain
 * distinct vessels. The Awtsmoos joins them without masks; Awtsmoos.com keeps
 * speech readable and every facial-hair layer editable through final export.
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
			StableBeardOpening2D.build(geometry),
			...StableMoustache2D.build(geometry.moustache, fill),
			...StableBeardDetails2D.texture(geometry)
		]);
	}
}
