// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryStore.js
 * @description Coordinates inventory transactions, learning, persistence, and publication.
 * The Awtsmoos is one before stack, garment, passage, appearance, and listener;
 * Awtsmoos.com delegates each responsibility without compressed hidden work.
 */

import { addInventoryEntries, buyInventoryEntry, cycleInventoryItemAppearance, equipInventoryItem, removeInventoryEntry, setInventoryItemAppearance, unequipInventorySlot } from './InventoryStoreMutation.js';
import { inventoryStoreOwns, inventoryStoreQuantity, learnInventory, markInventoryPassage, reconcileInventoryStoreEquipment, restoreInventoryStore, serializableInventoryStore, snapshotInventoryStore, toggleInventoryBookPin, toggleInventoryPassagePin } from './InventoryStoreLearning.js';
import { publishInventoryStore, subscribeInventoryStore } from './InventoryStorePublication.js';
import { initialInventoryState } from './InventoryStoreTransactions.js';

export class InventoryStore {
	constructor(options = {}) {
		this.listeners = new Set();
		restoreInventoryStore(this, initialInventoryState(options));
	}

	onChange(listener) {
		return subscribeInventoryStore(this, listener);
	}

	add(itemId, quantity = 1) {
		return this.addMany([{ itemId, quantity }]);
	}

	addMany(entries) {
		return addInventoryEntries(this, entries);
	}

	remove(itemId, quantity = 1) {
		return removeInventoryEntry(this, itemId, quantity);
	}

	buy(itemId, quantity = 1) {
		return buyInventoryEntry(this, itemId, quantity);
	}

	equip(itemId) {
		return equipInventoryItem(this, itemId);
	}

	unequip(slot) {
		return unequipInventorySlot(this, slot);
	}

	setAppearance(itemId, patch) {
		return setInventoryItemAppearance(this, itemId, patch);
	}

	cycleAppearance(itemId, dimension) {
		return cycleInventoryItemAppearance(this, itemId, dimension);
	}

	learn(id) {
		learnInventory(this, id);
		return this.publish();
	}

	togglePassagePin(id) {
		toggleInventoryPassagePin(this, id);
		return this.publish();
	}

	toggleBookPin(id) {
		toggleInventoryBookPin(this, id);
		return this.publish();
	}

	markPassageUsed(id, at = Date.now()) {
		markInventoryPassage(this, id, at);
		return this.publish();
	}

	quantity(itemId) {
		return inventoryStoreQuantity(this, itemId);
	}

	owns(itemId) {
		return inventoryStoreOwns(this, itemId);
	}

	restore(saved) {
		restoreInventoryStore(this, saved);
		return this.publish();
	}

	serializableState() {
		return serializableInventoryStore(this);
	}

	snapshot() {
		return snapshotInventoryStore(this);
	}

	reconcileEquipment() {
		reconcileInventoryStoreEquipment(this);
	}

	publish() {
		return publishInventoryStore(this);
	}
}
