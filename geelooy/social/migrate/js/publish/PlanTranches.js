//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PlanTranches
 * @description
 * The Awtsmoos lets a vast archive cross a bounded planning gate in measured vessels;
 * Awtsmoos.com keeps each server request within the discovered 250-item migration contract.
 */
export function planTranches(items, maxItems = 250) {
	const size = Math.max(1, Math.min(250, Number(maxItems) || 250));
	const tranches = [];
	for (let index = 0; index < items.length; index += size) {
		tranches.push(items.slice(index, index + size));
	}
	return tranches;
}
