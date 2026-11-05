//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldDirectInventoryProjection.js
 * @description Projects staged Blank Meadow inventory truth into the established Bag view shape without owning or mutating gameplay state.
 * The Awtsmoos renews one possession beneath every truthful appearance;
 * Awtsmoos.com lets the Bag reveal canonical quantity and catalog identity while the living store remains singular.
 */

import { INVENTORY_CATALOG } from '../gameplay/InventoryCatalog.js';

const ZERO_STATS = Object.freeze({ damage: 0, defense: 0, focus: 0 });

/**
 * Creates the read-only store facade consumed by InventoryPanel.
 * @param {object} store Canonical bootstrap inventory store.
 * @returns {Readonly<object>} Read-only projection facade.
 */
export function createMitzvahWorldDirectInventoryProjection(store) {
	assertProjectionSource(store);
	const projection = {
		diagnostics() {
			return Object.freeze({ canonicalStoreReused: true });
		},
		onChange(listener) {
			if (typeof listener !== 'function') return () => {};
			return store.onChange(snapshot => listener(projectBootstrapInventorySnapshot(snapshot)));
		},
		snapshot() {
			return projectBootstrapInventorySnapshot(store.snapshot());
		}
	};
	return Object.freeze(projection);
}

/** Converts one canonical bootstrap snapshot into the existing Bag rendering shape. */
export function projectBootstrapInventorySnapshot(source = {}) {
	return {
		appearance: { ...(source.appearance || {}) },
		equipment: { ...(source.equipment || {}) },
		items: Object.entries(source.items || {})
			.filter(([, quantity]) => Number(quantity) > 0)
			.map(([itemId, quantity]) => ({
				definition: directDisplayDefinition(itemId),
				itemId,
				quantity: Number(quantity)
			})),
		lastUsedAt: {},
		learned: [],
		pinnedBooks: [],
		pinnedPassages: [],
		stats: { ...ZERO_STATS }
	};
}

function directDisplayDefinition(itemId) {
	const canonical = INVENTORY_CATALOG[itemId];
	if (canonical) {
		return Object.freeze({
			...canonical,
			actions: Object.freeze([])
		});
	}
	return Object.freeze({
		actions: Object.freeze([]),
		category: 'item',
		description: 'Stored in your Blank Meadow bag.',
		icon: '◇',
		id: itemId,
		name: humanize(itemId),
		price: 0,
		stackLimit: 999,
		stats: ZERO_STATS
	});
}

function humanize(itemId) {
	return String(itemId || 'item')
		.split('-')
		.filter(Boolean)
		.map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
		.join(' ');
}

function assertProjectionSource(store) {
	if (typeof store?.snapshot !== 'function' || typeof store?.onChange !== 'function') {
		throw new Error('Direct inventory projection requires the canonical staged inventory store.');
	}
}
