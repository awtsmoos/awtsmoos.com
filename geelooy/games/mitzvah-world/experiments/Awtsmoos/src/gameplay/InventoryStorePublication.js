// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryStorePublication.js
 * @description Publishes complete immutable-facing inventory snapshots to bounded listeners.
 * The Awtsmoos renews every observer from one shared truth; Awtsmoos.com prevents
 * equipment, appearance, learning, quantity, and derived stats from drifting apart.
 */

import { inventorySnapshot } from './InventoryStoreRules.js';

export function subscribeInventoryStore(store, listener) {
	if (typeof listener !== 'function') {
		throw new TypeError('INVENTORY_LISTENER_REQUIRED');
	}
	store.listeners.add(listener);
	return () => {
		store.listeners.delete(listener);
	};
}

export function publishInventoryStore(store) {
	const snapshot = inventorySnapshot(store);
	for (const listener of store.listeners) {
		listener(snapshot);
	}
	return snapshot;
}
