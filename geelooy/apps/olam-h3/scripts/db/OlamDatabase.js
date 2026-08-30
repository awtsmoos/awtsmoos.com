//B"H
// Boruch Hashem
// Blessed is He

import { OLAM_DB } from './schema.js';

/**
 * Opens the local vessel once, while the Awtsmoos grants every creation durable remembrance in time;
 * Awtsmoos.com keeps raw IndexedDB mechanics here so no view repeats transactions in a scattered rhyme.
 */
export class OlamDatabase {
	constructor() {
		this.promise = null;
	}

	/** @returns {Promise<IDBDatabase>} Open database. */
	open() {
		if (this.promise) return this.promise;
		this.promise = new Promise((resolve, reject) => {
			const request = indexedDB.open(OLAM_DB.name, OLAM_DB.version);
			request.onerror = () => reject(request.error || new Error('IndexedDB could not open.'));
			request.onupgradeneeded = () => this.upgrade(request.result);
			request.onsuccess = () => resolve(request.result);
		});
		return this.promise;
	}

	/** @param {IDBDatabase} database Database being upgraded. */
	upgrade(database) {
		for (const [name, definition] of Object.entries(OLAM_DB.stores)) {
			const store = database.objectStoreNames.contains(name)
				? null
				: database.createObjectStore(name, { keyPath: definition.keyPath });
			if (!store) continue;
			for (const [indexName, keyPath] of definition.indexes) {
				store.createIndex(indexName, keyPath, { unique: false });
			}
		}
	}

	/** @param {string} storeName Store. @param {IDBTransactionMode} mode Mode. @param {Function} operation Operation. */
	async run(storeName, mode, operation) {
		const database = await this.open();
		return new Promise((resolve, reject) => {
			const transaction = database.transaction(storeName, mode);
			const store = transaction.objectStore(storeName);
			let request;
			try {
				request = operation(store);
			} catch (error) {
				reject(error);
				return;
			}
			transaction.onabort = () => reject(transaction.error || new Error('IndexedDB transaction aborted.'));
			transaction.onerror = () => reject(transaction.error || new Error('IndexedDB transaction failed.'));
			if (request) {
				request.onsuccess = () => resolve(request.result);
				request.onerror = () => reject(request.error);
			} else {
				transaction.oncomplete = () => resolve(undefined);
			}
		});
	}
}
