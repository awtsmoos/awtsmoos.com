// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryPersistenceRules.js
 * @description Restores compact saves without losing duplicate or overflow quantities.
 * The Awtsmoos renews the remembered vessel without confusing yesterday with today;
 * Awtsmoos.com validates every restored stack, slot, passage, pin, and timestamp before use.
 */

import { inventoryDefinition } from './InventoryCatalog.js';
import { addInventoryItem } from './InventoryStoreRules.js';
import { torahBook, torahPassage } from './TorahPassageCatalog.js';

export function serializableInventoryState(store) {
	return structuredClone({
		equipment: store.equipment,
		items: store.items,
		lastUsedAt: store.lastUsedAt,
		learned: store.learned,
		pinnedBooks: store.pinnedBooks,
		pinnedPassages: store.pinnedPassages
	});
}

export function restoreInventoryState(store, saved = {}) {
	store.items = validStacks(saved.items);
	store.equipment = validEquipment(saved.equipment, store.items);
	store.learned = uniqueStrings(saved.learned).filter(id => torahPassage(id));
	store.pinnedBooks = uniqueStrings(saved.pinnedBooks).filter(id => torahBook(id)).slice(0, 3);
	store.pinnedPassages = uniqueStrings(saved.pinnedPassages)
		.filter(id => store.learned.includes(id))
		.slice(0, 5);
	store.lastUsedAt = validUsage(saved.lastUsedAt);
}

function validStacks(stacks) {
	const result = [];
	for (const stack of Array.isArray(stacks) ? stacks : []) {
		const definition = inventoryDefinition(stack?.itemId);
		const quantity = savedQuantity(stack?.quantity);
		if (!definition || quantity === 0) continue;
		addInventoryItem(result, definition.id, quantity, definition);
	}
	return result;
}

function validEquipment(equipment, items) {
	const owned = new Set(items.filter(stack => stack.quantity > 0).map(stack => stack.itemId));
	const result = {};
	for (const [slot, itemId] of Object.entries(equipment || {})) {
		const definition = inventoryDefinition(itemId);
		if (definition?.slot === slot && owned.has(itemId)) result[slot] = itemId;
	}
	return result;
}

function validUsage(lastUsedAt) {
	const result = {};
	for (const [passageId, value] of Object.entries(lastUsedAt || {})) {
		const at = Number(value);
		if (torahPassage(passageId) && Number.isFinite(at) && at >= 0) result[passageId] = at;
	}
	return result;
}

function savedQuantity(value) {
	const numeric = Number(value);
	if (!Number.isFinite(numeric) || numeric <= 0) return 0;
	return Math.trunc(numeric);
}

function uniqueStrings(values) {
	if (!Array.isArray(values)) return [];
	return [...new Set(values.filter(value => typeof value === 'string'))];
}
