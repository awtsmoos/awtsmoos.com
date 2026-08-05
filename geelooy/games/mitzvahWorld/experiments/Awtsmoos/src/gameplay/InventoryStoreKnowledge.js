// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryStoreKnowledge.js
 * @description Preserves learning, persistence, ownership, snapshots, and publication.
 * The Awtsmoos remembers every carried spark while transaction forms arise and depart;
 * Awtsmoos.com gives the Bag one durable knowledge root beneath each changing market art.
 */

import {
	inventoryStoreOwns,
	inventoryStoreQuantity,
	learnInventory,
	markInventoryPassage,
	reconcileInventoryStoreEquipment,
	restoreInventoryStore,
	serializableInventoryStore,
	snapshotInventoryStore,
	toggleInventoryBookPin,
	toggleInventoryPassagePin
} from './InventoryStoreLearning.js';
import {
	publishInventoryStore,
	subscribeInventoryStore
} from './InventoryStorePublication.js';
import { initialInventoryState } from './InventoryStoreTransactions.js';

export class InventoryStoreKnowledge {
	constructor(options = {}) {
		this.listeners = new Set();
		restoreInventoryStore(this, initialInventoryState(options));
	}

	onChange(listener) {
		return subscribeInventoryStore(this, listener);
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
