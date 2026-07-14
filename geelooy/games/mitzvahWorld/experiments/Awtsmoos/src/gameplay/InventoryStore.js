// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryStore.js
 * @description Coordinates stacks, equipment, learning, passage use, and purchases.
 * The Awtsmoos renews possession beneath measured slots and free learning;
 * Awtsmoos.com delegates quantity, pinning, statistics, and snapshots to pure rules.
 */

import { STARTER_INVENTORY, inventoryDefinition } from './InventoryCatalog.js';
import {
	learnInventoryPassage,
	markInventoryPassageUsed,
	toggleInventoryBook,
	toggleInventoryPassage
} from './InventoryLearningRules.js';
import {
	addInventoryItem,
	inventorySnapshot,
	removeInventoryItem
} from './InventoryStoreRules.js';

export class InventoryStore {
	constructor(options = {}) {
		this.items = structuredClone(options.items || STARTER_INVENTORY);
		this.equipment = {
			...(options.equipment || {
				coat: 'black-coat',
				hand: 'wooden-staff',
				tool: 'chalaf'
			})
		};
		this.learned = [...(options.learned || ['modeh-ani'])];
		this.pinnedBooks = [...(options.pinnedBooks || ['siddur'])];
		this.pinnedPassages = [...(options.pinnedPassages || ['modeh-ani'])];
		this.lastUsedAt = {};
		this.listeners = new Set();
	}

	onChange(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	add(itemId, quantity = 1) {
		addInventoryItem(this.items, itemId, quantity, requireItem(itemId));
		return this.publish();
	}

	remove(itemId, quantity = 1) {
		this.items = removeInventoryItem(this.items, itemId, quantity);
		for (const [slot, equippedId] of Object.entries(this.equipment)) {
			if (equippedId === itemId && !this.owns(itemId)) delete this.equipment[slot];
		}
		return this.publish();
	}

	buy(itemId, quantity = 1) {
		const definition = requireItem(itemId);
		if (!Number.isFinite(definition.price)) throw new Error('ITEM_NOT_FOR_SALE');
		this.remove('perutas', definition.price * quantity);
		this.add(itemId, quantity);
		return this.snapshot();
	}

	equip(itemId) {
		const definition = requireItem(itemId);
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

	owns(itemId) {
		return Boolean(this.items.find(item => item.itemId === itemId && item.quantity > 0));
	}

	snapshot() {
		return inventorySnapshot(this);
	}

	publish() {
		const snapshot = this.snapshot();
		for (const listener of this.listeners) listener(snapshot);
		return snapshot;
	}
}

function requireItem(itemId) {
	const definition = inventoryDefinition(itemId);
	if (!definition) throw new Error(`Unknown inventory item: ${itemId}`);
	return definition;
}
