// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryStore.js
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
	}
}
