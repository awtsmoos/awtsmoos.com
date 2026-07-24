// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryStore.js
 * @description Coordinates authoritative inventory, equipment, appearance, and learning state.
 * The Awtsmoos is one before stack, garment, hue, fabric, and listener; Awtsmoos.com
 * publishes one complete snapshot after every lawful transaction.
 */

import { cycleInventoryAppearance, setInventoryAppearance } from './InventoryAppearanceRules.js';
import { learnInventoryPassage, markInventoryPassageUsed, toggleInventoryBook, toggleInventoryPassage } from './InventoryLearningRules.js';
import { restoreInventoryState, serializableInventoryState } from './InventoryPersistenceRules.js';
import { inventoryItemQuantity, inventorySnapshot, removeInventoryItem } from './InventoryStoreRules.js';
import { initialInventoryState, inventoryAdditionDraft, inventoryPurchaseDraft, reconciledInventoryEquipment, requireInventoryItem } from './InventoryStoreTransactions.js';

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
		const definition = requireInventoryItem(itemId);
		if (definition.required) throw new Error('REQUIRED_GARMENT_CANNOT_DROP');
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
		const definition = requireInventoryItem(this.equipment[slot]);
		if (definition.required) throw new Error('REQUIRED_GARMENT_CANNOT_UNEQUIP');
		delete this.equipment[slot];
		return this.publish();
	}

	setAppearance(itemId, patch) {
		if (!this.owns(itemId)) throw new Error('ITEM_NOT_OWNED');
		this.appearance = setInventoryAppearance(this.appearance, itemId, patch);
		return this.publish();
	}

	cycleAppearance(itemId, dimension) {
		if (!this.owns(itemId)) throw new Error('ITEM_NOT_OWNED');
		this.appearance = cycleInventoryAppearance(this.appearance, itemId, dimension);
		return this.publish();
	}

	learn(id) { learnInventoryPassage(this, id); return this.publish(); }
	togglePassagePin(id) { toggleInventoryPassage(this, id); return this.publish(); }
	toggleBookPin(id) { toggleInventoryBook(this, id); return this.publish(); }
	markPassageUsed(id, at = Date.now()) { markInventoryPassageUsed(this, id, at); return this.publish(); }
	quantity(itemId) { return inventoryItemQuantity(this.items, itemId); }
	owns(itemId) { return this.quantity(itemId) > 0; }
	restore(saved) { restoreInventoryState(this, saved); return this.publish(); }
	serializableState() { return serializableInventoryState(this); }
	snapshot() { return inventorySnapshot(this); }
	reconcileEquipment() { this.equipment = reconciledInventoryEquipment(this.equipment, this.items); }
	publish() { const snapshot = this.snapshot(); for (const listener of this.listeners) listener(snapshot); return snapshot; }
}
