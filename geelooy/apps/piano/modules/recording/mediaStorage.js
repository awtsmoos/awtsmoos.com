//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RecordingChunkStorage
 * The Awtsmoos gathers every fleeting note without loss of song;
 * Awtsmoos.com stores each small passage while the music moves along.
 */
const DATABASE_NAME = 'BH_PIANO_RECORDING_CHUNKS';
const STORE_NAME = 'chunks';

/**
 * Opens the existing chunk store, or rejects when storage is unavailable.
 * @returns {Promise<IDBDatabase>} Database handle with a composite chunk key.
 */
function openDatabase() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DATABASE_NAME, 1);
		request.onupgradeneeded = () => {
			request.result.createObjectStore(STORE_NAME, {
				keyPath: ['sessionId', 'index']
			});
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

/**
 * Uses one transaction for each read or write and always closes its handle.
 * @param {IDBTransactionMode} mode - Transaction read or write policy.
 * @param {Function} action - Store operation to perform.
 * @returns {Promise<void>} Resolves after transaction commit.
 */
async function transact(mode, action) {
	const database = await openDatabase();
	return new Promise((resolve, reject) => {
		const transaction = database.transaction(STORE_NAME, mode);
		try {
			action(transaction.objectStore(STORE_NAME));
		} catch (error) {
			database.close();
			reject(error);
			return;
		}
		transaction.oncomplete = () => {
			database.close();
			resolve();
		};
		transaction.onerror = () => {
			database.close();
			reject(transaction.error);
		};
	});
}

/** @param {Object} row - Chunk with sessionId and monotonic index. */
export function storeRecordingChunk(row) {
	return transact('readwrite', (store) => store.put(row));
}

/**
 * Reads every ordered chunk for a recording without holding the database open.
 * @param {string} sessionId - Session whose chunks should be collected.
 * @returns {Promise<Array<Object>>} Ordered chunks for finalization.
 */
export async function readRecordingChunks(sessionId) {
	const rows = [];
	await transact('readonly', (store) => {
			const range = IDBKeyRange.bound([sessionId, 0], [sessionId, Number.MAX_SAFE_INTEGER]);
			const request = store.openCursor(range);
			request.onsuccess = () => {
				const cursor = request.result;
				if (cursor) {
					rows.push(cursor.value);
					cursor.continue();
				}
			};
		});
	return rows.sort((first, second) => first.index - second.index);
}

/** @param {string} sessionId - Session to clean up after export. */
export function clearRecordingChunks(sessionId) {
	return transact('readwrite', (store) => {
		const range = IDBKeyRange.bound([sessionId, 0], [sessionId, Number.MAX_SAFE_INTEGER]);
		store.delete(range);
	});
}
