// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryAppearanceRules.js
 * @description Validates, restores, and cycles per-item garment color and fabric choices.
 * The Awtsmoos contains every appearance while remaining one; Awtsmoos.com keeps each
 * selection bounded by the garment definition and durable across save restoration.
 */

import { inventoryDefinition } from './InventoryCatalog.js';

export function inventoryAppearanceFor(appearance, itemId) {
	const definition = inventoryDefinition(itemId);
	const options = definition?.appearance;
	if (!options) return null;
	const saved = appearance?.[itemId] || {};
	return {
		colorId: options.colors.includes(saved.colorId) ? saved.colorId : options.defaultColor,
		fabricId: options.fabrics.includes(saved.fabricId) ? saved.fabricId : options.defaultFabric
	};
}

export function setInventoryAppearance(appearance, itemId, patch) {
	const current = inventoryAppearanceFor(appearance, itemId);
	const definition = inventoryDefinition(itemId);
	if (!current || !definition?.appearance) throw new Error('ITEM_NOT_CUSTOMIZABLE');
	const next = { ...current, ...patch };
	if (!definition.appearance.colors.includes(next.colorId)) throw new Error('INVALID_GARMENT_COLOR');
	if (!definition.appearance.fabrics.includes(next.fabricId)) throw new Error('INVALID_GARMENT_FABRIC');
	return { ...appearance, [itemId]: next };
}

export function cycleInventoryAppearance(appearance, itemId, dimension) {
	const current = inventoryAppearanceFor(appearance, itemId);
	const options = inventoryDefinition(itemId)?.appearance;
	if (!current || !options) throw new Error('ITEM_NOT_CUSTOMIZABLE');
	const key = dimension === 'fabric' ? 'fabricId' : 'colorId';
	const values = dimension === 'fabric' ? options.fabrics : options.colors;
	const nextValue = values[(values.indexOf(current[key]) + 1) % values.length];
	return setInventoryAppearance(appearance, itemId, { [key]: nextValue });
}

export function restoreInventoryAppearance(value) {
	const result = {};
	for (const itemId of Object.keys(value || {})) {
		const normalized = inventoryAppearanceFor(value, itemId);
		if (normalized) result[itemId] = normalized;
	}
	return result;
}
