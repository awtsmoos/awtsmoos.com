// B"H
// Boruch Hashem
// Blessed is He
/** Collocated curl reveals the rotational rivers pressure alone would smooth away. */

import {
	assertNormalizedGrid3d,
	gridCoordinateFromIndex3d,
	gridVelocityComponent3d,
	offsetGridCoordinate3d,
	occupiedGridCell3d
} from "./collocatedGridMath3d.js";

function derivative(grid, coordinate, velocityAxis, spatialAxis) {
	const negativeOffset = [0, 0, 0];
	const positiveOffset = [0, 0, 0];
	negativeOffset[spatialAxis] = -1;
	positiveOffset[spatialAxis] = 1;
	const index = coordinate[0] + grid.layout.dimensions[0] * (
		coordinate[1] + grid.layout.dimensions[1] * coordinate[2]
	);
	const center = grid.values[index * 4 + velocityAxis];
	const negative = gridVelocityComponent3d(
		grid,
		offsetGridCoordinate3d(coordinate, negativeOffset),
		velocityAxis,
		center
	);
	const positive = gridVelocityComponent3d(
		grid,
		offsetGridCoordinate3d(coordinate, positiveOffset),
		velocityAxis,
		center
	);
	return (positive - negative) / (2 * grid.layout.cellSize);
}

export function computeCollocatedGridVorticity3d(input) {
	const grid = assertNormalizedGrid3d(input);
	const values = new Float32Array(grid.values.length);
	let maximumMagnitude = 0;
	for (let index = 0; index < grid.layout.cellCount; index += 1) {
		if (!occupiedGridCell3d(grid, index)) continue;
		const coordinate = gridCoordinateFromIndex3d(grid.layout, index);
		const curl = [
			derivative(grid, coordinate, 2, 1) - derivative(grid, coordinate, 1, 2),
			derivative(grid, coordinate, 0, 2) - derivative(grid, coordinate, 2, 0),
			derivative(grid, coordinate, 1, 0) - derivative(grid, coordinate, 0, 1)
		];
		const magnitude = Math.hypot(...curl);
		const offset = index * 4;
		values.set(curl, offset);
		values[offset + 3] = magnitude;
		maximumMagnitude = Math.max(maximumMagnitude, magnitude);
	}
	return Object.freeze({
		schema: "awtsmoos.collocated-grid-vorticity-3d",
		layout: grid.layout,
		values,
		maximumMagnitude
	});
}
