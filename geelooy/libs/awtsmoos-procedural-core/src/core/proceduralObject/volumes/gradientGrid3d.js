// B"H
// Boruch Hashem
// Blessed is He
/** Central differences reveal the outward direction hidden in a scalar volume. */

import { sampleScalarGrid3d } from "./sampleGrid3d.js";

export function gradientScalarGrid3d(grid, worldPosition, step = grid.cellSize) {
	if (!Number.isFinite(step) || step <= 0) {
		throw new RangeError("Gradient step must be positive and finite.");
	}
	const axisSample = axis => {
		const negative = [...worldPosition];
		const positive = [...worldPosition];
		negative[axis] -= step;
		positive[axis] += step;
		return (sampleScalarGrid3d(grid, positive) - sampleScalarGrid3d(grid, negative)) / (2 * step);
	};
	return [axisSample(0), axisSample(1), axisSample(2)];
}

export function normalizeGradient3d(gradient) {
	const length = Math.hypot(...gradient);
	return length > 1e-12 ? gradient.map(value => value / length) : [0, 0, 0];
}
