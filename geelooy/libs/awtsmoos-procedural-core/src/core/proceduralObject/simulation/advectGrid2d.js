// B"H
// Boruch Hashem
// Blessed is He
/** Semi-Lagrangian advection follows finite traces through the flowing vessel. */

import { createScalarGrid2d, createVectorGrid2d } from "./grid2d.js";
import { sampleScalarGrid2d, sampleVectorGrid2d } from "./sampleGrid2d.js";

export function advectScalarGrid2d(source, velocity, deltaTime, dissipation = 1) {
	const values = [];
	for (let y = 0; y < source.height; y += 1) {
		for (let x = 0; x < source.width; x += 1) {
			const worldX = x * source.cellSize;
			const worldY = y * source.cellSize;
			const sampledVelocity = sampleVectorGrid2d(velocity, worldX, worldY);
			values.push(sampleScalarGrid2d(
				source,
				worldX - sampledVelocity[0] * deltaTime,
				worldY - sampledVelocity[1] * deltaTime
			) * dissipation);
		}
	}
	return createScalarGrid2d({ ...source, values });
}

export function advectVectorGrid2d(source, velocity, deltaTime, dissipation = 1) {
	const xValues = [];
	const yValues = [];
	for (let y = 0; y < source.height; y += 1) {
		for (let x = 0; x < source.width; x += 1) {
			const worldX = x * source.cellSize;
			const worldY = y * source.cellSize;
			const sampledVelocity = sampleVectorGrid2d(velocity, worldX, worldY);
			const value = sampleVectorGrid2d(
				source,
				worldX - sampledVelocity[0] * deltaTime,
				worldY - sampledVelocity[1] * deltaTime
			);
			xValues.push(value[0] * dissipation);
			yValues.push(value[1] * dissipation);
		}
	}
	return createVectorGrid2d({ ...source, x: xValues, y: yValues });
}
