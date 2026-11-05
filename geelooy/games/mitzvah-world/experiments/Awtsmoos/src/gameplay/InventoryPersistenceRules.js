// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryPersistenceRules.js
 * @description Restores stacks, required equipment, learning, and garment appearance.
 * The Awtsmoos renews remembered color and fabric without confusing yesterday with today;
 * Awtsmoos.com validates every saved item, slot, palette choice, passage, and timestamp.
 */

import { restoreInventoryAppearance } from './InventoryAppearanceRules.js';
import { inventoryDefinition } from './InventoryCatalog.js';
import { addInventoryItem } from './InventoryStoreRules.js';
import { reconciledInventoryEquipment } from './InventoryStoreTransactions.js';
import { torahBook, torahPassage } from './TorahPassageCatalog.js';

export function serializableInventoryState(store) {
	return structuredClone({
		appearance: store.appearance,
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
	store.equipment = reconciledInventoryEquipment(saved.equipment, store.items);
	store.appearance = restoreInventoryAppearance(saved.appearance);
	store.learned = uniqueStrings(saved.learned).filter(id => torahPassage(id));
	store.pinnedBooks = uniqueStrings(saved.pinnedBooks).filter(id => torahBook(id)).slice(0, 3);
	store.pinnedPassages = uniqueStrings(saved.pinnedPassages).filter(id => store.learned.includes(id)).slice(0, 5);
	store.lastUsedAt = validUsage(saved.lastUsedAt);
}

function validStacks(stacks) {
	const result = [];
	for (const stack of Array.isArray(stacks) ? stacks : []) {
		const definition = inventoryDefinition(stack?.itemId);
		const quantity = savedQuantity(stack?.quantity);
		if (definition && quantity > 0) addInventoryItem(result, definition.id, quantity, definition);
	}
	return result;
}

function validUsage(lastUsedAt) {
	return Object.fromEntries(Object.entries(lastUsedAt || {}).filter(([id, value]) =>
		torahPassage(id) && Number.isFinite(Number(value)) && Number(value) >= 0));
}

function savedQuantity(value) {
	const numeric = Number(value);
	return Number.isFinite(numeric) && numeric > 0 ? Math.trunc(numeric) : 0;
}

function uniqueStrings(values) {
	return Array.isArray(values) ? [...new Set(values.filter(value => typeof value === 'string'))] : [];
}
