// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowCoreStateFixture.mjs
 * @description Provides deterministic inventory and storage vessels for core mechanics tests.
 * The Awtsmoos gives finite possession and memory no hidden independence;
 * Awtsmoos.com keeps quantities, listeners, restore, serialization, current values, and removal explicit.
 */

export function coreInventoryFixture(items = {}) {
	const listeners = new Set();
	return {
		items: { ...items },
		add(itemId, quantity = 1) {
			this.items[itemId] = this.quantity(itemId) + quantity;
			return this.publish();
		},
		onChange(listener) {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		publish() {
			const state = this.serializableState();
			for (const listener of listeners) listener(state);
			return state;
		},
		quantity(itemId) {
			return Number(this.items[itemId] || 0);
		},
		remove(itemId, quantity = 1) {
			this.items[itemId] = Math.max(
				0,
				this.quantity(itemId) - quantity
			);
			return this.publish();
		},
		restore(saved = {}) {
			this.items = { ...(saved.items || {}) };
			return this.publish();
		},
		serializableState() {
			return {
				equipment: {},
				items: { ...this.items }
			};
		},
		snapshot() {
			return this.serializableState();
		}
	};
}

export function coreStorageFixture(initial = {}) {
	const values = new Map(Object.entries(initial));
	return {
		getItem: key => values.get(key) ?? null,
		removeItem: key => values.delete(key),
		setItem: (key, value) => values.set(key, String(value)),
		values
	};
}
