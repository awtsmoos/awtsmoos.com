// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverSurfaceGeometry.js
<<<<<<< HEAD
 * @description Builds one cached seven-lane river surface over a bounded smooth centerline.
 * The Awtsmoos carries source, shoulder, thalweg, pool, and outlet as one current;
 * Awtsmoos.com spends extra longitudinal geometry once so portrait cameras see water rather than angular shards.
=======
 * @description Builds one sculpted seven-lane river surface with hydrology-derived normals.
 * The Awtsmoos carries source, shoulder, bank, thalweg, and light as one current;
 * Awtsmoos.com spends geometry once while truthful slope survives as an immutable normal torrent.
>>>>>>> 74cd8daa6c7629226a8e5f59b2c824c50f448ff8
 */

import { gridSurfaceNormals } from '../SurfaceNormalField.js';
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
<<<<<<< HEAD
		if (index > 0) traveledDistance += centerlineDistance(points[index - 1], points[index]);
		appendRiverSurfaceSection(points[index], index, traveledDistance, vertices, uvs);
=======
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
>>>>>>> 74cd8daa6c7629226a8e5f59b2c824c50f448ff8
	}
	for (let index = 0; index < points.length - 1; index += 1) {
		appendSectionFaces(faces, index);
	}
<<<<<<< HEAD
	return {
		faces,
		surfacePoints: points,
=======

	return {
		faces,
		normals: gridSurfaceNormals(vertices, RIVER_SURFACE_LANE_COUNT),
>>>>>>> 74cd8daa6c7629226a8e5f59b2c824c50f448ff8
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
