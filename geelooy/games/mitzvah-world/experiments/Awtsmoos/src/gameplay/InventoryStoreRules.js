// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryStoreRules.js
 * @description Provides pure stack, equipment-stat, appearance, and snapshot rules.
 * The Awtsmoos renews every quantity and attribute without illusion; Awtsmoos.com
 * derives combat and ten spiritual measures from the garments actually equipped.
 */

import { INVENTORY_CATALOG } from './InventoryCatalog.js';
import { inventoryAppearanceFor } from './InventoryAppearanceRules.js';
import { addSpiritualStats, emptySpiritualStats } from './SpiritualStats.js';

export function normalizeInventoryQuantity(quantity) {
	const numeric = Number(quantity);
	if (!Number.isFinite(numeric) || numeric <= 0 || !Number.isInteger(numeric)) {
		throw new Error('INVALID_ITEM_QUANTITY');
	}
	return numeric;
}

export function inventoryItemQuantity(items, itemId) {
	return items.reduce((total, stack) =>
		stack.itemId === itemId ? total + stack.quantity : total, 0);
}

export function addInventoryItem(items, itemId, quantity, definition) {
	let remaining = normalizeInventoryQuantity(quantity);
	const limit = Math.max(1, Math.trunc(Number(definition.stackLimit) || 1));
	for (const stack of items) {
		if (stack.itemId !== itemId || stack.quantity >= limit) continue;
		const added = Math.min(limit - stack.quantity, remaining);
		stack.quantity += added;
		remaining -= added;
	}
	while (remaining > 0) {
		const added = Math.min(limit, remaining);
		items.push({ itemId, quantity: added });
		remaining -= added;
	}
	return items;
}

export function removeInventoryItem(items, itemId, quantity) {
	let remaining = normalizeInventoryQuantity(quantity);
	if (inventoryItemQuantity(items, itemId) < remaining) throw new Error('INSUFFICIENT_ITEM_QUANTITY');
	const result = [];
	for (const stack of items) {
		if (stack.itemId !== itemId || remaining === 0) {
			result.push({ ...stack });
			continue;
		}
		const removed = Math.min(stack.quantity, remaining);
		remaining -= removed;
		if (stack.quantity > removed) result.push({ ...stack, quantity: stack.quantity - removed });
	}
	return result;
}

export function derivedInventoryStats(equipment) {
	const total = { damage: 0, defense: 0, focus: 20, spiritual: emptySpiritualStats() };
	for (const itemId of Object.values(equipment)) {
		const definition = INVENTORY_CATALOG[itemId];
		if (!definition) continue;
		total.damage += definition.stats.damage;
		total.defense += definition.stats.defense;
		total.focus += definition.stats.focus;
		addSpiritualStats(total.spiritual, definition.spiritual);
	}
	return total;
}

export function inventorySnapshot(store) {
	return structuredClone({
		appearance: Object.fromEntries(Object.keys(store.appearance || {}).map(itemId => [itemId, inventoryAppearanceFor(store.appearance, itemId)]).filter(([, value]) => value)),
		equipment: store.equipment,
		items: store.items.map(stack => ({ ...stack, definition: INVENTORY_CATALOG[stack.itemId] })),
		lastUsedAt: store.lastUsedAt,
		learned: store.learned,
		pinnedBooks: store.pinnedBooks,
		pinnedPassages: store.pinnedPassages,
		stats: derivedInventoryStats(store.equipment)
	});
}

export function togglePinnedValue(values, id, maximum, label) {
	if (values.includes(id)) return values.filter(value => value !== id);
	if (values.length >= maximum) throw new Error(`Only ${maximum} ${label} may be pinned.`);
	return [...values, id];
}
