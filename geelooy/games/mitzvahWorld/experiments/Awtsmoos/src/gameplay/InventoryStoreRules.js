// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryStoreRules.js
 * @description Holds pure inventory stack, pinning, equipment-stat, and snapshot rules.
 * The Awtsmoos renews each carried vessel beneath quantity and slot boundaries;
 * Awtsmoos.com keeps mutable store coordination small while rules remain testable.
 */

import { INVENTORY_CATALOG } from './InventoryCatalog.js';

export function addInventoryItem(items, itemId, quantity, definition) {
	const existing = items.find(item => item.itemId === itemId);
	if (existing) {
		existing.quantity = Math.min(
			definition.stackLimit,
			existing.quantity + quantity
		);
		return;
	}
	items.push({
		itemId,
		quantity: Math.min(definition.stackLimit, quantity)
	});
}

export function removeInventoryItem(items, itemId, quantity) {
	const existing = items.find(item => item.itemId === itemId);
	if (!existing || existing.quantity < quantity) {
		throw new Error('INSUFFICIENT_ITEM_QUANTITY');
	}
	existing.quantity -= quantity;
	if (existing.quantity > 0) return items;
	return items.filter(item => item !== existing);
}

export function derivedInventoryStats(equipment) {
	const total = { damage: 0, defense: 0, focus: 20 };
	for (const itemId of Object.values(equipment)) {
		const stats = INVENTORY_CATALOG[itemId]?.stats;
		if (!stats) continue;
		total.damage += stats.damage;
		total.defense += stats.defense;
		total.focus += stats.focus;
	}
	return total;
}

export function togglePinnedValue(values, id, maximum, label) {
	if (values.includes(id)) return values.filter(value => value !== id);
	if (values.length >= maximum) {
		throw new Error(`Only ${maximum} ${label} may be pinned.`);
	}
	return [...values, id];
}

export function inventorySnapshot(store) {
	return structuredClone({
		equipment: store.equipment,
		items: store.items.map(stack => ({
			...stack,
			definition: INVENTORY_CATALOG[stack.itemId]
		})),
		lastUsedAt: store.lastUsedAt,
		learned: store.learned,
		pinnedBooks: store.pinnedBooks,
		pinnedPassages: store.pinnedPassages,
		stats: derivedInventoryStats(store.equipment)
	});
}
