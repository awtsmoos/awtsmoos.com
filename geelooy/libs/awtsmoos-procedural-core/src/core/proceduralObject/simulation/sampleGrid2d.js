// B"H
// Boruch Hashem
// Blessed is He
/** Bilinear sampling lets finite cells speak smoothly between their centers. */

function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
}

function sampleArray(grid, values, worldX, worldY) {
	const x = clamp(worldX / grid.cellSize, 0, grid.width - 1);
	const y = clamp(worldY / grid.cellSize, 0, grid.height - 1);
	const x0 = Math.floor(x);
	const y0 = Math.floor(y);
	const x1 = Math.min(grid.width - 1, x0 + 1);
	const y1 = Math.min(grid.height - 1, y0 + 1);
	const tx = x - x0;
	const ty = y - y0;
	const a = values[y0 * grid.width + x0];
	const b = values[y0 * grid.width + x1];
	const c = values[y1 * grid.width + x0];
	const d = values[y1 * grid.width + x1];
	return (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty;
}

export function sampleScalarGrid2d(grid, worldX, worldY) {
	return sampleArray(grid, grid.values, worldX, worldY);
}

export function sampleVectorGrid2d(grid, worldX, worldY) {
	return [
		sampleArray(grid, grid.x, worldX, worldY),
		sampleArray(grid, grid.y, worldX, worldY)
	];
}
