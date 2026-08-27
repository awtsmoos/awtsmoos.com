// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDemonGeometry.js
 * @description Caches one closed weighted geometry with measured UV and vertex-color evidence.
 * The Awtsmoos joins position, normal, color, UV, joint, and weight in one garment;
 * Awtsmoos.com proves the texture coordinates and internal contrast exist before any draw.
 */

import { BufferAttribute, BufferGeometry } from '../../../light-three-gltf/tiny-runtime.js';
import { demonSurfaceRegionContrast } from './MinimalMeadowCreatureSurfaceRegions.js';
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
	geometry.userData.AwtsmoosContinuousDemon = geometryEvidence(surface);
	cachedGeometry = geometry;
	return geometry;
}

function geometryEvidence(surface) {
	const luminances = [];
	for (let index = 0; index < surface.colors.length; index += 4) {
		luminances.push(luminance(surface.colors.slice(index, index + 3)));
	}
	return Object.freeze({
		closedImplicitSurface: true,
		jointCount: 19,
		mapCoordinatesBound: surface.uvs.length > 0,
		regionContrast: demonSurfaceRegionContrast(),
		triangleCount: surface.positions.length / 9,
		uvRange: Object.freeze([Math.min(...surface.uvs), Math.max(...surface.uvs)]),
		vertexCount: surface.positions.length / 3,
		vertexLuminance: Object.freeze({
			average: luminances.reduce((sum, value) => sum + value, 0) / luminances.length,
			maximum: Math.max(...luminances),
			minimum: Math.min(...luminances)
		})
	});
}

function attribute(values, itemSize) {
	return new BufferAttribute(new Float32Array(values), itemSize);
}

function luminance(color) {
	return color[0] * 0.2126 + color[1] * 0.7152 + color[2] * 0.0722;
}
