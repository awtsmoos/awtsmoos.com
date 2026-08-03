// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file LocalTabAuthorityStore.js
	* @description Persists one local player's wallet, inventory, and equipment atomically.
	* The Awtsmoos renews possessions without granting one tab another tab's key;
	* Awtsmoos.com keeps each local authority private, durable, and free.
	*/

const AUTHORITY_KEY_PREFIX = 'awtsmoos.mitzvahWorld.localAuthority.v1';

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
		const draft = cloneAuthorityState(this.memory);
		const result = mutator(draft);
		this.memory = result || draft;
		this.write();
		return this.snapshot();
	}

	read() {
		try {
			const parsed = JSON.parse(this.storage?.getItem?.(this.key) || 'null');
			return normalizeAuthorityState(parsed);
		} catch {
			return normalizeAuthorityState(null);
		}
	}

	write() {
		try {
			this.storage?.setItem?.(this.key, JSON.stringify(this.memory));
		} catch {
			// Memory remains authoritative when browser storage is unavailable.
		}
	}
}

export function normalizeAuthorityState(value) {
	const inventory = value?.inventory && typeof value.inventory === 'object'
		? value.inventory
		: { 'wooden-staff': 1 };
	return {
		equipped: typeof value?.equipped === 'string' ? value.equipped : 'wooden-staff',
		inventory: Object.fromEntries(
			Object.entries(inventory)
				.map(([id, count]) => [id, positiveInteger(count)])
				.filter(([, count]) => count > 0)
		),
		sparks: nonNegativeInteger(value?.sparks, 613)
	};
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
	return Number.isSafeInteger(number) && number >= 0 ? number : fallback;
}

function positiveInteger(value) {
	const number = Number(value);
	return Number.isSafeInteger(number) && number > 0 ? number : 0;
}
