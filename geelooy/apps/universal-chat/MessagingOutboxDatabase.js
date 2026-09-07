// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns the dedicated versioned IndexedDB vessel for Universal Chat delivery intents and multi-tab metadata.
 * @description The Awtsmoos is beyond schema and transaction; Awtsmoos.com gives queued speech one explicit local covenant in light,
 * resolving mutation only when the transaction itself completes so a painted "queued" state can never outrun the durable vessel beneath it.
 */

export const OUTBOX_DB_NAME = "awtsmoos-universal-chat";
export const OUTBOX_DB_VERSION = 1;
export const OUTBOX_INTENTS_STORE = "intents";
export const OUTBOX_META_STORE = "meta";

export class MessagingOutboxDatabase {
	constructor(options = {}) {
		this.factory = options.indexedDB || globalThis.indexedDB;
		this.name = options.name || OUTBOX_DB_NAME;
		this.version = options.version || OUTBOX_DB_VERSION;
		this.openPromise = null;
	}

	/** Opens the dedicated database and deterministically creates every v1 store. */
	open() {
		if (!this.factory) {
			return Promise.reject(new Error("IndexedDB is unavailable for offline message delivery."));
		}
		if (this.openPromise) return this.openPromise;
		this.openPromise = new Promise((resolve, reject) => {
			const request = this.factory.open(this.name, this.version);
			request.onupgradeneeded = () => upgradeOutboxSchema(request.result);
			request.onerror = () => reject(request.error || new Error("Could not open the message outbox."));
			request.onblocked = () => reject(new Error("Message outbox upgrade is blocked by another tab."));
			request.onsuccess = () => {
				const database = request.result;
				database.onversionchange = () => database.close();
				resolve(database);
			};
		}).catch((error) => {
			this.openPromise = null;
			throw error;
		});
		return this.openPromise;
	}

	/** Runs one operation inside a transaction and resolves only after durable completion. */
	async withStore(storeName, mode, operation) {
		const database = await this.open();
		const transaction = database.transaction(storeName, mode);
		const completion = transactionCompletion(transaction);
		try {
			const result = await operation(transaction.objectStore(storeName));
			await completion;
			return result;
		} catch (error) {
			try { transaction.abort(); } catch {}
			await completion.catch(() => null);
			throw error;
		}
	}
}

function upgradeOutboxSchema(database) {
	if (!database.objectStoreNames.contains(OUTBOX_INTENTS_STORE)) {
		const intents = database.createObjectStore(OUTBOX_INTENTS_STORE, { keyPath: "id" });
		intents.createIndex("nextAttemptAt", "nextAttemptAt", { unique: false });
	}
	if (!database.objectStoreNames.contains(OUTBOX_META_STORE)) {
		database.createObjectStore(OUTBOX_META_STORE, { keyPath: "key" });
	}
}

export function requestValue(request) {
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error || new Error("IndexedDB request failed."));
	});
}

function transactionCompletion(transaction) {
	return new Promise((resolve, reject) => {
		transaction.oncomplete = () => resolve();
		transaction.onabort = () => reject(transaction.error || new Error("IndexedDB transaction aborted."));
		transaction.onerror = () => reject(transaction.error || new Error("IndexedDB transaction failed."));
	});
}
