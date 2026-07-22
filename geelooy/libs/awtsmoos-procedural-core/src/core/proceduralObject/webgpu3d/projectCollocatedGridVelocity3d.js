// B"H
// Boruch Hashem
// Blessed is He
/** Pressure gradients subtract compressive motion while occupied mass remains unchanged. */

import {
	assertNormalizedGrid3d,
	finitePositive,
	gridCoordinateFromIndex3d,
	offsetGridCoordinate3d,
	occupiedGridCell3d,
	pressureNeighbor3d
} from "./collocatedGridMath3d.js";
import { computeCollocatedGridDivergence3d } from "./computeCollocatedGridDivergence3d.js";

export function projectCollocatedGridVelocity3d(gridInput, pressureInput, options = {}) {
	const grid = assertNormalizedGrid3d(gridInput);
	const pressure = pressureInput?.values ?? pressureInput;
	if (!(pressure instanceof Float32Array)
		|| pressure.length !== grid.layout.cellCount) {
		throw new TypeError("Pressure projection requires one Float32 pressure per grid cell.");
	}
	const deltaTime = finitePositive(options.deltaTime ?? pressureInput?.deltaTime, 1 / 60, "Projection delta time");
	const density = finitePositive(options.fluidDensity ?? pressureInput?.fluidDensity, 1000, "Fluid density");
	const gradientScale = deltaTime / (2 * density * grid.layout.cellSize);
	const values = new Float32Array(grid.values);
	for (let index = 0; index < grid.layout.cellCount; index += 1) {
		if (!occupiedGridCell3d(grid, index)) continue;
		const coordinate = gridCoordinateFromIndex3d(grid.layout, index);
		const center = pressure[index];
		for (let axis = 0; axis < 3; axis += 1) {
			const negativeOffset = [0, 0, 0];
			const positiveOffset = [0, 0, 0];
			negativeOffset[axis] = -1;
			positiveOffset[axis] = 1;
			const negative = pressureNeighbor3d(
				grid,
				pressure,
				offsetGridCoordinate3d(coordinate, negativeOffset),
				center
			);
			const positive = pressureNeighbor3d(
				grid,
				pressure,
				offsetGridCoordinate3d(coordinate, positiveOffset),
				center
			);
			values[index * 4 + axis] -= (positive - negative) * gradientScale;
		}
	}
	const projected = Object.freeze({
		schema: "awtsmoos.projected-collocated-grid-3d",
		layout: grid.layout,
		values
	});
	const divergenceBefore = pressureInput?.divergence
		?? computeCollocatedGridDivergence3d(grid);
	const divergenceAfter = computeCollocatedGridDivergence3d(projected);
	return Object.freeze({
		...projected,
		divergenceBefore,
		divergenceAfter,
		fluidDensity: density,
		deltaTime
	});
}
