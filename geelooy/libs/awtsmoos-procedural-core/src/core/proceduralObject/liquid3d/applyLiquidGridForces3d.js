// B"H
// Boruch Hashem
// Blessed is He
/** Explicit acceleration moves only cells that presently bear liquid mass. */

import { createVectorGrid3d } from "../volumes/grid3d.js";

function totalAcceleration(options) {
	const values = [0, 0, 0];
	const accelerations = [options.gravity ?? [0, -9.81, 0], ...(options.accelerations ?? [])];
	for (const acceleration of accelerations) {
		if (!Array.isArray(acceleration) || acceleration.length !== 3) {
			throw new TypeError("Liquid acceleration must contain three components.");
		}
		for (let axis = 0; axis < 3; axis += 1) {
			const component = Number(acceleration[axis]);
			if (!Number.isFinite(component)) {
				throw new TypeError("Liquid acceleration components must be finite.");
			}
			values[axis] += component;
		}
	}
	return values;
}

export function applyLiquidGridForces3d(velocityGrid, massGrid, options = {}) {
	const deltaTime = Math.max(0, Number(options.deltaTime ?? 1 / 60));
	const acceleration = totalAcceleration(options);
	const x = [...velocityGrid.x];
	const y = [...velocityGrid.y];
	const z = [...velocityGrid.z];
	for (let index = 0; index < massGrid.values.length; index += 1) {
		if (massGrid.values[index] <= 0) {
			continue;
		}
		x[index] += acceleration[0] * deltaTime;
		y[index] += acceleration[1] * deltaTime;
		z[index] += acceleration[2] * deltaTime;
	}
	return createVectorGrid3d({ ...velocityGrid, x, y, z });
}
