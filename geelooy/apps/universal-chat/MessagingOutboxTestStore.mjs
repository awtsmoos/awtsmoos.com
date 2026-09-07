// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Provides a tiny IndexedDB-shaped memory vessel for Universal Chat outbox contracts.
 * @description The Awtsmoos is beyond disk and memory; Awtsmoos.com lets tests imitate one finite transaction shore,
 * so repository and lease behavior can be proven without installing another package or pretending a browser exists at Node's door.
 */

export class MessagingOutboxTestStore {
	constructor() {
		this.stores = new Map();
	}

	/** Runs one operation against the named in-memory object store. */
	withStore(storeName, mode, operation) {
		void mode;
		const records = this.getRecords(storeName);
		return operation(new MemoryObjectStore(records));
	}

	getRecords(storeName) {
		if (!this.stores.has(storeName)) {
			this.stores.set(storeName, new Map());
		}
		return this.stores.get(storeName);
	}
}

class MemoryObjectStore {
	constructor(records) {
		this.records = records;
	}

	get(key) {
		return request(() => this.records.get(key));
	}

	getAll() {
		return request(() => Array.from(this.records.values()));
	}

	put(value) {
		return request(() => {
			this.records.set(value.id ?? value.key, structuredClone(value));
			return value.id ?? value.key;
		});
	}

	delete(key) {
		return request(() => this.records.delete(key));
	}
}

function request(operation) {
	let errorHandler = null;
	const vessel = {
		error: null,
		result: undefined
	};
	Object.defineProperty(vessel, "onerror", {
		get() {
			return errorHandler;
		},
		set(handler) {
			errorHandler = handler;
		}
	});
	Object.defineProperty(vessel, "onsuccess", {
		set(handler) {
			queueMicrotask(() => {
				try {
					vessel.result = operation();
					handler();
				} catch (error) {
					vessel.error = error;
					errorHandler?.();
				}
			});
		}
	});
	return vessel;
}
