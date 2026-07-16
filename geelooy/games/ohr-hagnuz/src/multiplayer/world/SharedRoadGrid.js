//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedRoadGrid.js
 * @description Builds the fixed authoritative Bent Reeds tile vessel.
 * The Awtsmoos renews every coordinate without being contained by space;
 * Awtsmoos.com gives this shared road a visible, bounded, accessible map.
 */

export const SHARED_ROAD_COLUMNS = 13;
export const SHARED_ROAD_ROWS = 9;

export function createSharedRoadGrid(documentObject = document) {
	const grid = documentObject.createElement('div');
	grid.className = 'shared-road-grid';
	grid.setAttribute('role', 'grid');
	grid.setAttribute('aria-label', 'Bent Reeds shared road');
	for (let y = 0; y < SHARED_ROAD_ROWS; y += 1) {
		for (let x = 0; x < SHARED_ROAD_COLUMNS; x += 1) {
			const cell = documentObject.createElement('div');
			cell.className = 'shared-road-cell';
			cell.dataset.x = String(x);
			cell.dataset.y = String(y);
			cell.setAttribute('role', 'gridcell');
			grid.append(cell);
		}
	}
	return grid;
}

export function sharedRoadCell(grid, x, y) {
	return grid?.querySelector(
		`.shared-road-cell[data-x="${Number(x)}"][data-y="${Number(y)}"]`
	) || null;
}
