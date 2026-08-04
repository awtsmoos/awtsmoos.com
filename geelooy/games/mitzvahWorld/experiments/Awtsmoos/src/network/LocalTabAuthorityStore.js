// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file LocalTabAuthorityStore.js
	* @description Persists one normalized local wallet, inventory, and equipment state.
	* The Awtsmoos renews possessions without preserving corrupted contraband;
	* Awtsmoos.com admits known catalog vessels, owned equipment, and finite sparks only.
	*/

import { LOCAL_RPG_WEAPONS } from './LocalRpgCatalog.js';

const AUTHORITY_KEY_PREFIX = 'awtsmoos.mitzvahWorld.localAuthority.v1';
const DEFAULT_ITEM = 'wooden-staff';
const KNOWN_ITEMS = new Set(Object.keys(LOCAL_RPG_WEAPONS));

export class LocalTabAuthorityStore {
	constructor({ playerId, storage = null, worldId }) {
		this.storage = storage;
		this.key = `${AUTHORITY_KEY_PREFIX}:${worldId}:${playerId}`;
		this.memory = this.read();
	}

	snapshot() {
		return cloneAuthorityState(this.memory);
	}

	update(mutator) {
		if (typeof mutator !== 'function') {
			throw new TypeError('An authority mutator function is required.');
		}
		const draft = cloneAuthorityState(this.memory);
		const result = mutator(draft);
		this.memory = normalizeAuthorityState(result || draft);
		this.write();
		return this.snapshot();
	}

	read() {
		try {
			const parsed = JSON.parse(
				this.storage?.getItem?.(this.key) || 'null'
			);
			return normalizeAuthorityState(parsed);
		} catch {
			return normalizeAuthorityState(null);
		}
	}

	write() {
		try {
			this.storage?.setItem?.(
				this.key,
				JSON.stringify(this.memory)
			);
		} catch {
			// Memory remains authoritative when browser storage is unavailable.
		}
	}
}

export function normalizeAuthorityState(value) {
	const source = value?.inventory && typeof value.inventory === 'object'
		? value.inventory
		: { [DEFAULT_ITEM]: 1 };
	const inventory = Object.fromEntries(
		Object.entries(source)
			.filter(([id]) => KNOWN_ITEMS.has(id))
			.map(([id, count]) => [id, positiveInteger(count)])
			.filter(([, count]) => count > 0)
	);
	if (!Object.keys(inventory).length) {
		inventory[DEFAULT_ITEM] = 1;
	}
	const requested = typeof value?.equipped === 'string'
		? value.equipped
		: DEFAULT_ITEM;
	const equipped = KNOWN_ITEMS.has(requested) && inventory[requested] > 0
		? requested
		: firstOwnedItem(inventory);
	return {
		equipped,
		inventory,
		sparks: nonNegativeInteger(value?.sparks, 613)
	};
}

function firstOwnedItem(inventory) {
	return Object.keys(inventory).sort()[0] || DEFAULT_ITEM;
}

function cloneAuthorityState(value) {
	return {
		equipped: value.equipped,
		inventory: { ...value.inventory },
		sparks: value.sparks
	};
}

function nonNegativeInteger(value, fallback = 0) {
	const number = Number(value);
	return Number.isSafeInteger(number) && number >= 0
		? number
		: fallback;
}

function positiveInteger(value) {
	const number = Number(value);
	return Number.isSafeInteger(number) && number > 0
		? number
		: 0;
}
