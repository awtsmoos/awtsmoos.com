// B"H
// Boruch Hashem
// Blessed is He
/** Empty world volume is discarded before the liquid skin is reconstructed. */

import { measureParticleBounds3d } from "./measureParticleBounds3d.js";

function positive(value, fallback, label) {
	const number = Number(value ?? fallback);
	if (!Number.isFinite(number) || number <= 0) {
		throw new TypeError(`${label} must be positive and finite.`);
	}
	return number;
}

function gridDimensions(size, cellSize) {
	return size.map(value => Math.max(2, Math.ceil(value / cellSize) + 1));
}

function cellCount(dimensions) {
	return dimensions.reduce((product, value) => product * value, 1);
}

export function planCroppedLiquidSurfaceGrid3d(state, options = {}) {
	const cellScale = positive(options.cellScale, 1, "Surface cell scale");
	let cellSize = positive(
		options.cellSize,
		state.grid.cellSize * cellScale,
		"Surface cell size"
	);
	const maximumCells = Math.max(8, Math.floor(positive(
		options.maxCells,
		131072,
		"Maximum surface cells"
	)));
	const padding = Math.max(0, Number(options.padding ?? cellSize * 2));
	if (!Number.isFinite(padding)) {
		throw new TypeError("Surface padding must be finite.");
	}
	const bounds = measureParticleBounds3d(state.particleSystem, {
		radiusScale: options.radiusScale ?? options.sdf?.radiusScale ?? 1,
		padding
	});
	if (bounds.empty) {
		return Object.freeze({
			width: 2,
			height: 2,
			depth: 2,
			origin: state.grid.origin,
			cellSize,
			estimatedCells: 8,
			coarsened: false,
			empty: true,
			bounds
		});
	}
	let dimensions = gridDimensions(bounds.size, cellSize);
	let estimatedCells = cellCount(dimensions);
	const requestedCellSize = cellSize;
	for (let pass = 0; pass < 8 && estimatedCells > maximumCells; pass += 1) {
		cellSize *= Math.cbrt(estimatedCells / maximumCells) * 1.001;
		dimensions = gridDimensions(bounds.size, cellSize);
		estimatedCells = cellCount(dimensions);
	}
	return Object.freeze({
		width: dimensions[0],
		height: dimensions[1],
		depth: dimensions[2],
		origin: bounds.min,
		cellSize,
		estimatedCells,
		coarsened: cellSize > requestedCellSize,
		empty: false,
		bounds
	});
}
