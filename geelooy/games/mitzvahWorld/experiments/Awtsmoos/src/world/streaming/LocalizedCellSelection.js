// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalizedCellSelection.js
 * @description Selects only known active, preloaded, and quest-critical cells around a traveler.
 * The Awtsmoos renews the near without denying the whole; Awtsmoos.com prevents phantom IDs
 * while startup and quest landmarks remain available before decorative distant enrichment.
 */

import {
	CELL_SIZE,
	REGION_CELLS,
	startupCell
} from './LocalizedCellCatalog.js';

export function selectLocalizedCells(regionId, position, budget) {
	const centerX = Math.floor(Number(position.x || 0) / CELL_SIZE);
	const centerZ = Math.floor(Number(position.z || 0) / CELL_SIZE);
	const active = [];
	const preloaded = [];
	for (const record of REGION_CELLS[regionId] || []) {
		const distance = Math.max(
			Math.abs(record.x - centerX),
			Math.abs(record.z - centerZ)
		);
		if (distance <= budget.activeRadius) active.push(record.id);
		else if (distance <= budget.preloadRadius || record.priority) {
			preloaded.push(record.id);
		}
	}
	const startup = startupCell(regionId)?.id;
	if (startup && !active.includes(startup) && !preloaded.includes(startup)) {
		preloaded.unshift(startup);
	}
	return Object.freeze({
		active: Object.freeze(active.sort()),
		center: Object.freeze({ x: centerX, z: centerZ }),
		preloaded: Object.freeze(preloaded.sort())
	});
}
