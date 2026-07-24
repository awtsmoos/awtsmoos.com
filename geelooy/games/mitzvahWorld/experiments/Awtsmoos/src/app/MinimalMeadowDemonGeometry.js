// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDemonGeometry.js
 * @description Converts the closed implicit surface into one weighted renderer geometry.
 * The Awtsmoos joins color, normal, position, UV, joint, and weight in one finite garment;
 * Awtsmoos.com exposes exactly one triangle stream instead of disconnected anatomical meshes.
 */

import { BufferAttribute, BufferGeometry } from '../../../light-three-gltf/tiny-runtime.js';
import { createMinimalDemonSkinAttributes } from './MinimalMeadowDemonSkinWeights.js?v=20260724-meadow-13';
import { createMinimalDemonSurface } from './MinimalMeadowMarchingTetrahedra.js?v=20260724-meadow-13';

let cachedGeometry = null;

export function createMinimalDemonGeometry() {
	if (cachedGeometry) return cachedGeometry;
	const surface = createMinimalDemonSurface();
	const skin = createMinimalDemonSkinAttributes(surface.positions);
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', attribute(surface.positions, 3));
	geometry.setAttribute('normal', attribute(surface.normals, 3));
	geometry.setAttribute('color', attribute(surface.colors, 4));
	geometry.setAttribute('uv', attribute(surface.uvs, 2));
	geometry.setAttribute('joints', attribute(skin.joints, 4));
	geometry.setAttribute('weights', attribute(skin.weights, 4));
	geometry.userData.AwtsmoosContinuousDemon = {
		closedImplicitSurface: true,
		jointCount: 19,
		triangleCount: surface.positions.length / 9,
		vertexCount: surface.positions.length / 3
	};
	cachedGeometry = geometry;
	return geometry;
}

function attribute(values, itemSize) {
	return new BufferAttribute(new Float32Array(values), itemSize);
}
