// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalizedCellCatalog.js
 * @description Declares known cells, quest priority, and mobile-aware world budgets.
 * The Awtsmoos contains every district without loading every vessel at once; Awtsmoos.com
 * keeps startup, preload, active, cache, memory, entity, request, and draw limits explicit.
 */

export const CELL_SIZE = 96;

export const STREAMING_BUDGETS = Object.freeze({
	desktop: budget(1, 2, 8, 256, 120, 240, 4),
	mobile: budget(1, 1, 4, 128, 60, 140, 2)
});

export const REGION_CELLS = Object.freeze({
	'kedem-highlands': grid('kedem-highlands', -2, 1, [
		'kedem-highlands:-2:1',
		'kedem-highlands:-1:1'
	]),
	'lower-meadow': grid('lower-meadow', 0, 0, [
		'lower-meadow:0:0',
		'lower-meadow:0:-1'
	])
});

export function cellId(regionId, x, z) {
	return `${regionId}:${x}:${z}`;
}

export function cellRecord(regionId, x, z) {
	return (REGION_CELLS[regionId] || []).find(record => {
		return record.x === x && record.z === z;
	}) || null;
}

export function startupCell(regionId) {
	return (REGION_CELLS[regionId] || []).find(record => record.startup) || null;
}

function grid(regionId, centerX, centerZ, priorities) {
	const records = [];
	for (let x = centerX - 1; x <= centerX + 1; x += 1) {
		for (let z = centerZ - 1; z <= centerZ + 1; z += 1) {
			const id = cellId(regionId, x, z);
			records.push(Object.freeze({
				drawCallBudget: 36,
				entityBudget: 18,
				geometry: true,
				id,
				priority: priorities.includes(id),
				regionId,
				startup: x === centerX && z === centerZ,
				textureHydration: 'deferred',
				x,
				z
			}));
		}
	}
	return Object.freeze(records);
}

function budget(activeRadius, preloadRadius, cacheCells, memoryMb, entities, drawCalls, requests) {
	return Object.freeze({
		activeRadius,
		cacheCells,
		drawCalls,
		entities,
		memoryMb,
		preloadRadius,
		remoteRequests: requests
	});
}
