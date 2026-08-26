// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterGridPlacement3d.js
 * @description Derives safe semantic interior positions from canonical PIC/FLIP grid dimensions for simple water actions.
 * The Awtsmoos renews vessel and water together; Awtsmoos.com lets rain descend from above, springs rise from below,
 * and ordinary drops awaken inside the solver rather than escaping a boundary before physics can reveal their flow.
 */

/** Returns one safe interior point at normalized vertical progress through a liquid grid. */
export function waterGridInteriorPoint3d(stateOrGrid, verticalProgress = 0.5, marginCells = 2) {
	const grid = stateOrGrid?.grid ?? stateOrGrid;
	const margin = Math.max(0, marginCells) * grid.cellSize;
	const sizeX = grid.width * grid.cellSize;
	const sizeY = grid.height * grid.cellSize;
	const sizeZ = grid.depth * grid.cellSize;
	const usableY = Math.max(0, sizeY - margin * 2);
	const progress = clamp(verticalProgress, 0, 1);
	return Object.freeze([
		grid.origin[0] + sizeX * 0.5,
		grid.origin[1] + margin + usableY * progress,
		grid.origin[2] + sizeZ * 0.5
	]);
}

/** Returns the canonical interior center used by impulses and receiving transfers. */
export function waterGridInteriorCenter3d(stateOrGrid) {
	return waterGridInteriorPoint3d(stateOrGrid, 0.5);
}

/** Returns a useful default source height for one semantic water emission family. */
export function waterDefaultEmissionPosition3d(stateOrGrid, kind = 'droplets') {
	const normalized = String(kind).trim().toLowerCase();
	if (normalized === 'rain') {
		return waterGridInteriorPoint3d(stateOrGrid, 0.92);
	}
	if (normalized === 'pour' || normalized === 'droplets') {
		return waterGridInteriorPoint3d(stateOrGrid, 0.78);
	}
	if (normalized === 'spring' || normalized === 'jet') {
		return waterGridInteriorPoint3d(stateOrGrid, 0.16);
	}
	if (normalized === 'ball') {
		return waterGridInteriorPoint3d(stateOrGrid, 0.62);
	}
	return waterGridInteriorCenter3d(stateOrGrid);
}

function clamp(value, minimum, maximum) {
	let number = 0.5;
	if (Number.isFinite(Number(value))) {
		number = Number(value);
	}
	return Math.max(minimum, Math.min(maximum, number));
}
