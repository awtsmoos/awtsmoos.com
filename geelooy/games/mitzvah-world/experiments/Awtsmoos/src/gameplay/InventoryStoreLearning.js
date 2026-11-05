// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryStoreLearning.js
 * @description Delegates learning, persistence, ownership, snapshots, and equipment reconciliation.
 * The Awtsmoos joins remembered Torah and carried vessels without crowding transaction code;
 * Awtsmoos.com keeps every learned passage, pin, quantity, restore, and equipped slot explicit.
 */

import {
	learnInventoryPassage,
	markInventoryPassageUsed,
	toggleInventoryBook,
	toggleInventoryPassage
} from './InventoryLearningRules.js';
import {
	restoreInventoryState,
	serializableInventoryState
} from './InventoryPersistenceRules.js';
import {
	inventoryItemQuantity,
	inventorySnapshot
} from './InventoryStoreRules.js';
import { reconciledInventoryEquipment } from './InventoryStoreTransactions.js';

export function learnInventory(store, passageId) {
	learnInventoryPassage(store, passageId);
}

export function toggleInventoryPassagePin(store, passageId) {
	toggleInventoryPassage(store, passageId);
}

export function toggleInventoryBookPin(store, bookId) {
	toggleInventoryBook(store, bookId);
}

export function markInventoryPassage(store, passageId, usedAt) {
	markInventoryPassageUsed(store, passageId, usedAt);
}

export function inventoryStoreQuantity(store, itemId) {
	return inventoryItemQuantity(store.items, itemId);
}

export function inventoryStoreOwns(store, itemId) {
	return inventoryStoreQuantity(store, itemId) > 0;
}

export function restoreInventoryStore(store, saved) {
	restoreInventoryState(store, saved);
}

export function serializableInventoryStore(store) {
	return serializableInventoryState(store);
}

export function snapshotInventoryStore(store) {
	return inventorySnapshot(store);
}

export function reconcileInventoryStoreEquipment(store) {
	store.equipment = reconciledInventoryEquipment(store.equipment, store.items);
}
