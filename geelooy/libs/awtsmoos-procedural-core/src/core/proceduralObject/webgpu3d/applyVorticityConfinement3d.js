// B"H
// Boruch Hashem
// Blessed is He
/** Curl-magnitude gradients cross curl into bounded rotational acceleration. */

import {
	assertNormalizedGrid3d,
	gridCoordinateFromIndex3d,
	gridCoordinateInside3d,
	gridIndexFromCoordinate3d,
	offsetGridCoordinate3d,
	occupiedGridCell3d
} from "./collocatedGridMath3d.js";

function magnitudeAt(vorticity, coordinate, fallback) {
	if (!gridCoordinateInside3d(vorticity.layout, coordinate)) return fallback;
	return vorticity.values[gridIndexFromCoordinate3d(
		vorticity.layout,
		coordinate
	) * 4 + 3];
}

function cross(left, right) {
	return [
		left[1] * right[2] - left[2] * right[1],
		left[2] * right[0] - left[0] * right[2],
		left[0] * right[1] - left[1] * right[0]
	];
}

export function applyVorticityConfinement3d(gridInput, vorticity, options = {}) {
	const grid = assertNormalizedGrid3d(gridInput);
	if (!(vorticity?.values instanceof Float32Array)
		|| vorticity.values.length !== grid.values.length) {
		throw new TypeError("Vorticity confinement requires one vec4 curl per grid cell.");
	}
	const deltaTime = Number(options.deltaTime ?? 0);
	const strength = Number(options.vorticityStrength ?? 0);
	if (![deltaTime, strength].every(Number.isFinite)
		|| deltaTime < 0 || strength < 0) {
		throw new TypeError("Vorticity delta time and strength must be finite and nonnegative.");
	}
	const values = new Float32Array(grid.values);
	for (let index = 0; index < grid.layout.cellCount; index += 1) {
		if (!occupiedGridCell3d(grid, index)) continue;
		const coordinate = gridCoordinateFromIndex3d(grid.layout, index);
		const offset = index * 4;
		const centerMagnitude = vorticity.values[offset + 3];
		const gradient = [0, 1, 2].map(axis => {
			const negativeOffset = [0, 0, 0];
			const positiveOffset = [0, 0, 0];
			negativeOffset[axis] = -1;
			positiveOffset[axis] = 1;
			return (
				magnitudeAt(vorticity, offsetGridCoordinate3d(coordinate, positiveOffset), centerMagnitude)
				- magnitudeAt(vorticity, offsetGridCoordinate3d(coordinate, negativeOffset), centerMagnitude)
			) / (2 * grid.layout.cellSize);
		});
		const gradientLength = Math.hypot(...gradient);
		if (gradientLength <= 1e-12) continue;
		const normal = gradient.map(value => value / gradientLength);
		const curl = [...vorticity.values.slice(offset, offset + 3)];
		const force = cross(normal, curl).map(value => (
			value * strength * grid.layout.cellSize
		));
		for (let axis = 0; axis < 3; axis += 1) {
			values[offset + axis] += force[axis] * deltaTime;
		}
	}
	return Object.freeze({
		schema: "awtsmoos.vorticity-confined-grid-3d",
		layout: grid.layout,
		values,
		vorticity,
		deltaTime,
		vorticityStrength: strength
	});
}
