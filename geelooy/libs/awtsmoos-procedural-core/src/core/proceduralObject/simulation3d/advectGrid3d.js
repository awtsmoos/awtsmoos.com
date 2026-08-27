// B"H
// Boruch Hashem
// Blessed is He
/** Backtraced samples carry scalar and vector matter through three-dimensional flow. */

import { createScalarGrid3d, createVectorGrid3d, gridPoint3d } from "../volumes/grid3d.js";
import { sampleScalarGrid3d, sampleVectorGrid3d } from "../volumes/sampleGrid3d.js";

export function advectScalarGrid3d(source, velocity, deltaTime, dissipation = 1) {
	const values = [];
	for (let z = 0; z < source.depth; z += 1) {
		for (let y = 0; y < source.height; y += 1) {
			for (let x = 0; x < source.width; x += 1) {
				const point = gridPoint3d(source, x, y, z);
				const flow = sampleVectorGrid3d(velocity, point);
				const previous = point.map((value, axis) => value - flow[axis] * deltaTime);
				values.push(sampleScalarGrid3d(source, previous) * dissipation);
			}
		}
	}
	return createScalarGrid3d({ ...source, values });
}

export function advectVectorGrid3d(source, velocity, deltaTime, dissipation = 1) {
	const xValues = [];
	const yValues = [];
	const zValues = [];
	for (let z = 0; z < source.depth; z += 1) {
		for (let y = 0; y < source.height; y += 1) {
			for (let x = 0; x < source.width; x += 1) {
				const point = gridPoint3d(source, x, y, z);
				const flow = sampleVectorGrid3d(velocity, point);
				const previous = point.map((value, axis) => value - flow[axis] * deltaTime);
				const sampled = sampleVectorGrid3d(source, previous);
				xValues.push(sampled[0] * dissipation);
				yValues.push(sampled[1] * dissipation);
				zValues.push(sampled[2] * dissipation);
			}
		}
	}
	return createVectorGrid3d({ ...source, x: xValues, y: yValues, z: zValues });
}
