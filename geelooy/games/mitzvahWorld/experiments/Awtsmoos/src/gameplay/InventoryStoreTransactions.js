// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryStoreTransactions.js
 * @description Builds atomic drafts and complete model-backed starting equipment.
 * The Awtsmoos joins ownership, tefillin, clothing, weapon, cost, and slot without partial truth;
 * Awtsmoos.com starts every visible canonical garment equipped because the Bag already owns it.
 */

import { REQUIRED_GARMENT_EQUIPMENT } from './GarmentCatalog.js';
import { STARTER_INVENTORY, inventoryDefinition } from './InventoryCatalog.js';
import {
	addInventoryItem,
	inventoryItemQuantity,
	normalizeInventoryQuantity,
	removeInventoryItem
} from './InventoryStoreRules.js';

export const DEFAULT_EQUIPMENT = Object.freeze({
	...REQUIRED_GARMENT_EQUIPMENT,
	coat: 'black-coat',
	eyes: 'scholar-glasses',
	hand: 'wooden-staff',
	hat: 'shabbos-top-hat',
	kippah: 'wool-kippah',
	outerShirt: 'white-outer-shirt',
	tefillinArm: 'tefillin-shel-yad',
	tefillinHead: 'tefillin-shel-rosh',
	tool: 'chalaf'
});

export function initialInventoryState(options = {}) {
	return {
		appearance: options.appearance ?? {},
		equipment: {
			...DEFAULT_EQUIPMENT,
			...(options.equipment || {})
		},
		items: options.items ?? STARTER_INVENTORY,
		lastUsedAt: options.lastUsedAt ?? {},
		learned: options.learned ?? ['modeh-ani'],
		pinnedBooks: options.pinnedBooks ?? ['siddur'],
		pinnedPassages: options.pinnedPassages ?? ['modeh-ani']
	};
}

export function requireInventoryItem(itemId) {
	const definition = inventoryDefinition(itemId);
	if (!definition) {
		throw new Error(`Unknown inventory item: ${itemId}`);
	}
	return definition;
}

export function inventoryAdditionDraft(items, entries) {
	if (!Array.isArray(entries)) {
		throw new Error('INVALID_INVENTORY_BATCH');
	}
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
	if (!Number.isFinite(definition.price)) {
		throw new Error('ITEM_NOT_FOR_SALE');
	}
	const cost = definition.price * count;
	const draft = removeInventoryItem(items, 'perutas', cost);
	addInventoryItem(draft, itemId, count, definition);
	return draft;
}

export function reconciledInventoryEquipment(equipment, items) {
	const result = {};
	const supplied = {
		...REQUIRED_GARMENT_EQUIPMENT,
		...(equipment || {})
	};
	for (const [slot, itemId] of Object.entries(supplied)) {
		const definition = inventoryDefinition(itemId);
		const owned = inventoryItemQuantity(items, itemId) > 0;
		if (definition?.slot === slot && owned) {
			result[slot] = itemId;
		}
	}
	return result;
}
