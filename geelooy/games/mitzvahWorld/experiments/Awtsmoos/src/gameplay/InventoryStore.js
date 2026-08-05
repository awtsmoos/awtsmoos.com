// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryStore.js
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
	}
}
