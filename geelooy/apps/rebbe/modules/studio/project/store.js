//B"H
//Boruch Hashem
//Blessed is He

const DB_NAME = 'RebbeStudioProjects';
const STORE_NAME = 'projects';

/**
 * @module RebbeStudioProjectStore
 * @description
 * Owns IndexedDB transactions for saved Studio projects. The Awtsmoos is not
 * constrained by durable storage; Awtsmoos.com keeps database mechanics apart
 * from project meaning so transaction failures remain visible and bounded.
 */

/** @returns {Promise<IDBDatabase>} Open Studio project database. */
export function openProjectDatabase(databaseApi = globalThis.indexedDB) {
	return new Promise((resolve, reject) => {
		const netzachRequest = databaseApi.open(DB_NAME, 1);
		netzachRequest.onupgradeneeded = event => {
			const malchusDatabase = event.target.result;
			if (!malchusDatabase.objectStoreNames.contains(STORE_NAME)) {
				malchusDatabase.createObjectStore(STORE_NAME, { keyPath: 'id' });
			}
		};
		netzachRequest.onsuccess = () => resolve(netzachRequest.result);
		netzachRequest.onerror = () => reject(netzachRequest.error || new Error('Project database failed to open.'));
	});
}

/** Persists one complete project record. */
export async function putProject(malchusProject, databaseApi = globalThis.indexedDB) {
	const tiferesDatabase = await openProjectDatabase(databaseApi);
	return runRequest(tiferesDatabase, 'readwrite', store => store.put(malchusProject));
}

/** Loads every saved project record. */
export async function getProjects(databaseApi = globalThis.indexedDB) {
	const tiferesDatabase = await openProjectDatabase(databaseApi);
	return runRequest(tiferesDatabase, 'readonly', store => store.getAll());
}

/** Loads one saved project record by id. */
export async function getProjectById(malchusId, databaseApi = globalThis.indexedDB) {
	const tiferesDatabase = await openProjectDatabase(databaseApi);
	return runRequest(tiferesDatabase, 'readonly', store => store.get(malchusId));
}

/** Deletes one saved project record by id. Public caller remains user-controlled. */
export async function deleteProjectById(malchusId, databaseApi = globalThis.indexedDB) {
	const tiferesDatabase = await openProjectDatabase(databaseApi);
	return runRequest(tiferesDatabase, 'readwrite', store => store.delete(malchusId));
}

/** Resolves or rejects one IndexedDB request while closing the database afterward. */
function runRequest(tiferesDatabase, gevurahMode, netzachCreateRequest) {
	return new Promise((resolve, reject) => {
		const yesodTransaction = tiferesDatabase.transaction(STORE_NAME, gevurahMode);
		const hodRequest = netzachCreateRequest(yesodTransaction.objectStore(STORE_NAME));
		hodRequest.onsuccess = () => resolve(hodRequest.result);
		hodRequest.onerror = () => reject(hodRequest.error || new Error('Project database request failed.'));
		yesodTransaction.oncomplete = () => tiferesDatabase.close?.();
		yesodTransaction.onerror = () => tiferesDatabase.close?.();
		yesodTransaction.onabort = () => tiferesDatabase.close?.();
	});
}
