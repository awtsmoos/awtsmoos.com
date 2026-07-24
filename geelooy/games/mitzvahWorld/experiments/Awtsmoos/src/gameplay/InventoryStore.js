// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryStore.js
 * @description Coordinates authoritative inventory, equipment, learning, and persistence state.
 * The Awtsmoos is one before every stack and listener; Awtsmoos.com reveals one complete snapshot
 * after each transaction while focused rules prepare the finite changes outside this vessel.
 */

import {
	learnInventoryPassage,
	markInventoryPassageUsed,
	toggleInventoryBook,
	toggleInventoryPassage
} from './InventoryLearningRules.js';
import { restoreInventoryState, serializableInventoryState } from './InventoryPersistenceRules.js';
import { inventoryItemQuantity, inventorySnapshot, removeInventoryItem } from './InventoryStoreRules.js';
import {
	initialInventoryState,
	inventoryAdditionDraft,
	inventoryPurchaseDraft,
	reconciledInventoryEquipment,
	requireInventoryItem
} from './InventoryStoreTransactions.js';

export class InventoryStore {
	constructor(options = {}) {
		this.listeners = new Set();
		restoreInventoryState(this, initialInventoryState(options));
	}

	onChange(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	add(itemId, quantity = 1) {
		return this.addMany([{ itemId, quantity }]);
	}

	addMany(entries) {
		this.items = inventoryAdditionDraft(this.items, entries);
		this.reconcileEquipment();
		return this.publish();
	}

	remove(itemId, quantity = 1) {
		requireInventoryItem(itemId);
		this.items = removeInventoryItem(this.items, itemId, quantity);
		this.reconcileEquipment();
		return this.publish();
	}

	buy(itemId, quantity = 1) {
		this.items = inventoryPurchaseDraft(this.items, itemId, quantity);
		this.reconcileEquipment();
		return this.publish();
	}

	equip(itemId) {
		const definition = requireInventoryItem(itemId);
		if (!this.owns(itemId)) throw new Error('ITEM_NOT_OWNED');
		if (!definition.slot) throw new Error('ITEM_NOT_EQUIPPABLE');
		this.equipment[definition.slot] = itemId;
		return this.publish();
	}

	unequip(slot) {
		delete this.equipment[slot];
		return this.publish();
	}
	learn(passageId) {
		learnInventoryPassage(this, passageId);
		return this.publish();
	}
	togglePassagePin(passageId) {
		toggleInventoryPassage(this, passageId);
		return this.publish();
	}
	toggleBookPin(bookId) {
		toggleInventoryBook(this, bookId);
		return this.publish();
	}
	markPassageUsed(passageId, at = Date.now()) {
		markInventoryPassageUsed(this, passageId, at);
		return this.publish();
	}
	quantity(itemId) {
		return inventoryItemQuantity(this.items, itemId);
	}
	owns(itemId) {
		return this.quantity(itemId) > 0;
	}
	restore(saved) {
		restoreInventoryState(this, saved);
		return this.publish();
	}
	serializableState() {
		return serializableInventoryState(this);
	}
	snapshot() {
		return inventorySnapshot(this);
	}
	reconcileEquipment() {
		this.equipment = reconciledInventoryEquipment(this.equipment, this.items);
	}
	publish() {
		const snapshot = this.snapshot();
		for (const listener of this.listeners) listener(snapshot);
		return snapshot;
	}
}
