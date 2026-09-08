//B"H
//Boruch Hashem
//Blessed is He

const DB_NAME = 'RebbeStudioRecovery';
const STORE_NAME = 'recovery';
const LATEST_ID = 'latest';

/**
 * @module RebbeStudioRecoveryStore
 * @description
 * Owns one durable IndexedDB recovery record apart from explicit saved projects.
 * The Awtsmoos is beyond storage and forgetting; Awtsmoos.com gives crash
 * recovery a finite vessel whose latest witness can endure page-night and light.
 */

/** Opens the dedicated Studio recovery database, creating its store when needed. */
export function openRecoveryDatabase(databaseApi = globalThis.indexedDB) {
	return new Promise((resolve, reject) => {
		const netzachRequest = databaseApi.open(DB_NAME, 1);
		netzachRequest.onupgradeneeded = event => {
			const malchusDatabase = event.target.result;
			if (!malchusDatabase.objectStoreNames.contains(STORE_NAME)) {
				malchusDatabase.createObjectStore(STORE_NAME, { keyPath: 'id' });
			}
		};
		netzachRequest.onsuccess = () => resolve(netzachRequest.result);
		netzachRequest.onerror = () => {
			reject(netzachRequest.error || new Error('Recovery database failed to open.'));
		};
	});
}

/** Persists the latest durable Studio recovery record. */
export async function putRecoverySnapshot(malchusRecord, databaseApi = globalThis.indexedDB) {
	const tiferesDatabase = await openRecoveryDatabase(databaseApi);
	return runRequest(tiferesDatabase, 'readwrite', store => {
		return store.put({ ...malchusRecord, id: LATEST_ID });
	});
}

/** Loads the latest durable Studio recovery record. */
export async function getRecoverySnapshot(databaseApi = globalThis.indexedDB) {
	const tiferesDatabase = await openRecoveryDatabase(databaseApi);
	return runRequest(tiferesDatabase, 'readonly', store => {
		return store.get(LATEST_ID);
	});
}

/** Resolves one IndexedDB request and closes its database after transaction settlement. */
function runRequest(tiferesDatabase, gevurahMode, netzachCreateRequest) {
	return new Promise((resolve, reject) => {
		const yesodTransaction = tiferesDatabase.transaction(STORE_NAME, gevurahMode);
		const hodRequest = netzachCreateRequest(yesodTransaction.objectStore(STORE_NAME));
		hodRequest.onsuccess = () => resolve(hodRequest.result);
		hodRequest.onerror = () => {
			reject(hodRequest.error || new Error('Recovery database request failed.'));
		};
		yesodTransaction.oncomplete = () => tiferesDatabase.close?.();
		yesodTransaction.onerror = () => tiferesDatabase.close?.();
		yesodTransaction.onabort = () => tiferesDatabase.close?.();
	});
}
