// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowLakeGeometry.js
 * @description Builds the receiving lake skin and bed with finite radial rings.
 * The Awtsmoos gathers basin, shoreline, ripple, UV, and upward light in one clear face;
 * Awtsmoos.com keeps the remote detail normals resting upon a truthful macro-normal base.
 */

import { faceSurfaceNormals } from '../world/SurfaceNormalField.js';
import { minimalMeadowHeightAt } from './MinimalMeadowTerrainShape.js?v=20260724-meadow-21';
import { MINIMAL_MEADOW_LAKE } from './MinimalMeadowRiverPath.js';

export function createMeadowLakeSurface(segments = 72, rings = 5, bed = false) {
	const centerY = bed
		? minimalMeadowHeightAt(
			MINIMAL_MEADOW_LAKE.centerX,
			MINIMAL_MEADOW_LAKE.centerZ
		) + 0.035
		: MINIMAL_MEADOW_LAKE.waterY;
	const vertices = [[
		MINIMAL_MEADOW_LAKE.centerX,
		centerY,
		MINIMAL_MEADOW_LAKE.centerZ
	]];
	const faces = [];
	const uvs = [0.5, 0.5];
	for (let ring = 1; ring <= rings; ring += 1) {
		appendLakeRing(vertices, uvs, segments, ring / rings, bed);
	}
	appendLakeFaces(faces, segments, rings);
	if (bed) return { faces, uvs, vertices };
	return {
		faces,
		normals: faceSurfaceNormals(vertices, faces),
		uvs,
		vertices
	};
}

function appendLakeRing(vertices, uvs, segments, ratio, bed) {
	for (let index = 0; index < segments; index += 1) {
		const angle = index / segments * Math.PI * 2;
		const ripple = 1
			+ Math.sin(angle * 5) * 0.035
			+ Math.cos(angle * 9) * 0.02;
		const x = MINIMAL_MEADOW_LAKE.centerX
			+ Math.cos(angle) * MINIMAL_MEADOW_LAKE.radiusX * ratio * ripple;
		const z = MINIMAL_MEADOW_LAKE.centerZ
			+ Math.sin(angle) * MINIMAL_MEADOW_LAKE.radiusZ * ratio * ripple;
		const y = bed
			? minimalMeadowHeightAt(x, z) + 0.035
			: MINIMAL_MEADOW_LAKE.waterY;
		vertices.push([x, y, z]);
		uvs.push(
			Math.cos(angle) * ratio * 0.5 + 0.5,
			Math.sin(angle) * ratio * 0.5 + 0.5
		);
	}
}

function appendLakeFaces(faces, segments, rings) {
	for (let index = 0; index < segments; index += 1) {
		faces.push([0, 1 + index, 1 + (index + 1) % segments]);
	}
	for (let ring = 1; ring < rings; ring += 1) {
		const inner = 1 + (ring - 1) * segments;
		const outer = 1 + ring * segments;
		for (let index = 0; index < segments; index += 1) {
			const next = (index + 1) % segments;
			faces.push([
				inner + index,
				outer + index,
				outer + next,
				inner + next
			]);
		}
	}
}
