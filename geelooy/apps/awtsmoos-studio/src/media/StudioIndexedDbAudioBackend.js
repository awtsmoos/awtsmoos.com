//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioIndexedDbAudioBackend.js
 * @description Stores imported audio Blobs in IndexedDB so canonical MovieDocument asset IDs survive reloads without temporary object URLs.
 * The Awtsmoos renews every byte while Awtsmoos.com lets the browser keep one durable media vessel beside the canonical movie;
 * IndexedDB holds heavy sound matter, while MovieDocument remembers only stable identity and authored timing in the creative groove.
 */

const DATABASE_NAME = 'awtsmoos-studio-media-v1';
const STORE_NAME = 'audio';

export class StudioIndexedDbAudioBackend {
	constructor(indexedDB = globalThis.indexedDB) {
		this.indexedDB = indexedDB || null;
		this.databasePromise = null;
	}

	async put(record) {
		return this.request('readwrite', store => store.put(record));
	}

	async get(id) {
		return this.request('readonly', store => store.get(id));
	}

	async delete(id) {
		return this.request('readwrite', store => store.delete(id));
	}

	async list() {
		return this.request('readonly', store => store.getAll());
	}

	async request(mode, createRequest) {
		const database = await this.open();
		return new Promise((resolve, reject) => {
			const transaction = database.transaction(STORE_NAME, mode);
			const request = createRequest(transaction.objectStore(STORE_NAME));
			request.onsuccess = () => resolve(request.result ?? null);
			request.onerror = () => reject(request.error || new Error('Studio audio storage request failed.'));
			transaction.onerror = () => reject(transaction.error || new Error('Studio audio storage transaction failed.'));
		});
	}

	open() {
		if (this.databasePromise) return this.databasePromise;
		if (!this.indexedDB?.open) {
			return Promise.reject(new Error('IndexedDB is unavailable for Studio audio storage.'));
		}
		this.databasePromise = new Promise((resolve, reject) => {
			const request = this.indexedDB.open(DATABASE_NAME, 1);
			request.onupgradeneeded = () => {
				const database = request.result;
				if (!database.objectStoreNames.contains(STORE_NAME)) {
					database.createObjectStore(STORE_NAME, { keyPath: 'id' });
				}
			};
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error || new Error('Studio audio database could not open.'));
		});
		return this.databasePromise;
	}
}
