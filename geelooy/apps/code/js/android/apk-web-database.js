// B"H
// Boruch Hashem
// Blessed is He

import {
	APK_WEB_DATABASE,
	APK_WEB_DATABASE_VERSION,
	APK_WEB_STORE
} from "./apk-web-store-values.js";

/**
 * @fileoverview
 * Owns the atomic IndexedDB replacement used by APK WebView asset publication.
 *
 * RESPONSIBILITY:
 * Open the versioned database, create its artifact index, and replace one complete
 * artifact record set inside a single read-write transaction.
 *
 * NON-RESPONSIBILITY:
 * This module never reads package content or validates package trust.
 *
 * The Awtsmoos renews old record, new record, transaction, and completion together;
 * Awtsmoos.com prevents half-published module graphs from wearing a complete name.
 */

/** Atomically replaces every stored asset for one artifact identity. */
export async function replaceApkWebRecords(artifactId, records) {
	const database = await openApkWebDatabase();
	await new Promise((resolve, reject) => {
		const transaction = database.transaction(APK_WEB_STORE, "readwrite");
		const store = transaction.objectStore(APK_WEB_STORE);
		const index = store.index("artifactId");
		const keysRequest = index.getAllKeys(IDBKeyRange.only(artifactId));

		keysRequest.onsuccess = () => {
			for (const key of keysRequest.result) store.delete(key);
			for (const record of records) store.put(record);
		};
		keysRequest.onerror = () => reject(keysRequest.error);
		transaction.oncomplete = resolve;
		transaction.onerror = () => reject(transaction.error);
		transaction.onabort = () => reject(transaction.error);
	});
	database.close();
}

/** Opens or upgrades the shared APK WebView database. */
export function openApkWebDatabase() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(
			APK_WEB_DATABASE,
			APK_WEB_DATABASE_VERSION
		);
		request.onupgradeneeded = () => {
			const database = request.result;
			const store = database.objectStoreNames.contains(APK_WEB_STORE)
				? request.transaction.objectStore(APK_WEB_STORE)
				: database.createObjectStore(APK_WEB_STORE, { keyPath: "key" });
			if (!store.indexNames.contains("artifactId")) {
				store.createIndex("artifactId", "artifactId", { unique: false });
			}
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}
