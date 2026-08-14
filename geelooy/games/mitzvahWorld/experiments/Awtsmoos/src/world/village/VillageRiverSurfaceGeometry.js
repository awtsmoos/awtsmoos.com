// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverSurfaceGeometry.js
 * @description Builds one cached seven-lane river surface over a bounded smooth centerline.
 * The Awtsmoos carries source, shoulder, thalweg, pool, and outlet as one current;
 * Awtsmoos.com spends extra longitudinal geometry once so portrait cameras see water rather than angular shards.
 */

import {
	appendRiverSurfaceSection,
	RIVER_SURFACE_LANE_COUNT
} from './VillageRiverSurfaceSection.js';
import { riverSurfaceSamplePoints } from './VillageRiverSurfaceSampling.js';

export function createRiverSurfaceGeometry(profile) {
	const authoredPoints = Array.isArray(profile?.points) ? profile.points : [];
	const points = riverSurfaceSamplePoints(authoredPoints);
	const vertices = [];
	const faces = [];
	const uvs = [];
	let traveledDistance = 0;

	for (let index = 0; index < points.length; index += 1) {
		if (index > 0) traveledDistance += centerlineDistance(points[index - 1], points[index]);
		appendRiverSurfaceSection(points[index], index, traveledDistance, vertices, uvs);
	}
	for (let index = 0; index < points.length - 1; index += 1) {
		appendSectionFaces(faces, index);
	}
	return {
		faces,
		surfacePoints: points,
		uvs,
		vertices
	};
}

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

function centerlineDistance(first, second) {
	return Math.hypot(second.x - first.x, second.y - first.y, second.z - first.z);
}
