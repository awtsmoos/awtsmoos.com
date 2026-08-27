// B"H
// Boruch Hashem
// Blessed is He
/** Collocated lattice helpers keep CPU pressure arithmetic identical across every solver stage. */

export const GRID_NEIGHBOR_OFFSETS_3D = Object.freeze([
	Object.freeze([-1, 0, 0]),
	Object.freeze([1, 0, 0]),
	Object.freeze([0, -1, 0]),
	Object.freeze([0, 1, 0]),
	Object.freeze([0, 0, -1]),
	Object.freeze([0, 0, 1])
]);

export function assertNormalizedGrid3d(grid) {
	if (!(grid?.values instanceof Float32Array)
		|| !grid.layout
		|| grid.values.length !== grid.layout.cellCount * 4) {
		throw new TypeError("Collocated pressure requires normalized Float32Array grid values.");
	}
	return grid;
}

export function gridCoordinateFromIndex3d(layout, index) {
	const width = layout.dimensions[0];
	const height = layout.dimensions[1];
	const plane = width * height;
	const z = Math.floor(index / plane);
	const remainder = index - z * plane;
	const y = Math.floor(remainder / width);
	return Object.freeze([remainder - y * width, y, z]);
}

export function gridCoordinateInside3d(layout, coordinate) {
	return coordinate.every((value, axis) => (
		value >= 0 && value < layout.dimensions[axis]
	));
}

export function gridIndexFromCoordinate3d(layout, coordinate) {
	return coordinate[0] + layout.dimensions[0] * (
		coordinate[1] + layout.dimensions[1] * coordinate[2]
	);
}

export function offsetGridCoordinate3d(coordinate, offset) {
	return Object.freeze(coordinate.map((value, axis) => value + offset[axis]));
}

export function occupiedGridCell3d(grid, index) {
	return grid.values[index * 4 + 3] > 0;
}

export function gridVelocityComponent3d(grid, coordinate, axis, fallback) {
	if (!gridCoordinateInside3d(grid.layout, coordinate)) return fallback;
	const index = gridIndexFromCoordinate3d(grid.layout, coordinate);
	return occupiedGridCell3d(grid, index) ? grid.values[index * 4 + axis] : 0;
}

export function pressureNeighbor3d(grid, pressure, coordinate, centerPressure) {
	if (!gridCoordinateInside3d(grid.layout, coordinate)) return centerPressure;
	const index = gridIndexFromCoordinate3d(grid.layout, coordinate);
	return occupiedGridCell3d(grid, index) ? pressure[index] : 0;
}

export function finitePositive(value, fallback, label) {
	const number = Number(value ?? fallback);
	if (!Number.isFinite(number) || number <= 0) {
		throw new TypeError(`${label} must be positive and finite.`);
	}
	return number;
}
