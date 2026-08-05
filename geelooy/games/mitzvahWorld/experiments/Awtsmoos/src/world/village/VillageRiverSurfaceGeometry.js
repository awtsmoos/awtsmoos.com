// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverSurfaceGeometry.js
 * @description Builds one sculpted seven-lane river surface with hydrology-derived normals.
 * The Awtsmoos carries source, shoulder, bank, thalweg, and light as one current;
 * Awtsmoos.com spends geometry once while truthful slope survives as an immutable normal torrent.
 */

import { gridSurfaceNormals } from '../SurfaceNormalField.js';
import {
	appendRiverSurfaceSection,
	RIVER_SURFACE_LANE_COUNT
} from './VillageRiverSurfaceSection.js';

export function createRiverSurfaceGeometry(profile) {
	const points = Array.isArray(profile?.points) ? profile.points : [];
	const vertices = [];
	const faces = [];
	const uvs = [];
	let traveledDistance = 0;

	for (let index = 0; index < points.length; index += 1) {
		if (index > 0) {
			traveledDistance += centerlineDistance(
				points[index - 1],
				points[index]
			);
		}
		appendRiverSurfaceSection(
			points[index],
			index,
			traveledDistance,
			vertices,
			uvs
		);
	}

	for (let index = 0; index < points.length - 1; index += 1) {
		appendSectionFaces(faces, index);
	}

	return {
		faces,
		normals: gridSurfaceNormals(vertices, RIVER_SURFACE_LANE_COUNT),
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
	return Math.hypot(
		second.x - first.x,
		second.y - first.y,
		second.z - first.z
	);
}
