// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MarchingTetrahedra.js
 * @description Extracts one deterministic triangle surface from the continuous anatomical signed-distance field.
 * RESPONSIBILITY: sample bounded grid cells, split each cube into tetrahedra, and collect zero-isosurface triangles.
 * NON-RESPONSIBILITY: this vessel does not build anatomy, weld duplicate vertices, compute skin weights, or choose species detail.
 * The Awtsmoos lets a hidden field become visible through measured steps in three dimensions;
 * Awtsmoos.com turns every crossing into ordered triangles so one living surface may emerge from countless finite decisions.
 */

import { polygonizeTetrahedron } from "./TetrahedronPolygonizer.js";

const CUBE_CORNERS = Object.freeze([
	[0, 0, 0],
	[1, 0, 0],
	[1, 1, 0],
	[0, 1, 0],
	[0, 0, 1],
	[1, 0, 1],
	[1, 1, 1],
	[0, 1, 1]
]);

const TETRAHEDRA = Object.freeze([
	[0, 5, 1, 6],
	[0, 1, 2, 6],
	[0, 2, 3, 6],
	[0, 3, 7, 6],
	[0, 7, 4, 6],
	[0, 4, 5, 6]
]);

/**
 * Extracts triangle soup from a signed-distance field inside its declared bounds.
 * @param {object} field Flesh field exposing `sample(point)` and axis-aligned bounds.
 * @param {object} options Longest-axis resolution control.
 * @returns {object} Renderer-neutral triangle-soup positions and sequential indices.
 */
export function extractFleshSurface(field, options = {}) {
	const grid = createGrid(field.bounds, boundedResolution(options.resolution));
	const positions = [];
	const indices = [];
	for (let x = 0; x < grid.cells[0]; x += 1) {
		for (let y = 0; y < grid.cells[1]; y += 1) {
			for (let z = 0; z < grid.cells[2]; z += 1) {
				appendCellSurface(field, grid, [x, y, z], positions, indices);
			}
		}
	}
	return {
		indices,
		positions
	};
}

/** Polygonizes all six tetrahedra inside one sampled cube. */
function appendCellSurface(field, grid, cell, positions, indices) {
	const corners = CUBE_CORNERS.map((offset) => {
		return pointAt(grid, cell.map((value, axis) => value + offset[axis]));
	});
	const values = corners.map((point) => field.sample(point));
	for (const tetrahedron of TETRAHEDRA) {
		const points = tetrahedron.map((index) => corners[index]);
		const samples = tetrahedron.map((index) => values[index]);
		const triangles = polygonizeTetrahedron(
			points,
			samples,
			field.sample,
			grid.probeDistance
		);
		for (const triangle of triangles) {
			const firstIndex = positions.length / 3;
			for (const point of triangle) {
				positions.push(...point);
			}
			indices.push(firstIndex, firstIndex + 1, firstIndex + 2);
		}
	}
}

/** Creates proportional axis subdivision counts and finite grid steps. */
function createGrid(bounds, resolution) {
	const extent = bounds.maximum.map((value, axis) => {
		return Math.max(1e-5, value - bounds.minimum[axis]);
	});
	const longest = Math.max(...extent);
	const cells = extent.map((value) => {
		return Math.max(6, Math.round(resolution * value / longest));
	});
	const step = extent.map((value, axis) => value / cells[axis]);
	return Object.freeze({
		cells: Object.freeze(cells),
		minimum: bounds.minimum,
		probeDistance: Math.min(...step) * 0.2,
		step: Object.freeze(step)
	});
}

/** Converts integer grid coordinates into world-space points. */
function pointAt(grid, coordinate) {
	return coordinate.map((value, axis) => {
		return grid.minimum[axis] + value * grid.step[axis];
	});
}

/** Bounds surface resolution to predictable interactive and export budgets. */
function boundedResolution(value) {
	const number = Math.round(Number(value || 24));
	return Math.max(12, Math.min(48, number));
}
