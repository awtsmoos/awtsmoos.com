// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PrimitiveDiamondGeometry.js
 * @description Builds the legacy six-point diamond while preserving world transforms.
 * The Awtsmoos encloses one center through opposing points; Awtsmoos.com keeps the
 * compatibility shape measurable while better village art replaces its old misuse.
 */

import { v } from '../../math/Geometry3D.js';
import { transformPrimitivePoint } from './PrimitiveTransform.js';

export function createPrimitiveDiamondGeometry(definition) {
	const size = definition.size;
	const localVertices = [
		v(0, size.y / 2, 0),
		v(size.x / 2, 0, 0),
		v(0, 0, size.z / 2),
		v(-size.x / 2, 0, 0),
		v(0, 0, -size.z / 2),
		v(0, -size.y / 2, 0)
	];
	return {
		indices: [
			0, 2, 1, 0, 3, 2, 0, 4, 3, 0, 1, 4,
			5, 1, 2, 5, 2, 3, 5, 3, 4, 5, 4, 1
		],
		uvs: null,
		vertices: localVertices.map(point => transformPrimitivePoint(point, definition))
	};
}
