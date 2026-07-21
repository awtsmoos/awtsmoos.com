// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryPersistenceRules.js
 * @description Serializes and validates the compact mutable inventory state used by saves.
 */

import { inventoryDefinition } from './InventoryCatalog.js';
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
	store.learned = unique(saved.learned).filter(id => torahPassage(id));
	store.pinnedBooks = unique(saved.pinnedBooks).filter(id => torahBook(id)).slice(0, 3);
	store.pinnedPassages = unique(saved.pinnedPassages)
		.filter(id => store.learned.includes(id))
		.slice(0, 5);
	store.lastUsedAt = validUsage(saved.lastUsedAt);
}

function validStacks(stacks) {
	const quantities = new Map();
	for (const stack of stacks || []) {
		const definition = inventoryDefinition(stack?.itemId);
		if (!definition) continue;
		const quantity = Math.max(0, Math.trunc(Number(stack.quantity) || 0));
		if (!quantity) continue;
		quantities.set(stack.itemId, Math.min(definition.stackLimit, quantity));
	}
	return [...quantities].map(([itemId, quantity]) => ({ itemId, quantity }));
}

function validEquipment(equipment, items) {
	const owned = new Set(items.map(item => item.itemId));
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

function unique(values) {
	return [...new Set(Array.isArray(values) ? values : [])];
}
