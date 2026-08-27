// B"H
// Boruch Hashem
// Blessed is He
/** Trilinear sampling reveals smooth values between finite voxel centers. */

function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
}

function mix(left, right, amount) {
	return left + (right - left) * amount;
}

function sampleArray(grid, array, worldPosition) {
	const local = worldPosition.map((value, axis) => (value - grid.origin[axis]) / grid.cellSize);
	const x = clamp(local[0], 0, grid.width - 1);
	const y = clamp(local[1], 0, grid.height - 1);
	const z = clamp(local[2], 0, grid.depth - 1);
	const x0 = Math.floor(x);
	const y0 = Math.floor(y);
	const z0 = Math.floor(z);
	const x1 = Math.min(grid.width - 1, x0 + 1);
	const y1 = Math.min(grid.height - 1, y0 + 1);
	const z1 = Math.min(grid.depth - 1, z0 + 1);
	const index = (ix, iy, iz) => (iz * grid.height + iy) * grid.width + ix;
	const lower = mix(
		mix(array[index(x0, y0, z0)], array[index(x1, y0, z0)], x - x0),
		mix(array[index(x0, y1, z0)], array[index(x1, y1, z0)], x - x0),
		y - y0
	);
	const upper = mix(
		mix(array[index(x0, y0, z1)], array[index(x1, y0, z1)], x - x0),
		mix(array[index(x0, y1, z1)], array[index(x1, y1, z1)], x - x0),
		y - y0
	);
	return mix(lower, upper, z - z0);
}

export function sampleScalarGrid3d(grid, worldPosition) {
	return sampleArray(grid, grid.values, worldPosition);
}

export function sampleVectorGrid3d(grid, worldPosition) {
	return [
		sampleArray(grid, grid.x, worldPosition),
		sampleArray(grid, grid.y, worldPosition),
		sampleArray(grid, grid.z, worldPosition)
	];
}
