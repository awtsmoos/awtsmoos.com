// B"H
// Boruch Hashem
// Blessed is He
/** A finite grid layout binds world coordinates to a budgeted GPU cell lattice. */

function finiteVector3(value, fallback, label) {
	const source = value ?? fallback;
	if (!Array.isArray(source) || source.length !== 3) {
		throw new TypeError(`${label} must contain three values.`);
	}
	const vector = source.map(Number);
	if (vector.some(component => !Number.isFinite(component))) {
		throw new TypeError(`${label} components must be finite.`);
	}
	return Object.freeze(vector);
}

function dimensions3(value, fallback) {
	const source = value ?? fallback;
	if (!Array.isArray(source) || source.length !== 3) {
		throw new TypeError("WebGPU grid dimensions must contain three values.");
	}
	const dimensions = source.map(component => Math.floor(Number(component)));
	if (dimensions.some(component => !Number.isFinite(component) || component <= 0)) {
		throw new TypeError("WebGPU grid dimensions must be positive integers.");
	}
	return Object.freeze(dimensions);
}

export function createWebGpuGridLayout3d(input = {}) {
	const requestedCellCount = Math.floor(Number(input.gridCellCount ?? input.cellCount ?? 1));
	if (!Number.isFinite(requestedCellCount) || requestedCellCount <= 0) {
		throw new TypeError("WebGPU grid cell count must be a positive integer.");
	}
	const dimensions = dimensions3(
		input.gridDimensions ?? input.dimensions,
		[requestedCellCount, 1, 1]
	);
	const cellCount = dimensions.reduce((product, value) => product * value, 1);
	if (cellCount !== requestedCellCount) {
		throw new RangeError(
			`WebGPU grid dimensions multiply to ${cellCount}, expected ${requestedCellCount}.`
		);
	}
	const cellSize = Number(input.gridCellSize ?? input.cellSize ?? 1);
	if (!Number.isFinite(cellSize) || cellSize <= 0) {
		throw new TypeError("WebGPU grid cell size must be positive and finite.");
	}
	return Object.freeze({
		schema: "awtsmoos.webgpu-grid-layout-3d",
		origin: finiteVector3(
			input.gridOrigin ?? input.origin,
			[0, 0, 0],
			"WebGPU grid origin"
		),
		dimensions,
		cellSize,
		cellCount
	});
}
