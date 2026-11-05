// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRiverGeometry.js
 * @description Builds the meadow river skin and bed from one sampled current.
 * The Awtsmoos carries bank, center, depth, UV, and macro normal in one flowing art;
 * Awtsmoos.com keeps the visible skin truthful while the carved bed remains its separate part.
 */

import { gridSurfaceNormals } from '../world/SurfaceNormalField.js';
import { minimalMeadowHeightAt } from './MinimalMeadowTerrainShape.js?v=20260724-meadow-21';
import {
	MINIMAL_MEADOW_RIVER_SEGMENTS,
	minimalMeadowRiverSample
} from './MinimalMeadowRiverPath.js';

const LANES = Object.freeze([-1, -0.68, -0.32, 0, 0.32, 0.68, 1]);

export function createMeadowRiverSurface(
	sections = MINIMAL_MEADOW_RIVER_SEGMENTS,
	bed = false
) {
	const vertices = [];
	const faces = [];
	const uvs = [];
	for (let index = 0; index <= sections; index += 1) {
		appendRiverSection(vertices, uvs, index / sections, bed);
	}
	appendStripFaces(faces, sections, LANES.length);
	if (bed) return { faces, uvs, vertices };
	return {
		faces,
		normals: gridSurfaceNormals(vertices, LANES.length),
		uvs,
		vertices
	};
}

function appendRiverSection(vertices, uvs, t, bed) {
	const sample = minimalMeadowRiverSample(t);
	const side = riverSide(t);
	for (const lane of LANES) {
		const x = sample.x + side.x * sample.width * lane;
		const z = sample.z + side.z * sample.width * lane;
		const surfaceY = sample.waterY - (1 - Math.abs(lane)) * 0.035;
		vertices.push([
			x,
			bed ? minimalMeadowHeightAt(x, z) + 0.035 : surfaceY,
			z
		]);
		uvs.push(t * 18, lane * 0.5 + 0.5);
	}
}

function appendStripFaces(faces, sections, laneCount) {
	for (let section = 0; section < sections; section += 1) {
		for (let lane = 0; lane < laneCount - 1; lane += 1) {
			const first = section * laneCount + lane;
			const next = first + laneCount;
			faces.push([first, next, next + 1, first + 1]);
		}
	}
}

function riverSide(t) {
	const before = minimalMeadowRiverSample(Math.max(0, t - 0.01));
	const after = minimalMeadowRiverSample(Math.min(1, t + 0.01));
	const length = Math.max(
		0.001,
		Math.hypot(after.x - before.x, after.z - before.z)
	);
	return {
		x: -(after.z - before.z) / length,
		z: (after.x - before.x) / length
	};
}
