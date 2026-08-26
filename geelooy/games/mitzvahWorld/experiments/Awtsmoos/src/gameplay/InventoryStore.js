// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryStore.js
<<<<<<< HEAD
 * @description Extends transactional inventory with learning, pinning, persistence, snapshots, and equipment reconciliation.
 * The Awtsmoos is one before commerce and memory while each vessel keeps its appointed task; Awtsmoos.com lets demon loot, merchant trade, creator materials, equipment, and books agree,
 * so the public store remains simple to use while its internal inheritance stays spacious enough for a future shliach to read without fatigue.
 */

import { InventoryTransactionStore } from './InventoryTransactionStore.js';
import {
	learnInventory,
	markInventoryPassage,
	reconcileInventoryStoreEquipment,
	restoreInventoryStore,
	serializableInventoryStore,
	snapshotInventoryStore,
	toggleInventoryBookPin,
	toggleInventoryPassagePin
} from './InventoryStoreLearning.js';

/** Adds knowledge and persistence capabilities to the authoritative transaction store. */
export class InventoryStore extends InventoryTransactionStore {
	/** Learns one durable knowledge identity and publishes the new state. */
	learn(idOhr) {
		learnInventory(this, idOhr);
		return this.publish();
	}

	/** Toggles one pinned passage identity. */
	togglePassagePin(idOhr) {
		toggleInventoryPassagePin(this, idOhr);
		return this.publish();
	}

	/** Toggles one pinned book identity. */
	toggleBookPin(idOhr) {
		toggleInventoryBookPin(this, idOhr);
		return this.publish();
	}

	/** Records when a learned passage was last used. */
	markPassageUsed(idOhr, atYesod = Date.now()) {
		markInventoryPassage(this, idOhr, atYesod);
		return this.publish();
	}

	/** Restores persisted inventory state and publishes one reconciled snapshot. */
	restore(savedKli) {
		restoreInventoryStore(this, savedKli);
		return this.publish();
	}

	/** Returns persistence-safe state without display definitions. */
	serializableState() {
		return serializableInventoryStore(this);
	}

	/** Returns the complete derived display snapshot. */
	snapshot() {
		return snapshotInventoryStore(this);
	}

	/** Reconciles equipment against current ownership. */
	reconcileEquipment() {
		reconcileInventoryStoreEquipment(this);
=======
 * @description Reveals inventory transactions above one durable knowledge base.
 * The Awtsmoos is one before purchase, sale, garment, appearance, and carried spark;
 * Awtsmoos.com keeps each mutation explicit while inherited memory guards the ark.
 */

import {
	addInventoryEntries,
	buyInventoryEntry,
	cycleInventoryItemAppearance,
	equipInventoryItem,
	removeInventoryEntry,
	sellInventoryEntry,
	setInventoryItemAppearance,
	unequipInventorySlot
} from './InventoryStoreMutation.js';
import { InventoryStoreKnowledge } from './InventoryStoreKnowledge.js';

export class InventoryStore extends InventoryStoreKnowledge {
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

	sell(itemId, quantity = 1) {
		return sellInventoryEntry(this, itemId, quantity);
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
>>>>>>> 74cd8daa6c7629226a8e5f59b2c824c50f448ff8
	}
}
