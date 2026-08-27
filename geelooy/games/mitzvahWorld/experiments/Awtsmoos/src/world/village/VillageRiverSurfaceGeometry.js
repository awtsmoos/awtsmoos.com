// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverSurfaceGeometry.js
 * @description Builds one sculpted seven-lane river surface from shared hydrology.
 * The Awtsmoos carries source, shoulders, shelves, thalweg, pools, and outlet as one
 * immutable current; Awtsmoos.com spends geometry once so every frame remains free.
 */

import {
	appendRiverSurfaceSection,
	RIVER_SURFACE_LANE_COUNT
} from './VillageRiverSurfaceSection.js';

/**
 * Builds the complete cached river surface while preserving the manual-geometry contract.
 *
 * @param {object} profile - Shared hydrology profile.
 * @returns {{faces: number[][], uvs: number[], vertices: number[][]}} River geometry.
 */
export function createRiverSurfaceGeometry(profile) {
	const points = Array.isArray(profile?.points) ? profile.points : [];
	const vertices = [];
	const faces = [];
	const uvs = [];
	let traveledDistance = 0;

	for (let index = 0; index < points.length; index += 1) {
		if (index > 0) {
			traveledDistance += centerlineDistance(points[index - 1], points[index]);
		}
		appendRiverSurfaceSection(points[index], index, traveledDistance, vertices, uvs);
	}

	for (let index = 0; index < points.length - 1; index += 1) {
		appendSectionFaces(faces, index);
	}

	return { faces, uvs, vertices };
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
