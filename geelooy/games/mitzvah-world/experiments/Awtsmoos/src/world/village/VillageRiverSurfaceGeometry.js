// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverSurfaceGeometry.js
 * @description Builds one cached seven-lane river surface with smooth centerline sampling, semantic surface points, UV continuity, and hydrology-derived normals.
 * The Awtsmoos carries source, shoulder, bank, thalweg, pool, and outlet as one current;
 * Awtsmoos.com spends geometry once so portrait cameras receive smooth water, truthful slope, and no angular torrent.
 */

import { gridSurfaceNormals } from '../SurfaceNormalField.js';
import {
	appendRiverSurfaceSection,
	RIVER_SURFACE_LANE_COUNT
} from './VillageRiverSurfaceSection.js';
import { riverSurfaceSamplePoints } from './VillageRiverSurfaceSampling.js';

/** Creates renderer-neutral river geometry and the sampled centerline used to produce it. */
export function createRiverSurfaceGeometry(profile) {
	const authoredPoints = Array.isArray(profile?.points) ? profile.points : [];
	const surfacePoints = riverSurfaceSamplePoints(authoredPoints);
	const vertices = [];
	const faces = [];
	const uvs = [];
	let traveledDistance = 0;

	for (let index = 0; index < surfacePoints.length; index += 1) {
		if (index > 0) {
			traveledDistance += centerlineDistance(
				surfacePoints[index - 1],
				surfacePoints[index]
			);
		}
		appendRiverSurfaceSection(
			surfacePoints[index],
			index,
			traveledDistance,
			vertices,
			uvs
		);
	}

	for (let index = 0; index < surfacePoints.length - 1; index += 1) {
		appendSectionFaces(faces, index);
	}

	return {
		faces,
		normals: gridSurfaceNormals(vertices, RIVER_SURFACE_LANE_COUNT),
		surfacePoints,
		uvs,
		vertices
	};
}

/** Connects neighboring seven-lane sections as ordered quads without duplicating vertices. */
function appendSectionFaces(faces, sectionIndex) {
	const current = sectionIndex * RIVER_SURFACE_LANE_COUNT;
	const next = current + RIVER_SURFACE_LANE_COUNT;
	for (let lane = 0; lane < RIVER_SURFACE_LANE_COUNT - 1; lane += 1) {
		faces.push([
			current + lane,
			next + lane,
			next + lane + 1,
			current + lane + 1
		]);
	}
}

/** Measures centerline arc length so UV flow remains stable under resampling. */
function centerlineDistance(first, second) {
	return Math.hypot(
		second.x - first.x,
		second.y - first.y,
		second.z - first.z
	);
}
