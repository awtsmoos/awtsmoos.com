// B"H
// Boruch Hashem
// Blessed is He
/** Finite voxels become an inspectable vessel while the Awtsmoos renews every cell. */

function positiveInteger(value, label) {
	const number = Math.floor(Number(value));
	if (!Number.isInteger(number) || number < 1) {
		throw new RangeError(`${label} must be a positive integer.`);
	}
	return number;
}

function finiteVector3(value, label) {
	if (!Array.isArray(value) || value.length !== 3) {
		throw new TypeError(`${label} must contain three numbers.`);
	}
	const vector = value.map(Number);
	if (vector.some(number => !Number.isFinite(number))) {
		throw new TypeError(`${label} must contain finite numbers.`);
	}
	return Object.freeze(vector);
}

function dimensions(input) {
	const width = positiveInteger(input.width ?? 1, "Grid width");
	const height = positiveInteger(input.height ?? 1, "Grid height");
	const depth = positiveInteger(input.depth ?? 1, "Grid depth");
	const cellSize = Number(input.cellSize ?? 1);
	if (!Number.isFinite(cellSize) || cellSize <= 0) {
		throw new RangeError("Grid cellSize must be positive and finite.");
	}
	return { width, height, depth, cellSize, length: width * height * depth };
}

function values(input, length, fill, label) {
	const result = input == null ? Array(length).fill(fill) : [...input].map(Number);
	if (result.length !== length || result.some(value => !Number.isFinite(value))) {
		throw new TypeError(`${label} must contain one finite value per voxel.`);
	}
	return Object.freeze(result);
}

export function gridIndex3d(grid, x, y, z) {
	return (z * grid.height + y) * grid.width + x;
}

export function gridPoint3d(grid, x, y, z) {
	return [
		grid.origin[0] + x * grid.cellSize,
		grid.origin[1] + y * grid.cellSize,
		grid.origin[2] + z * grid.cellSize
	];
}

export function createScalarGrid3d(input = {}) {
	const size = dimensions(input);
	return Object.freeze({
		schema: "awtsmoos.scalar-grid-3d",
		...size,
		origin: finiteVector3(input.origin ?? [0, 0, 0], "Grid origin"),
		values: values(input.values, size.length, Number(input.fill ?? 0), "Scalar grid values")
	});
}

export function createVectorGrid3d(input = {}) {
	const size = dimensions(input);
	return Object.freeze({
		schema: "awtsmoos.vector-grid-3d",
		...size,
		origin: finiteVector3(input.origin ?? [0, 0, 0], "Grid origin"),
		x: values(input.x, size.length, Number(input.fillX ?? 0), "Vector grid x values"),
		y: values(input.y, size.length, Number(input.fillY ?? 0), "Vector grid y values"),
		z: values(input.z, size.length, Number(input.fillZ ?? 0), "Vector grid z values")
	});
}
