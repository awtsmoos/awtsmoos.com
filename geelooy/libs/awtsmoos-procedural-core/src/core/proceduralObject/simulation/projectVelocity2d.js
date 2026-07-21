// B"H
// Boruch Hashem
// Blessed is He
/** Pressure projection removes finite divergence so flow may breathe incompressibly. */

import { createScalarGrid2d, createVectorGrid2d, gridIndex } from "./grid2d.js";

function at(values, grid, x, y) {
	const clampedX = Math.max(0, Math.min(grid.width - 1, x));
	const clampedY = Math.max(0, Math.min(grid.height - 1, y));
	return values[gridIndex(grid, clampedX, clampedY)];
}

export function measureVelocityDivergence2d(velocity) {
	const values = [];
	const scale = 0.5 / velocity.cellSize;
	for (let y = 0; y < velocity.height; y += 1) {
		for (let x = 0; x < velocity.width; x += 1) {
			values.push((
				at(velocity.x, velocity, x + 1, y) - at(velocity.x, velocity, x - 1, y)
				+ at(velocity.y, velocity, x, y + 1) - at(velocity.y, velocity, x, y - 1)
			) * scale);
		}
	}
	return createScalarGrid2d({ ...velocity, values });
}

export function projectVelocity2d(velocity, iterations = 24) {
	const divergence = measureVelocityDivergence2d(velocity);
	let pressure = Array(divergence.values.length).fill(0);
	const scale = velocity.cellSize * velocity.cellSize;
	for (let iteration = 0; iteration < iterations; iteration += 1) {
		const next = [];
		for (let y = 0; y < velocity.height; y += 1) {
			for (let x = 0; x < velocity.width; x += 1) {
				const neighbors = at(pressure, velocity, x - 1, y) + at(pressure, velocity, x + 1, y)
					+ at(pressure, velocity, x, y - 1) + at(pressure, velocity, x, y + 1);
				next.push((neighbors - divergence.values[gridIndex(velocity, x, y)] * scale) * 0.25);
			}
		}
		pressure = next;
	}
	const xValues = [];
	const yValues = [];
	const gradientScale = 0.5 / velocity.cellSize;
	for (let y = 0; y < velocity.height; y += 1) {
		for (let x = 0; x < velocity.width; x += 1) {
			const index = gridIndex(velocity, x, y);
			xValues.push(velocity.x[index] - (at(pressure, velocity, x + 1, y) - at(pressure, velocity, x - 1, y)) * gradientScale);
			yValues.push(velocity.y[index] - (at(pressure, velocity, x, y + 1) - at(pressure, velocity, x, y - 1)) * gradientScale);
		}
	}
	return createVectorGrid2d({ ...velocity, x: xValues, y: yValues });
}
