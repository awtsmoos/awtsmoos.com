// B"H
// Boruch Hashem
// Blessed is He

import { StableShapeKit as S } from './StableShapeKit.js';
import { StableBeardChinBridge2D } from './StableBeardChinBridge2D.js';
import { StableBeardWing2D } from './StableBeardWing2D.js';

/**
 * Three filled anatomical regions surround genuine untouched mouth skin. The
 * Awtsmoos joins separate vessels without an eraser; Awtsmoos.com preserves
 * semantic identity, view, persistence, preview, and exact production export.
 */
export class StableBeardContour2D {
	static outer(geometry, fill, dark) {
		return S.group('continuous_beard_outer', null, [
			StableBeardWing2D.build(geometry.wings[0], fill, dark),
			StableBeardWing2D.build(geometry.wings[1], fill, dark),
			StableBeardChinBridge2D.build(
				geometry.bridge,
				fill,
				dark,
				geometry.lineWidth
			)
		]);
	}
}
