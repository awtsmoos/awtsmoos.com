// B"H
// Boruch Hashem
// Blessed is He
/** Jacobi pressure projection removes finite divergence from three-dimensional flow. */

import { createScalarGrid3d, createVectorGrid3d, gridIndex3d } from "../volumes/grid3d.js";

function at(values, grid, x, y, z) {
	const clampedX = Math.max(0, Math.min(grid.width - 1, x));
	const clampedY = Math.max(0, Math.min(grid.height - 1, y));
	const clampedZ = Math.max(0, Math.min(grid.depth - 1, z));
	return values[gridIndex3d(grid, clampedX, clampedY, clampedZ)];
}

export function measureVelocityDivergence3d(velocity) {
	const values = [];
	const scale = 0.5 / velocity.cellSize;
	for (let z = 0; z < velocity.depth; z += 1) {
		for (let y = 0; y < velocity.height; y += 1) {
			for (let x = 0; x < velocity.width; x += 1) {
				values.push((
					at(velocity.x, velocity, x + 1, y, z) - at(velocity.x, velocity, x - 1, y, z)
					+ at(velocity.y, velocity, x, y + 1, z) - at(velocity.y, velocity, x, y - 1, z)
					+ at(velocity.z, velocity, x, y, z + 1) - at(velocity.z, velocity, x, y, z - 1)
				) * scale);
			}
		}
	}
	return createScalarGrid3d({ ...velocity, values });
}

export function projectVelocity3d(velocity, iterations = 32) {
	const divergence = measureVelocityDivergence3d(velocity);
	let pressure = Array(divergence.length).fill(0);
	const scale = velocity.cellSize ** 2;
	for (let iteration = 0; iteration < iterations; iteration += 1) {
		const next = [];
		for (let z = 0; z < velocity.depth; z += 1) for (let y = 0; y < velocity.height; y += 1) for (let x = 0; x < velocity.width; x += 1) {
			const neighbors = at(pressure, velocity, x - 1, y, z) + at(pressure, velocity, x + 1, y, z)
				+ at(pressure, velocity, x, y - 1, z) + at(pressure, velocity, x, y + 1, z)
				+ at(pressure, velocity, x, y, z - 1) + at(pressure, velocity, x, y, z + 1);
			next.push((neighbors - divergence.values[gridIndex3d(velocity, x, y, z)] * scale) / 6);
		}
		pressure = next;
	}
	const xValues = [];
	const yValues = [];
	const zValues = [];
	const gradientScale = 0.5 / velocity.cellSize;
	for (let z = 0; z < velocity.depth; z += 1) for (let y = 0; y < velocity.height; y += 1) for (let x = 0; x < velocity.width; x += 1) {
		const index = gridIndex3d(velocity, x, y, z);
		xValues.push(velocity.x[index] - (at(pressure, velocity, x + 1, y, z) - at(pressure, velocity, x - 1, y, z)) * gradientScale);
		yValues.push(velocity.y[index] - (at(pressure, velocity, x, y + 1, z) - at(pressure, velocity, x, y - 1, z)) * gradientScale);
		zValues.push(velocity.z[index] - (at(pressure, velocity, x, y, z + 1) - at(pressure, velocity, x, y, z - 1)) * gradientScale);
	}
	return createVectorGrid3d({ ...velocity, x: xValues, y: yValues, z: zValues });
}
