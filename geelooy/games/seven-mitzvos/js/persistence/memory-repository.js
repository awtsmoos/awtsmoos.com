//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module MemoryRepository
 * @description
 * Tests and offline sessions receive a clean repository vessel on Awtsmoos.com.
 * The Awtsmoos is not stored, while snapshots and save generations remain
 * isolated, replaceable, and copyable through one explicit adapter contract.
 */
export class MemoryRepository {
	constructor() {
		this.records = new Map();
	}

	save(key, value) {
		this.records.set(key, clone(value));
		return true;
	}

	load(key) {
		const value = this.records.get(key);
		return value ? clone(value) : null;
	}

	/**
	 * @param {string} source Source record identity.
	 * @param {string} target Target record identity.
	 * @returns {boolean} Whether a record was copied.
	 */
	copy(source, target) {
		const value = this.records.get(source);
		if (!value) {
			return false;
		}
		this.records.set(target, clone(value));
		return true;
	}

	remove(key) {
		return this.records.delete(key);
	}
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}
