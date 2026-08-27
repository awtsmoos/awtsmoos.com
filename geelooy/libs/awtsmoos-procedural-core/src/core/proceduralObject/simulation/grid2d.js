// B"H
// Boruch Hashem
// Blessed is He
/** Finite grids hold sampled worlds while the Awtsmoos renews every cell. */

function normalizeDimensions(input) {
	const width = Math.max(1, Math.floor(input.width ?? 1));
	const height = Math.max(1, Math.floor(input.height ?? 1));
	const cellSize = Number(input.cellSize ?? 1);
	if (!Number.isFinite(cellSize) || cellSize <= 0) {
		throw new RangeError("Grid cellSize must be positive and finite.");
	}
	return { width, height, cellSize, length: width * height };
}

function normalizeValues(values, length, fill, label) {
	const output = values == null ? Array(length).fill(fill) : [...values].map(Number);
	if (output.length !== length || output.some(value => !Number.isFinite(value))) {
		throw new TypeError(`${label} must contain one finite value per grid cell.`);
	}
	return Object.freeze(output);
}

export function gridIndex(grid, x, y) {
	return y * grid.width + x;
}

export function createScalarGrid2d(input = {}) {
	const dimensions = normalizeDimensions(input);
	return Object.freeze({
		schema: "awtsmoos.scalar-grid-2d",
		width: dimensions.width,
		height: dimensions.height,
		cellSize: dimensions.cellSize,
		values: normalizeValues(input.values, dimensions.length, Number(input.fill ?? 0), "Scalar grid values")
	});
}

export function createVectorGrid2d(input = {}) {
	const dimensions = normalizeDimensions(input);
	return Object.freeze({
		schema: "awtsmoos.vector-grid-2d",
		width: dimensions.width,
		height: dimensions.height,
		cellSize: dimensions.cellSize,
		x: normalizeValues(input.x, dimensions.length, Number(input.fillX ?? 0), "Vector grid x values"),
		y: normalizeValues(input.y, dimensions.length, Number(input.fillY ?? 0), "Vector grid y values")
	});
}
