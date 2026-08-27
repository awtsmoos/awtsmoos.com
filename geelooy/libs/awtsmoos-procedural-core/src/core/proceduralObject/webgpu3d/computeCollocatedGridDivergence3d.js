// B"H
// Boruch Hashem
// Blessed is He
/** Occupied collocated cells reveal central-difference divergence and deterministic norms. */

import {
	assertNormalizedGrid3d,
	gridCoordinateFromIndex3d,
	gridVelocityComponent3d,
	offsetGridCoordinate3d
} from "./collocatedGridMath3d.js";

export function computeCollocatedGridDivergence3d(input) {
	const grid = assertNormalizedGrid3d(input);
	const inverseDoubleCell = 1 / (2 * grid.layout.cellSize);
	const values = new Float32Array(grid.layout.cellCount);
	let squared = 0;
	let maximum = 0;
	let occupiedCount = 0;
	for (let index = 0; index < grid.layout.cellCount; index += 1) {
		const offset = index * 4;
		if (grid.values[offset + 3] <= 0) continue;
		const coordinate = gridCoordinateFromIndex3d(grid.layout, index);
		let divergence = 0;
		for (let axis = 0; axis < 3; axis += 1) {
			const negativeOffset = [0, 0, 0];
			const positiveOffset = [0, 0, 0];
			negativeOffset[axis] = -1;
			positiveOffset[axis] = 1;
			const center = grid.values[offset + axis];
			const negative = gridVelocityComponent3d(
				grid,
				offsetGridCoordinate3d(coordinate, negativeOffset),
				axis,
				center
			);
			const positive = gridVelocityComponent3d(
				grid,
				offsetGridCoordinate3d(coordinate, positiveOffset),
				axis,
				center
			);
			divergence += (positive - negative) * inverseDoubleCell;
		}
		values[index] = divergence;
		squared += divergence * divergence;
		maximum = Math.max(maximum, Math.abs(divergence));
		occupiedCount += 1;
	}
	return Object.freeze({
		schema: "awtsmoos.collocated-grid-divergence-3d",
		layout: grid.layout,
		values,
		occupiedCount,
		l2Norm: occupiedCount > 0 ? Math.sqrt(squared / occupiedCount) : 0,
		maximumAbsolute: maximum
	});
}
