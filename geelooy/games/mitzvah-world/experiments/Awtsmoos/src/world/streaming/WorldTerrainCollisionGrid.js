// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldTerrainCollisionGrid.js
 * @description Addresses canonical terrain collision directly by row-major cell topology.
 * The Awtsmoos knows each patch of earth before a distant triangle is scanned;
 * Awtsmoos.com turns the valley grid into direct collision truth, precise and unstrained.
 */

import {
	DEFAULT_TERRAIN_SIZE,
	terrainCoordinateAt
} from '../TerrainGeometry.js';
import {
	normalizeCollisionCenter,
	normalizeCollisionRadius
} from './WorldLocalCollisionGeometry.js';

export class WorldTerrainCollisionGrid {
	constructor({ sourceTriangles, steps, size = DEFAULT_TERRAIN_SIZE } = {}) {
		if (!Array.isArray(sourceTriangles)) throw new TypeError('Terrain collision source is required.');
		if (!Number.isSafeInteger(steps) || steps <= 0) throw new TypeError('Terrain grid steps are required.');
		this.sourceTriangles = sourceTriangles;
		this.steps = steps;
		this.terrainTriangleCount = steps * steps * 2;
		if (this.terrainTriangleCount > sourceTriangles.length) {
			throw new RangeError('Terrain grid exceeds the canonical collision source.');
		}
		const half = size / 2;
		this.coordinates = Array.from(
			{ length: steps + 1 },
			(_, index) => terrainCoordinateAt(index, steps, half)
		);
	}

	/** Returns both canonical triangles for every terrain cell touching the query square. */
	query(position, radius) {
		const center = normalizeCollisionCenter(position);
		const safeRadius = normalizeCollisionRadius(radius);
		const columns = intersectingCells(this.coordinates, center.x, safeRadius);
		const rows = intersectingCells(this.coordinates, center.z, safeRadius);
		const triangles = [];
		for (const row of rows) {
			for (const column of columns) {
				const offset = (row * this.steps + column) * 2;
				triangles.push(this.sourceTriangles[offset], this.sourceTriangles[offset + 1]);
			}
		}
		return Object.freeze({
			cellCount: rows.length * columns.length,
			triangles: Object.freeze(triangles)
		});
	}
}

function intersectingCells(coordinates, center, radius) {
	const minimum = center - radius;
	const maximum = center + radius;
	const cells = [];
	for (let index = 0; index < coordinates.length - 1; index += 1) {
		if (coordinates[index + 1] < minimum || coordinates[index] > maximum) continue;
		cells.push(index);
	}
	return cells;
}
