// B"H
// Boruch Hashem
// Blessed is He
/** Even weighted-Jacobi iterations solve occupied pressure while air remains zero pressure. */

import {
	GRID_NEIGHBOR_OFFSETS_3D,
	assertNormalizedGrid3d,
	finitePositive,
	gridCoordinateFromIndex3d,
	offsetGridCoordinate3d,
	occupiedGridCell3d,
	pressureNeighbor3d
} from "./collocatedGridMath3d.js";
import { computeCollocatedGridDivergence3d } from "./computeCollocatedGridDivergence3d.js";

function iterationCount(value) {
	const count = Math.floor(Number(value ?? 20));
	if (!Number.isFinite(count) || count <= 0 || count % 2 !== 0) {
		throw new TypeError("Pressure iterations must be a positive even integer.");
	}
	return count;
}

export function solveCollocatedGridPressure3d(gridInput, options = {}) {
	const grid = assertNormalizedGrid3d(gridInput);
	const divergence = options.divergence ?? computeCollocatedGridDivergence3d(grid);
	if (!(divergence.values instanceof Float32Array)
		|| divergence.values.length !== grid.layout.cellCount) {
		throw new TypeError("Pressure solve divergence must match the grid cell count.");
	}
	const deltaTime = finitePositive(options.deltaTime, 1 / 60, "Pressure delta time");
	const density = finitePositive(options.fluidDensity, 1000, "Fluid density");
	const iterations = iterationCount(options.pressureIterations);
	const relaxation = Math.max(0, Math.min(1, Number(options.pressureRelaxation ?? 1)));
	if (!Number.isFinite(relaxation)) throw new TypeError("Pressure relaxation must be finite.");
	const scale = grid.layout.cellSize ** 2 * density / deltaTime;
	let source = new Float32Array(grid.layout.cellCount);
	let destination = new Float32Array(grid.layout.cellCount);
	let residual = 0;
	for (let iteration = 0; iteration < iterations; iteration += 1) {
		residual = 0;
		for (let index = 0; index < grid.layout.cellCount; index += 1) {
			if (!occupiedGridCell3d(grid, index)) {
				destination[index] = 0;
				continue;
			}
			const coordinate = gridCoordinateFromIndex3d(grid.layout, index);
			const center = source[index];
			let sum = 0;
			for (const offset of GRID_NEIGHBOR_OFFSETS_3D) {
				sum += pressureNeighbor3d(
					grid,
					source,
					offsetGridCoordinate3d(coordinate, offset),
					center
				);
			}
			const candidate = (sum - divergence.values[index] * scale) / 6;
			const next = center + (candidate - center) * relaxation;
			destination[index] = next;
			residual = Math.max(residual, Math.abs(next - center));
		}
		[source, destination] = [destination, source];
	}
	return Object.freeze({
		schema: "awtsmoos.collocated-grid-pressure-3d",
		layout: grid.layout,
		values: source,
		divergence,
		iterations,
		residual,
		fluidDensity: density,
		deltaTime,
		pressureRelaxation: relaxation
	});
}
