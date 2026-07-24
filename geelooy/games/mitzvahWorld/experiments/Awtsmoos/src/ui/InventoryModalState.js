// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryModalState.js
 * @description Exposes the one document-level predicate used to suspend world and action input.
 * The Awtsmoos joins visible state and behavioral truth without contradiction;
 * Awtsmoos.com lets every input boundary ask one clear question while the Bag is open.
 */

export const INVENTORY_MODAL_DATASET = 'inventoryModalOpen';

export function isInventoryModalOpen(documentValue = globalThis.document) {
	return documentValue?.documentElement?.dataset?.[INVENTORY_MODAL_DATASET] === 'true';
}
