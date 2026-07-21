// B"H
// Boruch Hashem
// Blessed is He
/** Sparse bricks keep only active regions so vast empty space remains weightless. */

import { createScalarGrid3d, gridIndex3d } from "./grid3d.js";

function brickKey(coordinate) {
	return coordinate.join(":");
}

function normalizeBrick(input, brickSize) {
	const coordinate = [...input.coordinate].map(value => Math.floor(Number(value)));
	if (coordinate.length !== 3 || coordinate.some(value => !Number.isInteger(value))) {
		throw new TypeError("Sparse brick coordinate must contain three integers.");
	}
	const values = [...input.values].map(Number);
	if (values.length !== brickSize ** 3 || values.some(value => !Number.isFinite(value))) {
		throw new TypeError("Sparse brick values must match brickSize cubed.");
	}
	return Object.freeze({ coordinate: Object.freeze(coordinate), values: Object.freeze(values) });
}

export function createSparseScalarBrickGrid3d(input = {}) {
	const brickSize = Math.max(1, Math.floor(input.brickSize ?? 8));
	const template = createScalarGrid3d({ ...input, values: undefined, fill: input.background ?? 0 });
	const bricks = (input.bricks ?? []).map(brick => normalizeBrick(brick, brickSize))
		.sort((left, right) => brickKey(left.coordinate).localeCompare(brickKey(right.coordinate)));
	if (new Set(bricks.map(brick => brickKey(brick.coordinate))).size !== bricks.length) {
		throw new Error("Sparse brick coordinates must be unique.");
	}
	return Object.freeze({
		schema: "awtsmoos.sparse-scalar-brick-grid-3d",
		width: template.width, height: template.height, depth: template.depth,
		cellSize: template.cellSize, origin: template.origin, brickSize,
		background: Number(input.background ?? 0),
		bricks: Object.freeze(bricks)
	});
}

export function createSparseScalarBrickGrid3dFromDense(grid, options = {}) {
	const brickSize = Math.max(1, Math.floor(options.brickSize ?? 8));
	const threshold = Math.max(0, Number(options.threshold ?? 0));
	const background = Number(options.background ?? 0);
	const bricks = [];
	for (let bz = 0; bz < Math.ceil(grid.depth / brickSize); bz += 1) {
		for (let by = 0; by < Math.ceil(grid.height / brickSize); by += 1) {
			for (let bx = 0; bx < Math.ceil(grid.width / brickSize); bx += 1) {
				const values = [];
				let active = false;
				for (let z = 0; z < brickSize; z += 1) for (let y = 0; y < brickSize; y += 1) for (let x = 0; x < brickSize; x += 1) {
					const gx = bx * brickSize + x;
					const gy = by * brickSize + y;
					const gz = bz * brickSize + z;
					const value = gx < grid.width && gy < grid.height && gz < grid.depth
						? grid.values[gridIndex3d(grid, gx, gy, gz)] : background;
					values.push(value);
					active ||= Math.abs(value - background) > threshold;
				}
				if (active) bricks.push({ coordinate: [bx, by, bz], values });
			}
		}
	}
	return createSparseScalarBrickGrid3d({ ...grid, brickSize, background, bricks });
}
