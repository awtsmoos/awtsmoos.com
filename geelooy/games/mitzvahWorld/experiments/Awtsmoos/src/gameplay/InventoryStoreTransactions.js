// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryStoreTransactions.js
 * @description Builds validated atomic inventory drafts and canonical initial state.
 * The Awtsmoos joins cost and purchase, corpse and batch, ownership and slot without partial truth;
 * Awtsmoos.com lets the store publish only after each finite transaction is fully prepared.
 */

import { STARTER_INVENTORY, inventoryDefinition } from './InventoryCatalog.js';
import {
	addInventoryItem,
	inventoryItemQuantity,
	normalizeInventoryQuantity,
	removeInventoryItem
} from './InventoryStoreRules.js';

const DEFAULT_EQUIPMENT = Object.freeze({
	coat: 'black-coat',
	hand: 'wooden-staff',
	tool: 'chalaf'
});

export function initialInventoryState(options = {}) {
	return {
		equipment: options.equipment ?? DEFAULT_EQUIPMENT,
		items: options.items ?? STARTER_INVENTORY,
		lastUsedAt: options.lastUsedAt ?? {},
		learned: options.learned ?? ['modeh-ani'],
		pinnedBooks: options.pinnedBooks ?? ['siddur'],
		pinnedPassages: options.pinnedPassages ?? ['modeh-ani']
	};
}

export function requireInventoryItem(itemId) {
	const definition = inventoryDefinition(itemId);
	if (!definition) throw new Error(`Unknown inventory item: ${itemId}`);
	return definition;
}

export function inventoryAdditionDraft(items, entries) {
	if (!Array.isArray(entries)) throw new Error('INVALID_INVENTORY_BATCH');
	const draft = structuredClone(items);
	for (const entry of entries) {
		const definition = requireInventoryItem(entry?.itemId);
		addInventoryItem(draft, definition.id, entry.quantity, definition);
	}
	return draft;
}

export function inventoryPurchaseDraft(items, itemId, quantity) {
	const definition = requireInventoryItem(itemId);
	const count = normalizeInventoryQuantity(quantity);
	if (!Number.isFinite(definition.price)) throw new Error('ITEM_NOT_FOR_SALE');
	const cost = definition.price * count;
	const draft = cost > 0
		? removeInventoryItem(items, 'perutas', cost)
		: structuredClone(items);
	addInventoryItem(draft, itemId, count, definition);
	return draft;
}

export function reconciledInventoryEquipment(equipment, items) {
	const result = {};
	for (const [slot, itemId] of Object.entries(equipment || {})) {
		const definition = inventoryDefinition(itemId);
		if (definition?.slot !== slot) continue;
		if (inventoryItemQuantity(items, itemId) > 0) result[slot] = itemId;
	}
	return result;
}
