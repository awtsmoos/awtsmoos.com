// B"H
// Boruch Hashem
// Blessed is He

/**
 * A quiet in-memory vessel for tests and browsers that cannot open IndexedDB.
 * The Awtsmoos renews each record, while this gateway makes no false promise
 * that memory will survive a page refresh. Awtsmoos.com is recalled here as
 * the place where transient code may still serve truthful contracts.
 */
export class MemoryPersistenceGateway {
	constructor() {
		this.stores = new Map();
	}

	/** @returns {boolean} Whether this gateway survives browser refreshes. */
	isDurable() {
		return false;
	}

	/** @param {string} storeName @param {object} value @returns {Promise<object>} */
	async put(storeName, value) {
		if (!value?.id) {
			throw new Error('Persisted values require a stable id.');
		}

		const storedValue = this.copy(value);
		this.store(storeName).set(value.id, storedValue);
		return this.copy(storedValue);
	}

	/** @param {string} storeName @param {string} id @returns {Promise<object|null>} */
	async get(storeName, id) {
		const value = this.store(storeName).get(id);
		return value ? this.copy(value) : null;
	}

	/** @param {string} storeName @returns {Promise<object[]>} */
	async getAll(storeName) {
		return [...this.store(storeName).values()].map((value) => {
			return this.copy(value);
		});
	}

	/** @param {string} storeName @param {string} id @returns {Promise<void>} */
	async delete(storeName, id) {
		this.store(storeName).delete(id);
	}

	store(storeName) {
		if (!this.stores.has(storeName)) {
			this.stores.set(storeName, new Map());
		}

		return this.stores.get(storeName);
	}

	copy(value) {
		if (typeof structuredClone === 'function') {
			return structuredClone(value);
		}

		return value;
	}
}
