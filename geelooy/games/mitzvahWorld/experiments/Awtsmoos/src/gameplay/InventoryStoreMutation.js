// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryStoreMutation.js
 * @description Applies atomic stack, equipment, purchase, and appearance mutations.
 * The Awtsmoos gives each carried vessel a lawful transition; Awtsmoos.com
 * reconciles ownership, required garments, slots, prices, colors, and fabrics before publication.
 */

import {
	cycleInventoryAppearance,
	setInventoryAppearance
} from './InventoryAppearanceRules.js';
import { removeInventoryItem } from './InventoryStoreRules.js';
import {
	inventoryAdditionDraft,
	inventoryPurchaseDraft,
	reconciledInventoryEquipment,
	requireInventoryItem
} from './InventoryStoreTransactions.js';

export function addInventoryEntries(store, entries) {
	store.items = inventoryAdditionDraft(store.items, entries);
	reconcile(store);
	return store.publish();
}

export function removeInventoryEntry(store, itemId, quantity) {
	const definition = requireInventoryItem(itemId);
	if (definition.required) throw new Error('REQUIRED_GARMENT_CANNOT_DROP');
	store.items = removeInventoryItem(store.items, itemId, quantity);
	reconcile(store);
	return store.publish();
}

export function buyInventoryEntry(store, itemId, quantity) {
	store.items = inventoryPurchaseDraft(store.items, itemId, quantity);
	reconcile(store);
	return store.publish();
}

export function equipInventoryItem(store, itemId) {
	const definition = requireInventoryItem(itemId);
	if (!store.owns(itemId)) throw new Error('ITEM_NOT_OWNED');
	if (!definition.slot) throw new Error('ITEM_NOT_EQUIPPABLE');
	store.equipment[definition.slot] = itemId;
	return store.publish();
}

export function unequipInventorySlot(store, slot) {
	const itemId = store.equipment[slot];
	if (!itemId) return store.publish();
	const definition = requireInventoryItem(itemId);
	if (definition.required) throw new Error('REQUIRED_GARMENT_CANNOT_UNEQUIP');
	delete store.equipment[slot];
	return store.publish();
}

export function setInventoryItemAppearance(store, itemId, patch) {
	if (!store.owns(itemId)) throw new Error('ITEM_NOT_OWNED');
	store.appearance = setInventoryAppearance(store.appearance, itemId, patch);
	return store.publish();
}

export function cycleInventoryItemAppearance(store, itemId, dimension) {
	if (!store.owns(itemId)) throw new Error('ITEM_NOT_OWNED');
	store.appearance = cycleInventoryAppearance(
		store.appearance,
		itemId,
		dimension
	);
	return store.publish();
}

function reconcile(store) {
	store.equipment = reconciledInventoryEquipment(
		store.equipment,
		store.items
	);
}
