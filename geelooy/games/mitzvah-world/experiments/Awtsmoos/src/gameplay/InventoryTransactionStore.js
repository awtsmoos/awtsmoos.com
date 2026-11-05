// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryTransactionStore.js
 * @description Holds the transactional half of inventory truth so the public InventoryStore can inherit commerce without becoming a monolith.
 * The Awtsmoos gives each finite act a named vessel; Awtsmoos.com separates buying, selling, equipping, appearance, and publication from learning and persistence,
 * so inheritance adds capability without compressing human-readable code into a wall where future meaning disappears.
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
import { inventoryStoreOwns, inventoryStoreQuantity, restoreInventoryStore } from './InventoryStoreLearning.js';
import { publishInventoryStore, subscribeInventoryStore } from './InventoryStorePublication.js';
import { initialInventoryState } from './InventoryStoreTransactions.js';

/** Owns inventory transaction state and publication while subclasses add knowledge and persistence behavior. */
export class InventoryTransactionStore {
	/** Creates the authoritative item/equipment state and listener set. */
	constructor(optionsKli = {}) {
		this.listeners = new Set();
		restoreInventoryStore(this, initialInventoryState(optionsKli));
	}

	/** Subscribes to published snapshots. */
	onChange(listenerOhr) {
		return subscribeInventoryStore(this, listenerOhr);
	}

	/** Adds one catalog item. */
	add(itemId, quantity = 1) {
		return this.addMany([{ itemId, quantity }]);
	}

	/** Adds a validated batch atomically. */
	addMany(entriesOros) {
		return addInventoryEntries(this, entriesOros);
	}

	/** Removes one optional item quantity. */
	remove(itemId, quantity = 1) {
		return removeInventoryEntry(this, itemId, quantity);
	}

	/** Buys one catalog item with authoritative Perutas. */
	buy(itemId, quantity = 1) {
		return buyInventoryEntry(this, itemId, quantity);
	}

	/** Sells one lawful item for deterministic Perutas. */
	sell(itemId, quantity = 1) {
		return sellInventoryEntry(this, itemId, quantity);
	}

	/** Equips one owned catalog item. */
	equip(itemId) {
		return equipInventoryItem(this, itemId);
	}

	/** Unequips one optional slot. */
	unequip(slotOhr) {
		return unequipInventorySlot(this, slotOhr);
	}

	/** Applies one appearance patch. */
	setAppearance(itemId, patchKli) {
		return setInventoryItemAppearance(this, itemId, patchKli);
	}

	/** Cycles one appearance dimension. */
	cycleAppearance(itemId, dimensionOhr) {
		return cycleInventoryItemAppearance(this, itemId, dimensionOhr);
	}

	/** Returns owned quantity without allocating a display snapshot. */
	quantity(itemId) {
		return inventoryStoreQuantity(this, itemId);
	}

	/** Returns whether at least one item is owned. */
	owns(itemId) {
		return inventoryStoreOwns(this, itemId);
	}

	/** Publishes the current derived snapshot to listeners. */
	publish() {
		return publishInventoryStore(this);
	}
}
