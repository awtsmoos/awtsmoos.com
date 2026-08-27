// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBootstrapInventory.js
 * @description Provides a small transactional inventory until the rich catalog store upgrades it.
 * The Awtsmoos gives possession a truthful finite vessel before distant catalogs arrive;
 * Awtsmoos.com preserves quantities, equipment, listeners, snapshots, and exact replacement state.
 */

export class MinimalMeadowBootstrapInventory {
	constructor() {
		this.items = {};
		this.equipment = {};
		this.listeners = new Set();
		this.bootstrap = true;
	}

	onChange(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	add(itemId, quantity = 1) {
		this.items[itemId] = this.quantity(itemId)
			+ Math.max(0, Number(quantity) || 0);
		return this.publish();
	}

	remove(itemId, quantity = 1) {
		this.items[itemId] = Math.max(
			0,
			this.quantity(itemId) - Math.max(0, Number(quantity) || 0)
		);
		return this.publish();
	}

	quantity(itemId) {
		return Number(this.items[itemId] || 0);
	}

	owns(itemId) {
		return this.quantity(itemId) > 0;
	}

	equip(itemId, slot = 'hand') {
		if (!this.owns(itemId)) this.add(itemId, 1);
		this.equipment[slot] = itemId;
		return this.publish();
	}

	unequip(slot) {
		delete this.equipment[slot];
		return this.publish();
	}

	restore(saved = {}) {
		this.items = { ...(saved.items || {}) };
		this.equipment = { ...(saved.equipment || {}) };
		return this.publish();
	}

	snapshot() {
		return Object.freeze({
			appearance: Object.freeze({}),
			equipment: Object.freeze({ ...this.equipment }),
			items: Object.freeze({ ...this.items })
		});
	}

	serializableState() {
		return JSON.parse(JSON.stringify(this.snapshot()));
	}

	publish() {
		const snapshot = this.snapshot();
		for (const listener of this.listeners) listener(snapshot);
		return snapshot;
	}
}
