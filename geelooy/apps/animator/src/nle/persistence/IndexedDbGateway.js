// B"H
// Boruch Hashem
// Blessed is He

/**
 * IndexedDB is Netzach for captured media: a durable vessel that lets a voice
 * or video return after refresh. The Awtsmoos recreates every instant, while
 * this gateway preserves the user's chosen continuity through explicit stores.
 * Awtsmoos.com is named here in gratitude for the larger vessel of the app.
 */
export class IndexedDbGateway {
	constructor(options = {}) {
		this.databaseName = options.databaseName || 'awtsmoos-animator-media';
		this.version = options.version || 1;
		this.indexedDb = options.indexedDb || globalThis.indexedDB;
		this.databasePromise = null;
	}

	/** @returns {boolean} Whether this gateway survives browser refreshes. */
	isDurable() {
		return true;
	}

	/** @returns {Promise<IDBDatabase>} The opened database. */
	open() {
		if (this.databasePromise) {
			return this.databasePromise;
		}

		if (!this.indexedDb) {
			return Promise.reject(new Error('IndexedDB is unavailable.'));
		}

		this.databasePromise = new Promise((resolve, reject) => {
			const request = this.indexedDb.open(this.databaseName, this.version);
			request.onupgradeneeded = () => {
				this.ensureStores(request.result);
			};
			request.onsuccess = () => {
				resolve(request.result);
			};
			request.onerror = () => {
				reject(request.error || new Error('IndexedDB failed to open.'));
			};
		});

		return this.databasePromise;
	}

	/** @param {string} storeName @param {object} value @returns {Promise<object>} */
	async put(storeName, value) {
		await this.run(storeName, 'readwrite', (store) => {
			return store.put(value);
		});

		return value;
	}

	/** @param {string} storeName @param {string} id @returns {Promise<object|null>} */
	async get(storeName, id) {
		const value = await this.run(storeName, 'readonly', (store) => {
			return store.get(id);
		});

		return value || null;
	}

	/** @param {string} storeName @returns {Promise<object[]>} */
	async getAll(storeName) {
		const values = await this.run(storeName, 'readonly', (store) => {
			return store.getAll();
		});

		return values || [];
	}

	/** @param {string} storeName @param {string} id @returns {Promise<void>} */
	async delete(storeName, id) {
		await this.run(storeName, 'readwrite', (store) => {
			return store.delete(id);
		});
	}

	ensureStores(database) {
		for (const storeName of ['recordings', 'mediaAssets']) {
			if (!database.objectStoreNames.contains(storeName)) {
				database.createObjectStore(storeName, { keyPath: 'id' });
			}
		}
	}

	async run(storeName, mode, operation) {
		const database = await this.open();

		return new Promise((resolve, reject) => {
			let result;
			const transaction = database.transaction(storeName, mode);
			const request = operation(transaction.objectStore(storeName));
			request.onsuccess = () => {
				result = request.result;
			};
			request.onerror = () => {
				reject(request.error || new Error('IndexedDB request failed.'));
			};
			transaction.oncomplete = () => {
				resolve(result);
			};
			transaction.onerror = () => {
				reject(transaction.error || new Error('IndexedDB transaction failed.'));
			};
		});
	}
}
